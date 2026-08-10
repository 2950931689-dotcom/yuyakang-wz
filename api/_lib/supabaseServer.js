import { createClient } from '@supabase/supabase-js';

const REQUIRED_ENV = ['SUPABASE_URL', 'SUPABASE_SERVICE_ROLE_KEY'];
/** Basic JWT shape only — never decode payload. */
const JWT_PATTERN = /^[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+$/;
const MIN_JWT_LENGTH = 80;

/**
 * Returns { missing: string[] } when Supabase env is incomplete, otherwise null.
 * For use in Vercel /api serverless functions only — never import from src/.
 */
export function getSupabaseConfigError() {
  const missing = REQUIRED_ENV.filter((key) => !process.env[key]?.trim());
  if (missing.length === 0) return null;
  return { missing };
}

function looksLikeJwt(key) {
  if (typeof key !== 'string') return false;
  const trimmed = key.trim();
  if (trimmed.length < MIN_JWT_LENGTH) return false;
  const dots = (trimmed.match(/\./g) || []).length;
  if (dots !== 2) return false;
  return JWT_PATTERN.test(trimmed);
}

/**
 * Safe diagnostics — never includes key material, prefixes/suffixes, or full secrets.
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
      urlHasPath = Boolean(
        (parsed.pathname && parsed.pathname !== '/') || parsed.search || parsed.hash
      );
      const hostOk = parsed.hostname.endsWith('.supabase.co');
      const protocolOk = parsed.protocol === 'https:';
      urlLooksValid = protocolOk && hostOk && !urlHasPath;
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
    serviceRoleKeyLooksLikeJwt: looksLikeJwt(key),
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

  const hasPath = Boolean(
    (parsed.pathname && parsed.pathname !== '/') || parsed.search || parsed.hash
  );
  if (hasPath) {
    return {
      ok: false,
      code: 'INVALID_URL',
      error: 'SUPABASE_URL should not include a path',
    };
  }

  return { ok: true, parsed };
}

export function validateServiceRoleKey(keyRaw) {
  const key = keyRaw?.trim();
  if (!key) {
    return { ok: false, code: 'MISSING', missing: ['SUPABASE_SERVICE_ROLE_KEY'] };
  }

  if (!looksLikeJwt(key)) {
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
    .replace(/[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+/g, '[redacted]')
    .replace(/Bearer\s+\S+/gi, 'Bearer [redacted]')
    .replace(/apikey["']?\s*[:=]\s*["']?[^"'\\\s]+/gi, 'apikey=[redacted]')
    .slice(0, 200);
}

/**
 * Short, safe table-level error for health diagnostics.
 */
export function sanitizeTableError(error) {
  if (!error) return null;
  if (isMissingTableError(error)) {
    return 'relation does not exist';
  }

  const message = redactSecrets(error.message);
  const lower = message.toLowerCase();
  if (lower.includes('permission denied') || lower.includes('row-level security')) {
    return 'permission denied';
  }
  if (lower.includes('invalid api key') || lower.includes('jwt')) {
    return 'Invalid API key';
  }

  return message || 'Query failed';
}

/**
 * Safe connection-level error fields for health responses.
 * Never returns stacks, Authorization, or key material.
 */
export function sanitizeConnectionError(error) {
  const errorName = error?.name || 'Error';
  let errorMessage = redactSecrets(error?.message || 'Supabase connection failed');

  if (errorMessage.toLowerCase().includes('fetch failed')) {
    errorMessage = 'fetch failed';
  } else if (errorMessage.toLowerCase().includes('invalid api key')) {
    errorMessage = 'Invalid Supabase API key';
  } else if (errorMessage.toLowerCase().includes('unable to reach')) {
    errorMessage = 'Unable to reach Supabase endpoint';
  }

  return { errorName, errorMessage };
}

/**
 * Extract Node/undici error.cause fields safely (no stacks, no secrets).
 */
export function extractErrorCause(error) {
  const cause = error?.cause;
  if (!cause || typeof cause !== 'object') {
    return {
      causeName: null,
      causeCode: null,
      causeMessage: null,
    };
  }

  return {
    causeName: typeof cause.name === 'string' ? cause.name : null,
    causeCode:
      typeof cause.code === 'string' || typeof cause.code === 'number'
        ? String(cause.code)
        : null,
    causeMessage: cause.message
      ? redactSecrets(String(cause.message)).slice(0, 120)
      : null,
  };
}

function safeShortMessage(text) {
  return redactSecrets(String(text || '')).slice(0, 120);
}

/**
 * Network-only probe: GET `${SUPABASE_URL}/rest/v1/` with NO Authorization / apikey.
 * A 401 JSON body like "No API key found in request" means the host is reachable.
 */
export async function runDirectFetchCheck(supabaseUrl) {
  const path = '/rest/v1/';
  let urlHost = null;

  try {
    urlHost = new URL(supabaseUrl).hostname;
  } catch {
    return {
      attempted: true,
      urlHost: null,
      path,
      status: null,
      ok: false,
      reachable: false,
      contentType: null,
      shortMessage: 'Invalid SUPABASE_URL',
      errorName: 'TypeError',
      errorMessage: 'Invalid URL',
      causeName: null,
      causeCode: null,
      causeMessage: null,
    };
  }

  const target = `${supabaseUrl.replace(/\/$/, '')}${path}`;

  try {
    const response = await fetch(target, {
      method: 'GET',
      headers: { Accept: 'application/json' },
      redirect: 'manual',
    });

    const contentType = response.headers.get('content-type') || null;
    let shortMessage = null;
    try {
      const text = await response.text();
      shortMessage = safeShortMessage(text);
      try {
        const json = JSON.parse(text);
        if (json && typeof json.message === 'string') {
          shortMessage = safeShortMessage(json.message);
        } else if (json && typeof json.error === 'string') {
          shortMessage = safeShortMessage(json.error);
        }
      } catch {
        /* keep truncated text */
      }
    } catch {
      shortMessage = null;
    }

    return {
      attempted: true,
      urlHost,
      path,
      status: response.status,
      ok: response.ok,
      reachable: true,
      contentType,
      shortMessage,
      errorName: null,
      errorMessage: null,
      causeName: null,
      causeCode: null,
      causeMessage: null,
    };
  } catch (error) {
    const { errorName, errorMessage } = sanitizeConnectionError(error);
    const cause = extractErrorCause(error);
    return {
      attempted: true,
      urlHost,
      path,
      status: null,
      ok: false,
      reachable: false,
      contentType: null,
      shortMessage: null,
      errorName,
      errorMessage,
      ...cause,
    };
  }
}

/**
 * SDK probe result for health — separate from directFetchCheck.
 */
export async function runSdkCheck(supabase) {
  try {
    const probe = await probeSupabaseConnection(supabase);
    if (probe.connected) {
      return {
        attempted: true,
        success: true,
        errorName: null,
        errorMessage: null,
        causeName: null,
        causeCode: null,
        causeMessage: null,
      };
    }

    const { errorName, errorMessage } = sanitizeConnectionError(probe.probeError);
    const cause = extractErrorCause(probe.probeError);
    return {
      attempted: true,
      success: false,
      errorName,
      errorMessage,
      ...cause,
    };
  } catch (error) {
    const { errorName, errorMessage } = sanitizeConnectionError(error);
    const cause = extractErrorCause(error);
    return {
      attempted: true,
      success: false,
      errorName,
      errorMessage,
      ...cause,
    };
  }
}

/**
 * Per-table probe — never throws; returns readable flag and optional error text.
 */
export async function checkTableStatus(supabase, tableName) {
  try {
    const { error } = await supabase
      .from(tableName)
      .select('*', { head: true, count: 'exact' })
      .limit(1);

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
  } catch (error) {
    return {
      readable: false,
      error: sanitizeTableError(error) || 'Query failed',
      isMissing: false,
      isConnectionIssue: true,
    };
  }
}

/**
 * Lightweight connectivity probe via site_content.
 * Missing table still counts as reachable Supabase REST API.
 */
export async function probeSupabaseConnection(supabase) {
  try {
    const { error } = await supabase
      .from('site_content')
      .select('*', { head: true })
      .limit(1);

    if (!error) {
      return { connected: true, probeError: null };
    }

    if (isMissingTableError(error)) {
      return { connected: true, probeError: null };
    }

    // Auth / permission errors still mean Supabase REST responded.
    const msg = (error.message || '').toLowerCase();
    if (
      msg.includes('permission denied') ||
      msg.includes('row-level security') ||
      msg.includes('invalid api key') ||
      error.code === '42501' ||
      error.code === 'PGRST301'
    ) {
      return { connected: true, probeError: null };
    }

    return { connected: false, probeError: error };
  } catch (error) {
    return { connected: false, probeError: error };
  }
}
