/**
 * Server-side environment variable validation
 * Trims values to prevent Vercel/newline issues
 * Lazy validation - no top-level throws
 */

import { z } from "zod";

// Transform to trim string values (handles Vercel env trailing whitespace/newlines)
// Use refine() after transform() since min() cannot be called after transform()
// Transform output type must be explicitly string
const NonEmptyTrimmed = z
  .string()
  .transform((s) => (s ? s.trim() : s || ""))
  .pipe(z.string().min(8, "Value must be at least 8 characters after trimming"));

const EnvSchema = z.object({
  N8N_WEBHOOK_SECRET: NonEmptyTrimmed,
  N8N_WEBHOOK_URL_BICYCLE: z.string().url().transform((s) => s?.trim?.() ?? s),
  N8N_WEBHOOK_URL_AUTO: z.string().url().transform((s) => s?.trim?.() ?? s),
  N8N_WEBHOOK_URL_MOTO: z.string().url().transform((s) => s?.trim?.() ?? s),
  N8N_WEBHOOK_URL_TECH: z.string().url().transform((s) => s?.trim?.() ?? s),
  N8N_WEBHOOK_URL: z.string().url().transform((s) => s?.trim?.() ?? s).optional(),
  REQUEST_TIMEOUT_MS: z
    .string()
    .optional()
    .transform((s) => {
      if (!s) return 40000;
      const trimmed = s.trim();
      const num = Number(trimmed);
      return isNaN(num) || num <= 0 ? 40000 : num;
    }),
});

type EnvData = z.infer<typeof EnvSchema>;

/**
 * Lazy environment variable validation
 * Returns {ok: true, data} on success, {ok: false, error} on failure
 * Never throws - safe to call at runtime
 */
export function getEnv(): { ok: true; data: EnvData } | { ok: false; error: string } {
  try {
    const parsed = EnvSchema.safeParse({
      N8N_WEBHOOK_SECRET: process.env.N8N_WEBHOOK_SECRET,
      N8N_WEBHOOK_URL_BICYCLE: process.env.N8N_WEBHOOK_URL_BICYCLE,
      N8N_WEBHOOK_URL_AUTO: process.env.N8N_WEBHOOK_URL_AUTO,
      N8N_WEBHOOK_URL_MOTO: process.env.N8N_WEBHOOK_URL_MOTO,
      N8N_WEBHOOK_URL_TECH: process.env.N8N_WEBHOOK_URL_TECH,
      N8N_WEBHOOK_URL: process.env.N8N_WEBHOOK_URL,
      REQUEST_TIMEOUT_MS: process.env.REQUEST_TIMEOUT_MS,
    });

    if (!parsed.success) {
      // Log validation errors in development (safely)
      try {
        if (process.env.NODE_ENV === "development") {
          console.error("Environment variable validation failed:", parsed.error.format());
        }
      } catch {
        // Ignore logging errors
      }
      return { ok: false, error: "env_missing" };
    }

    return { ok: true, data: parsed.data };
  } catch (e: any) {
    // Catch any unexpected errors in validation
    return { ok: false, error: "env_missing" };
  }
}

