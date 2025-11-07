/**
 * Environment variable validation utility
 * 
 * Validates required environment variables at server boot time.
 * Fails fast with clear error messages if any required vars are missing.
 * 
 * This should be called early in the application lifecycle (e.g., in middleware or route handlers).
 */

/**
 * Validates required server-side environment variables
 * Throws error with clear message if any are missing
 */
export function validateServerEnv(): void {
  const missing: string[] = [];

  // Supabase server env vars
  if (!process.env.SUPABASE_URL && !process.env.NEXT_PUBLIC_SUPABASE_URL) {
    missing.push('SUPABASE_URL or NEXT_PUBLIC_SUPABASE_URL');
  }
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
    missing.push('SUPABASE_SERVICE_ROLE_KEY');
  }

  // n8n webhook env vars
  if (!process.env.N8N_WEBHOOK_URL) {
    missing.push('N8N_WEBHOOK_URL');
  }
  if (!process.env.N8N_WEBHOOK_SECRET) {
    missing.push('N8N_WEBHOOK_SECRET');
  }

  // Request timeout
  if (!process.env.REQUEST_TIMEOUT_MS) {
    missing.push('REQUEST_TIMEOUT_MS');
  }

  if (missing.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missing.join(', ')}\n` +
      'Please check your .env.local or production environment configuration.'
    );
  }
}

/**
 * Validates client-side environment variables
 * Returns array of missing variable names (does not throw)
 */
export function validateClientEnv(): string[] {
  const missing: string[] = [];

  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
    missing.push('NEXT_PUBLIC_SUPABASE_URL');
  }
  if (!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    missing.push('NEXT_PUBLIC_SUPABASE_ANON_KEY');
  }

  return missing;
}



