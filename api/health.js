import {
  checkTableReadable,
  createSupabaseAdmin,
  getSupabaseConfigError,
} from './_lib/supabaseServer.js';

function basePayload() {
  return {
    mode: 'vercel-supabase',
    runtime: 'vercel-function',
    timestamp: new Date().toISOString(),
  };
}

function sanitizeErrorMessage(error) {
  if (error?.code === 'NOT_CONFIGURED') {
    return 'Supabase not configured';
  }

  const message = String(error?.message || 'Supabase connection failed');

  if (message.toLowerCase().includes('fetch failed')) {
    return 'Unable to reach Supabase';
  }

  if (message.toLowerCase().includes('invalid api key')) {
    return 'Invalid Supabase credentials';
  }

  return message.slice(0, 200);
}

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const base = basePayload();
  const configError = getSupabaseConfigError();

  if (configError) {
    return res.status(503).json({
      ok: false,
      ...base,
      supabase: 'not_configured',
      missing: configError.missing,
    });
  }

  try {
    const supabase = createSupabaseAdmin();

    const tables = {
      site_content: await checkTableReadable(supabase, 'site_content'),
      media_assets: await checkTableReadable(supabase, 'media_assets'),
      bookings: false,
    };

    try {
      tables.bookings = await checkTableReadable(supabase, 'bookings');
    } catch {
      tables.bookings = false;
    }

    return res.status(200).json({
      ok: true,
      ...base,
      supabase: 'connected',
      tables,
    });
  } catch (error) {
    return res.status(503).json({
      ok: false,
      ...base,
      supabase: 'error',
      error: sanitizeErrorMessage(error),
    });
  }
}
