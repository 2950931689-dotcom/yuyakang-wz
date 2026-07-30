import { createClient } from '@supabase/supabase-js';

const REQUIRED_ENV = ['SUPABASE_URL', 'SUPABASE_SERVICE_ROLE_KEY'];

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

/**
 * Returns true when the table exists and is readable, false when missing.
 * Throws on connection/auth errors that are not "table not found".
 */
export async function checkTableReadable(supabase, tableName) {
  const { error } = await supabase.from(tableName).select('*', { head: true, count: 'exact' });

  if (!error) return true;
  if (isMissingTableError(error)) return false;
  throw error;
}
