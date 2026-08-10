/**
 * Parse JSON request body across Vercel / Node handler variants.
 * Handles parsed object, JSON string, Buffer, or unread stream.
 */
export async function readJsonRequestBody(req) {
  let body = req?.body;

  if (body == null || body === '') {
    body = await readStreamBody(req);
  }

  if (Buffer.isBuffer(body)) {
    const text = body.toString('utf8').trim();
    return text ? JSON.parse(text) : null;
  }

  if (typeof body === 'string') {
    const text = body.trim();
    return text ? JSON.parse(text) : null;
  }

  if (typeof body === 'object') {
    return body;
  }

  return null;
}

async function readStreamBody(req) {
  if (!req || typeof req.on !== 'function') return null;

  return new Promise((resolve, reject) => {
    const chunks = [];
    req.on('data', (chunk) => chunks.push(chunk));
    req.on('end', () => {
      const text = Buffer.concat(chunks).toString('utf8').trim();
      if (!text) return resolve(null);
      try {
        resolve(JSON.parse(text));
      } catch (err) {
        reject(err);
      }
    });
    req.on('error', reject);
  });
}
