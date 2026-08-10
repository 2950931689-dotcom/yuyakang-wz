import { loadSiteContent } from './_lib/contentReader.js';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  res.setHeader('Cache-Control', 'no-store');
  res.setHeader('Content-Type', 'application/json; charset=utf-8');

  try {
    const result = await loadSiteContent();

    if (result.content) {
      res.setHeader('X-Content-Source', result.source);
      res.setHeader('X-Content-Sections', String(result.sectionCount ?? 0));
      return res.status(200).json(result.content);
    }

    return res.status(503).json({
      error: 'Content source unavailable',
      source: result.errorSource || 'error',
    });
  } catch {
    return res.status(503).json({
      error: 'Content source unavailable',
      source: 'error',
    });
  }
}
