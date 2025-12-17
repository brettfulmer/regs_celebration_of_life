const Busboy = require('busboy');

function parseMultipart(event) {
  return new Promise((resolve, reject) => {
    const contentType = event.headers['content-type'] || event.headers['Content-Type'];
    if (!contentType || !contentType.includes('multipart/form-data')) {
      reject(new Error('Expected multipart/form-data'));
      return;
    }

    const busboy = Busboy({
      headers: { 'content-type': contentType },
      limits: { fileSize: 8 * 1024 * 1024 }
    });

    const fields = {};
    /** @type {{ filename: string, mimeType: string, buffer: Buffer } | null} */
    let file = null;

    busboy.on('field', (name, val) => {
      fields[name] = val;
    });

    busboy.on('file', (name, stream, info) => {
      if (name !== 'image') {
        stream.resume();
        return;
      }

      const chunks = [];
      stream.on('data', (d) => chunks.push(d));
      stream.on('limit', () => reject(new Error('File too large')));
      stream.on('end', () => {
        file = {
          filename: info.filename,
          mimeType: info.mimeType,
          buffer: Buffer.concat(chunks)
        };
      });
    });

    busboy.on('error', reject);

    busboy.on('finish', () => {
      resolve({ fields, file });
    });

    const bodyBuffer = event.isBase64Encoded ? Buffer.from(event.body || '', 'base64') : Buffer.from(event.body || '', 'utf8');
    busboy.end(bodyBuffer);
  });
}

module.exports = { parseMultipart };
