const { json, corsHeaders } = require('./lib/http');
const { getSupabaseAdmin } = require('./lib/supabaseAdmin');

exports.handler = async () => {
  try {
    const supabase = getSupabaseAdmin();
    
    // Check if memories bucket exists
    const { data: buckets, error: bucketsError } = await supabase
      .storage
      .listBuckets();

    if (bucketsError) {
      return json(500, { 
        error: 'Failed to list buckets', 
        details: bucketsError.message 
      }, corsHeaders());
    }

    const memoriesBucket = buckets?.find(b => b.name === 'memories');

    if (!memoriesBucket) {
      // Try to create the bucket
      const { data: newBucket, error: createError } = await supabase
        .storage
        .createBucket('memories', {
          public: true,
          fileSizeLimit: 8388608 // 8MB
        });

      if (createError) {
        return json(500, {
          error: 'Memories bucket does not exist and failed to create',
          details: createError.message,
          buckets: buckets?.map(b => b.name)
        }, corsHeaders());
      }

      return json(200, {
        message: 'Memories bucket created successfully',
        bucket: newBucket,
        allBuckets: buckets?.map(b => b.name)
      }, corsHeaders());
    }

    return json(200, {
      message: 'Memories bucket exists',
      bucket: memoriesBucket,
      allBuckets: buckets?.map(b => b.name)
    }, corsHeaders());

  } catch (e) {
    return json(500, { 
      error: 'Unexpected error', 
      details: e?.message || String(e) 
    }, corsHeaders());
  }
};
