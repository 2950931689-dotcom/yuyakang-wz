import {
  buildDiagnostics,
  checkTableStatus,
  createSupabaseAdmin,
  getSupabaseConfigError,
  runDirectFetchCheck,
  runSdkCheck,
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
    try {
      const result = await checkTableStatus(supabase, tableName);
      tables[tableName] = result.readable;
      if (result.error) {
        tableErrors[tableName] = result.error;
      }
    } catch (error) {
      tables[tableName] = false;
      tableErrors[tableName] =
        error?.message?.includes('does not exist')
          ? 'relation does not exist'
          : 'Query failed';
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

  const supabaseUrl = process.env.SUPABASE_URL.trim();

  // 1) Network-only probe — never sends Authorization / apikey / service role.
  const directFetchCheck = await runDirectFetchCheck(supabaseUrl);

  // 2) SDK probe — independent of direct fetch.
  let sdkCheck = {
    attempted: false,
    success: false,
    errorName: null,
    errorMessage: null,
    causeName: null,
    causeCode: null,
    causeMessage: null,
  };
  let tables = null;
  let tableErrors = null;

  try {
    const supabase = createSupabaseAdmin();
    sdkCheck = await runSdkCheck(supabase);

    // Table checks stay independent; missing tables ≠ unreachable.
    if (sdkCheck.success) {
      const inspected = await inspectTables(supabase);
      tables = inspected.tables;
      tableErrors = inspected.tableErrors;
    } else {
      // Still attempt per-table reads when possible for clearer tableErrors.
      try {
        const inspected = await inspectTables(supabase);
        tables = inspected.tables;
        tableErrors = inspected.tableErrors;
      } catch {
        /* ignore — SDK already failed */
      }
    }
  } catch (error) {
    sdkCheck = {
      attempted: true,
      success: false,
      errorName: error?.name || 'Error',
      errorMessage: 'fetch failed',
      causeName: error?.cause?.name || null,
      causeCode: error?.cause?.code ? String(error.cause.code) : null,
      causeMessage: error?.cause?.message
        ? String(error.cause.message).slice(0, 120)
        : null,
    };
  }

  if (!directFetchCheck.reachable) {
    return errorResponse(res, 503, {
      ok: false,
      ...base,
      supabase: 'network_error',
      directFetchCheck,
      sdkCheck,
      diagnostics,
    });
  }

  if (!sdkCheck.success) {
    const payload = {
      ok: false,
      ...base,
      supabase: 'sdk_error',
      directFetchCheck,
      sdkCheck,
      diagnostics,
    };
    if (tables) payload.tables = tables;
    if (tableErrors && Object.keys(tableErrors).length > 0) {
      payload.tableErrors = tableErrors;
    }
    return errorResponse(res, 503, payload);
  }

  const payload = {
    ok: true,
    ...base,
    supabase: 'connected',
    directFetchCheck,
    sdkCheck,
    tables,
    diagnostics,
  };

  if (tableErrors && Object.keys(tableErrors).length > 0) {
    payload.tableErrors = tableErrors;
  }

  return res.status(200).json(payload);
}
