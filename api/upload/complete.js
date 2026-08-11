import { requireAdminSession } from '../_lib/adminAuth.js';
import { completeMediaUpload } from '../_lib/mediaAssets.js';
import { readJsonRequestBody } from '../_lib/requestBody.js';
import {
  buildPublicStorageUrl,
  storageObjectExists,
} from '../_lib/uploadStorage.js';
import { validateCompleteBody } from '../_lib/uploadValidate.js';

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

  const validation = validateCompleteBody(body);
  if (!validation.ok) {
    return res.status(validation.status).json({ ok: false, error: validation.error });
  }

  const { bucket, path, filename, mimeType, size, type, uploadedAt } = validation.data;

  const publicUrl = buildPublicStorageUrl(bucket, path);
  if (!publicUrl) {
    return res.status(503).json({
      ok: false,
      error: 'Storage unavailable',
      source: 'not_configured',
    });
  }

  const existsCheck = await storageObjectExists(bucket, path);
  if (existsCheck.ok && !existsCheck.exists) {
    return res.status(400).json({
      ok: false,
      error: 'Uploaded object not found in storage',
    });
  }

  const register = await completeMediaUpload(
    {
      bucket,
      path,
      filename,
      mimeType,
      size,
      type,
      publicUrl,
      uploadedAt,
    },
    {
      context: typeof body.context === 'string' ? body.context.slice(0, 64) : null,
      usage: typeof body.usage === 'string' ? body.usage.slice(0, 64) : null,
    }
  );

  if (!register.ok) {
    return res.status(register.status).json({
      ok: false,
      error: register.error,
      ...(register.source ? { source: register.source } : {}),
    });
  }

  res.setHeader('X-Upload-Target', 'supabase-storage');
  res.setHeader('X-Upload-Bucket', bucket);

  return res.status(201).json({
    ok: true,
    file: {
      url: publicUrl,
      filename,
      size,
      mimeType,
      type,
      uploadedAt,
    },
    asset: register.asset,
  });
}
