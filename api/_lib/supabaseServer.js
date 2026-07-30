import { createClient } from '@supabase/supabase-js';

const REQUIRED_ENV = ['SUPABASE_URL', 'SUPABASE_SERVICE_ROLE_KEY'];
const JWT_PATTERN = /^eyJ[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+$/;

/**
 * Returns { missing: string[] } when Supabase env is incomplete, otherwise null.
 * For use in Vercel /api serverless functions only — never import from src/.
 */
export function getSupabaseConfigError() {
  const missing = REQUIRED_ENV.filter((key) => !process.env[key]?.trim());
  if (missing.length === 0) return null;
  return { missing };
}

/**
 * Safe diagnostics — never includes key material or full URLs with secrets.
 */
export function buildDiagnostics() {
  const url = process.env.SUPABASE_URL?.trim() || '';
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim() || '';

  let supabaseHost = null;
  let urlLooksValid = false;
  let urlProtocol = null;
  let urlHasPath = false;

  if (url) {
    try {
      const parsed = new URL(url);
      supabaseHost = parsed.hostname;
      urlProtocol = parsed.protocol;
      urlHasPath = parsed.pathname !== '/' && parsed.pathname !== '';
      urlLooksValid = true;
    } catch {
      urlLooksValid = false;
    }
  }

  return {
    hasSupabaseUrl: Boolean(url),
    hasServiceRoleKey: Boolean(key),
    supabaseHost,
    urlLooksValid,
    urlProtocol,
    urlHasPath,
    serviceRoleKeyLooksLikeJwt: JWT_PATTERN.test(key),
    serviceRoleKeyLength: key.length,
    nodeEnv: process.env.NODE_ENV || null,
  };
}

export function validateSupabaseUrl(urlRaw) {
  const url = urlRaw?.trim();
  if (!url) {
    return { ok: false, code: 'MISSING', missing: ['SUPABASE_URL'] };
  }

  let parsed;
  try {
    parsed = new URL(url);
  } catch {
    return { ok: false, code: 'INVALID_URL', error: 'Invalid SUPABASE_URL' };
  }

  if (parsed.protocol !== 'https:') {
    return {
      ok: false,
      code: 'INVALID_URL',
      error: 'SUPABASE_URL must start with https://',
    };
  }

  if (!parsed.hostname.endsWith('.supabase.co')) {
    return {
      ok: false,
      code: 'INVALID_URL',
      error: 'SUPABASE_URL host does not look like a Supabase project host',
    };
  }

  return { ok: true, parsed };
}

export function validateServiceRoleKey(keyRaw) {
  const key = keyRaw?.trim();
  if (!key) {
    return { ok: false, code: 'MISSING', missing: ['SUPABASE_SERVICE_ROLE_KEY'] };
  }

  if (!JWT_PATTERN.test(key)) {
    return {
      ok: false,
      code: 'INVALID_KEY_SHAPE',
      error: 'SUPABASE_SERVICE_ROLE_KEY does not look like a JWT',
    };
  }

  return { ok: true };
}

/**
 * Creates a Supabase admin client (service role). Throws with code NOT_CONFIGURED
 * when env vars are missing.
 */
export function createSupabaseAdmin() {
  const configError = getSupabaseConfigError();
  if (configError) {
    const err = new Error('Supabase environment variables are not configured');
    err.code = 'NOT_CONFIGURED';
    err.missing = configError.missing;
    throw err;
  }

  return createClient(
    process.env.SUPABASE_URL.trim(),
    process.env.SUPABASE_SERVICE_ROLE_KEY.trim(),
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    },
  );
}

function isMissingTableError(error) {
  const code = error?.code || '';
  const message = (error?.message || '').toLowerCase();

  return (
    code === '42P01' ||
    code === 'PGRST205' ||
    message.includes('does not exist') ||
    message.includes('could not find the table') ||
    message.includes('schema cache')
  );
}

function redactSecrets(text) {
  return String(text || '')
    .replace(/eyJ[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+/g, '[redacted]')
    .replace(/Bearer\s+\S+/gi, 'Bearer [redacted]')
    .slice(0, 200);
}

/**
 * Short, safe table-level error for health diagnostics.
 */
export function sanitizeTableError(error) {
  if (!error) return null;
  if (isMissingTableError(error)) {
    return 'Table not found';
  }

  const message = redactSecrets(error.message);
  if (message.toLowerCase().includes('permission denied')) {
    return 'Permission denied';
  }
  if (message.toLowerCase().includes('invalid api key')) {
    return 'Invalid API key';
  }

  return message || 'Query failed';
}

/**
 * Safe connection-level error fields for health responses.
 */
export function sanitizeConnectionError(error) {
  const errorName = error?.name || 'Error';
  let errorMessage = redactSecrets(error?.message || 'Supabase connection failed');

  if (errorMessage.toLowerCase().includes('fetch failed')) {
    errorMessage = 'Network request to Supabase failed';
  } else if (errorMessage.toLowerCase().includes('invalid api key')) {
    errorMessage = 'Invalid Supabase API key';
  }

  return { errorName, errorMessage };
}

/**
 * Per-table probe — never throws; returns readable flag and optional error text.
 */
export async function checkTableStatus(supabase, tableName) {
  const { error } = await supabase
    .from(tableName)
    .select('*', { head: true, count: 'exact', limit: 1 });

  if (!error) {
    return { readable: true, error: null, isMissing: false };
  }

  if (isMissingTableError(error)) {
    return { readable: false, error: sanitizeTableError(error), isMissing: true };
  }

  return {
    readable: false,
    error: sanitizeTableError(error),
    isMissing: false,
    isConnectionIssue: true,
  };
}

/**
 * Lightweight connectivity probe via site_content.
 * Missing table still counts as reachable Supabase REST API.
 */
export async function probeSupabaseConnection(supabase) {
  const { error } = await supabase
    .from('site_content')
    .select('*', { head: true, limit: 1 });

  if (!error) {
    return { connected: true, probeError: null };
  }

  if (isMissingTableError(error)) {
    return { connected: true, probeError: null };
  }

  return { connected: false, probeError: error };
}
