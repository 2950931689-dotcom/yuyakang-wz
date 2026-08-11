import { requireAdminSession } from '../_lib/adminAuth.js';
import {
  deleteMediaAssetByFilename,
  isSafeMediaFilename,
} from '../_lib/mediaAssets.js';

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  res.setHeader('Content-Type', 'application/json; charset=utf-8');

  if (req.method !== 'DELETE') {
    res.setHeader('Allow', 'DELETE');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const auth = requireAdminSession(req);
  if (auth.error) {
    return res.status(auth.error.status).json(auth.error.body);
  }

  const raw = Array.isArray(req.query.filename) ? req.query.filename[0] : req.query.filename;
  let filename = typeof raw === 'string' ? raw : '';

  try {
    filename = decodeURIComponent(filename);
  } catch {
    return res.status(400).json({ ok: false, error: 'Invalid filename' });
  }

  if (!isSafeMediaFilename(filename)) {
    return res.status(400).json({ ok: false, error: 'Invalid filename' });
  }

  const result = await deleteMediaAssetByFilename(filename);
  if (!result.ok) {
    return res.status(result.status).json({
      ok: false,
      error: result.error,
      ...(result.source ? { source: result.source } : {}),
    });
  }

  res.setHeader('X-Media-Source', 'supabase');
  return res.status(200).json({ ok: true, deleted: true, id: result.id });
}
