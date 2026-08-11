import { requireAdminSession } from './_lib/adminAuth.js';
import { listMediaAssets } from './_lib/mediaAssets.js';

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  res.setHeader('Content-Type', 'application/json; charset=utf-8');

  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const auth = requireAdminSession(req);
  if (auth.error) {
    return res.status(auth.error.status).json(auth.error.body);
  }

  const result = await listMediaAssets();
  if (!result.ok) {
    return res.status(result.status).json({
      ok: false,
      error: result.error,
      ...(result.source ? { source: result.source } : {}),
    });
  }

  res.setHeader('X-Media-Source', 'supabase');
  return res.status(200).json({ ok: true, files: result.files });
}
