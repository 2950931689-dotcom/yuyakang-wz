import { requireAdminSession } from '../../_lib/adminAuth.js';
import { writeContentSection } from '../../_lib/contentWriter.js';

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  res.setHeader('Content-Type', 'application/json; charset=utf-8');

  if (req.method !== 'PATCH') {
    res.setHeader('Allow', 'PATCH');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const sectionKey = Array.isArray(req.query.key) ? req.query.key[0] : req.query.key;
  if (!sectionKey || typeof sectionKey !== 'string') {
    return res.status(400).json({ error: 'Invalid content section' });
  }

  const auth = requireAdminSession(req);
  if (auth.error) {
    return res.status(auth.error.status).json(auth.error.body);
  }

  let body = req.body;
  if (typeof body === 'string') {
    try {
      body = JSON.parse(body);
    } catch {
      return res.status(400).json({ error: 'Invalid request body' });
    }
  }

  const result = await writeContentSection(sectionKey, body);

  if (!result.ok) {
    return res.status(result.status).json({
      error: result.error,
      ...(result.source ? { source: result.source } : {}),
    });
  }

  res.setHeader('X-Content-Write-Target', 'supabase');
  res.setHeader('X-Content-Section', sectionKey);

  return res.status(200).json({
    ok: true,
    sectionKey: result.sectionKey,
    data: result.data,
    updatedAt: result.updatedAt,
  });
}
