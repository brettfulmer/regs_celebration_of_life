const { json, corsHeaders, handleOptions } = require('./lib/http');
const { parseJson } = require('./lib/parseJson');
const { parseMultipart } = require('./lib/parseMultipart');
const { getSupabaseAdmin } = require('./lib/supabaseAdmin');
const { getPolaroidPrompt } = require('./lib/polaroidPrompt');
const { transformToPolaroid } = require('./lib/nanoBanana');

function clampRotation(n) {
  const v = Number.isFinite(n) ? n : 0;
  return Math.max(-5, Math.min(5, v));
}

function randomRotation() {
  return Math.floor(Math.random() * 11) - 5;
}

function extFromMime(mimeType) {
  if (!mimeType) return 'jpg';
  if (mimeType === 'image/png') return 'png';
  if (mimeType === 'image/webp') return 'webp';
  if (mimeType === 'image/gif') return 'gif';
  return 'jpg';
}

function getBucket() {
  return process.env.SUPABASE_BUCKET || 'memories';
}

async function ensureBucket(supabase, bucketName) {
  try {
    const { data: buckets } = await supabase.storage.listBuckets();
    const exists = buckets?.some(b => b.name === bucketName);

    if (!exists) {
      await supabase.storage.createBucket(bucketName, {
        public: true,
        fileSizeLimit: 8388608 // 8MB
      });
    }
    return true;
  } catch (e) {
    console.error('Error ensuring bucket:', e);
    return false;
  }
}

function publicUrlFor(supabase, bucket, path) {
  if (!path) return undefined;
  const { data } = supabase.storage.from(bucket).getPublicUrl(path);
  return data?.publicUrl;
}

exports.handler = async (event) => {
  console.log('[memories] Request:', event.httpMethod, event.path);

  const options = handleOptions(event);
  if (options) return options;

  try {
    console.log('[memories] Getting Supabase admin client...');
    const supabase = getSupabaseAdmin();
    const bucket = getBucket();
    console.log('[memories] Using bucket:', bucket);

    if (event.httpMethod === 'GET') {
      console.log('[memories] Fetching memories from database...');
      const { data, error } = await supabase
        .from('memories')
        .select('id,name,relationship,message,image_path,polaroid_path,created_at,approved,rotation')
        .eq('approved', true)
        .order('created_at', { ascending: false })
        .limit(200);

      if (error) {
        console.error('[memories] Database error:', error);
        return json(500, { error: error.message }, corsHeaders());
      }

      console.log('[memories] Found', data?.length || 0, 'memories');

      console.log('[memories] Mapping memories...');
      const memories = (data || []).map((m) => ({
        id: m.id,
        name: m.name,
        relationship: m.relationship ?? undefined,
        message: m.message,
        imageUrl: publicUrlFor(supabase, bucket, m.image_path),
        polaroidUrl: publicUrlFor(supabase, bucket, m.polaroid_path),
        createdAt: m.created_at,
        approved: m.approved,
        rotation: clampRotation(m.rotation)
      }));

      console.log('[memories] Returning', memories.length, 'memories');
      return json(200, { memories }, corsHeaders());
    }

    if (event.httpMethod !== 'POST') {
      return json(405, { error: 'Method not allowed' }, corsHeaders());
    }

    const contentType = event.headers['content-type'] || event.headers['Content-Type'] || '';

    let name = '';
    let relationship = '';
    let message = '';
    /** @type {{ filename: string, mimeType: string, buffer: Buffer } | null} */
    let file = null;

    if (contentType.includes('multipart/form-data')) {
      const parsed = await parseMultipart(event);
      name = (parsed.fields.name || '').toString();
      relationship = (parsed.fields.relationship || '').toString();
      message = (parsed.fields.message || '').toString();
      file = parsed.file;
    } else {
      const body = parseJson(event) || {};
      name = (body.name || '').toString();
      relationship = (body.relationship || '').toString();
      message = (body.message || '').toString();
    }

    if (!message.trim()) {
      return json(400, { error: 'Message is required' }, corsHeaders());
    }

    const autoApprove = (process.env.MEMORIES_AUTO_APPROVE ?? 'true') === 'true';

    let imagePath = null;
    let polaroidPath = null;

    if (file && file.buffer && file.buffer.length > 0) {
      // Ensure bucket exists
      await ensureBucket(supabase, bucket);

      const idPart = crypto.randomUUID();
      const ext = extFromMime(file.mimeType);
      imagePath = `uploads/${idPart}.${ext}`;

      const up1 = await supabase.storage
        .from(bucket)
        .upload(imagePath, file.buffer, { contentType: file.mimeType, upsert: false });

      if (up1.error) {
        console.error('Upload error:', up1.error);
        return json(500, {
          error: `Failed to upload image: ${up1.error.message}`,
          details: up1.error
        }, corsHeaders());
      }

      // Transform to polaroid via Nano Banana provider
      try {
        const prompt = getPolaroidPrompt();
        const { pngBuffer } = await transformToPolaroid({
          prompt,
          imageBuffer: file.buffer,
          mimeType: file.mimeType
        });

        polaroidPath = `polaroids/${idPart}.png`;

        const up2 = await supabase.storage
          .from(bucket)
          .upload(polaroidPath, pngBuffer, { contentType: 'image/png', upsert: false });

        if (up2.error) {
          console.error('Polaroid upload error:', up2.error);
          // Don't fail the whole request if polaroid creation fails
          // Just use the original image
          polaroidPath = null;
        }
      } catch (transformError) {
        console.error('Polaroid transform error:', transformError);
        // Don't fail the whole request if polaroid creation fails
        polaroidPath = null;
      }
    }

    const rotation = randomRotation();

    const insert = await supabase
      .from('memories')
      .insert({
        name: name.trim() || 'Anonymous',
        relationship: relationship.trim() || null,
        message: message.trim(),
        image_path: imagePath,
        polaroid_path: polaroidPath,
        approved: autoApprove,
        rotation
      })
      .select('id,name,relationship,message,image_path,polaroid_path,created_at,approved,rotation')
      .single();

    if (insert.error) {
      return json(500, { error: insert.error.message }, corsHeaders());
    }

    const m = insert.data;
    const memory = {
      id: m.id,
      name: m.name,
      relationship: m.relationship ?? undefined,
      message: m.message,
      imageUrl: publicUrlFor(supabase, bucket, m.image_path),
      polaroidUrl: publicUrlFor(supabase, bucket, m.polaroid_path),
      createdAt: m.created_at,
      approved: m.approved,
      rotation: clampRotation(m.rotation)
    };

    return json(
      200,
      {
        success: true,
        message: autoApprove
          ? "Thank you for sharing this beautiful memory. It's now part of the Polaroid wall."
          : "Thank you for sharing this memory. It will appear once it's been reviewed.",
        memory
      },
      corsHeaders()
    );
  } catch (e) {
    console.error('[memories] Function error:', e);
    console.error('[memories] Stack:', e?.stack);
    return json(500, {
      error: e?.message || 'Unknown error',
      stack: e?.stack
    }, corsHeaders());
  }
};
