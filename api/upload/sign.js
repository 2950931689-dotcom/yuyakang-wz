import { requireAdminSession } from '../_lib/adminAuth.js';
import { readJsonRequestBody } from '../_lib/requestBody.js';
import { createSignedUpload, buildPublicStorageUrl } from '../_lib/uploadStorage.js';
import { validateSignBody } from '../_lib/uploadValidate.js';

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  res.setHeader('Content-Type', 'application/json; charset=utf-8');

  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const auth = requireAdminSession(req);
  if (auth.error) {
    return res.status(auth.error.status).json(auth.error.body);
  }

  let body;
  try {
    body = await readJsonRequestBody(req);
  } catch {
    return res.status(400).json({ ok: false, error: 'Invalid request body' });
  }

  const validation = validateSignBody(body);
  if (!validation.ok) {
    return res.status(validation.status).json({ ok: false, error: validation.error });
  }

  const { filename, mimeType, size, bucket, path, type, uploadedAt } = validation.data;

  const signed = await createSignedUpload(bucket, path);
  if (!signed.ok) {
    return res.status(signed.status).json({
      ok: false,
      error: signed.error,
      ...(signed.source ? { source: signed.source } : {}),
    });
  }

  const publicUrl = buildPublicStorageUrl(bucket, signed.path);

  res.setHeader('X-Upload-Target', 'supabase-storage');
  res.setHeader('X-Upload-Bucket', bucket);

  return res.status(200).json({
    ok: true,
    bucket,
    path: signed.path,
    token: signed.token,
    signedUrl: signed.signedUrl,
    publicUrl,
    file: {
      url: publicUrl,
      filename,
      size,
      mimeType,
      type,
      uploadedAt,
    },
  });
}
