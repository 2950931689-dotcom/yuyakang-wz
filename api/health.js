import {
  buildDiagnostics,
  checkTableStatus,
  createSupabaseAdmin,
  getSupabaseConfigError,
  probeSupabaseConnection,
  sanitizeConnectionError,
  validateServiceRoleKey,
  validateSupabaseUrl,
} from './_lib/supabaseServer.js';

const TABLE_NAMES = ['site_content', 'media_assets', 'bookings'];

function basePayload() {
  return {
    mode: 'vercel-supabase',
    runtime: 'vercel-function',
    timestamp: new Date().toISOString(),
  };
}

function errorResponse(res, status, payload) {
  return res.status(status).json(payload);
}

async function inspectTables(supabase) {
  const tables = {};
  const tableErrors = {};

  for (const tableName of TABLE_NAMES) {
    const result = await checkTableStatus(supabase, tableName);
    tables[tableName] = result.readable;
    if (result.error) {
      tableErrors[tableName] = result.error;
    }
  }

  return { tables, tableErrors };
}

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const base = basePayload();
  const diagnostics = buildDiagnostics();

  const configError = getSupabaseConfigError();
  if (configError) {
    return errorResponse(res, 503, {
      ok: false,
      ...base,
      supabase: 'not_configured',
      missing: configError.missing,
      diagnostics,
    });
  }

  const urlCheck = validateSupabaseUrl(process.env.SUPABASE_URL);
  if (!urlCheck.ok) {
    if (urlCheck.code === 'MISSING') {
      return errorResponse(res, 503, {
        ok: false,
        ...base,
        supabase: 'not_configured',
        missing: urlCheck.missing,
        diagnostics,
      });
    }

    return errorResponse(res, 503, {
      ok: false,
      ...base,
      supabase: 'invalid_url',
      error: urlCheck.error,
      diagnostics,
    });
  }

  const keyCheck = validateServiceRoleKey(process.env.SUPABASE_SERVICE_ROLE_KEY);
  if (!keyCheck.ok) {
    if (keyCheck.code === 'MISSING') {
      return errorResponse(res, 503, {
        ok: false,
        ...base,
        supabase: 'not_configured',
        missing: keyCheck.missing,
        diagnostics,
      });
    }

    return errorResponse(res, 503, {
      ok: false,
      ...base,
      supabase: 'invalid_key_shape',
      error: keyCheck.error,
      diagnostics,
    });
  }

  try {
    const supabase = createSupabaseAdmin();
    const probe = await probeSupabaseConnection(supabase);

    if (!probe.connected) {
      const { errorName, errorMessage } = sanitizeConnectionError(probe.probeError);
      return errorResponse(res, 503, {
        ok: false,
        ...base,
        supabase: 'error',
        errorName,
        errorMessage,
        diagnostics,
      });
    }

    const { tables, tableErrors } = await inspectTables(supabase);
    const payload = {
      ok: true,
      ...base,
      supabase: 'connected',
      tables,
      diagnostics,
    };

    if (Object.keys(tableErrors).length > 0) {
      payload.tableErrors = tableErrors;
    }

    return res.status(200).json(payload);
  } catch (error) {
    const { errorName, errorMessage } = sanitizeConnectionError(error);
    return errorResponse(res, 503, {
      ok: false,
      ...base,
      supabase: 'error',
      errorName,
      errorMessage,
      diagnostics,
    });
  }
}
