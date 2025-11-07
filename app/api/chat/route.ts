// app/api/chat/route.ts
import { NextRequest } from "next/server";
import { z } from "zod";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const encoder = new TextEncoder();

/**
 * Normalize domain mode (server-side guarantee)
 * Trim + lowercase + map to valid set: bicycle|auto|moto|tech
 */
function normalizeMode(v: any): "bicycle" | "auto" | "moto" | "tech" {
  const k = String(v ?? "").trim().toLowerCase();
  if (["bicycle", "auto", "moto", "tech"].includes(k)) return k as any;
  return "tech";
}

/**
 * Pick webhook URL based on domain mode with fallback
 * Uses validated env from getEnv()
 */
function pickWebhookURL(mode: string, env: { ok: true; data: any }): string | undefined {
  try {
    switch (mode) {
      case "bicycle": return env.data.N8N_WEBHOOK_URL_BICYCLE || env.data.N8N_WEBHOOK_URL;
      case "auto": return env.data.N8N_WEBHOOK_URL_AUTO || env.data.N8N_WEBHOOK_URL;
      case "moto": return env.data.N8N_WEBHOOK_URL_MOTO || env.data.N8N_WEBHOOK_URL;
      case "tech": return env.data.N8N_WEBHOOK_URL_TECH || env.data.N8N_WEBHOOK_URL;
      default: return env.data.N8N_WEBHOOK_URL;
    }
  } catch {
    return undefined;
  }
}

// Zod schema for request body validation
const Body = z.object({
  message: z.string().min(1),
  session_id: z.string().optional(),
  lang: z.string().optional(),
  deepsearch: z.enum(["auto", "on", "off"]).optional(),
  user_plan: z.enum(["guest", "free", "pro"]),
  user_id: z.string().optional(),
  guest_id: z.string().optional(),
  domainMode: z.any().optional(), // normalizeMode ile güvence
  // Legacy fields (kept for backward compatibility)
  conversationId: z.string().optional(),
  mode: z.string().optional(),
  messages: z.array(z.any()).optional(),
  is_guest: z.boolean().optional(),
  user_id_raw: z.string().optional(),
});

/**
 * Helper to send NDJSON error event
 * Always returns HTTP 200 with NDJSON error
 * Never throws - safe to call in any context
 */
function ndjsonError(code: string, message?: string): Response {
  try {
    const body = JSON.stringify({ type: "error", code, ...(message ? { message } : {}) }) + "\n";
    return new Response(body, {
      status: 200,
      headers: {
        "content-type": "application/x-ndjson; charset=utf-8",
        "cache-control": "no-store, no-transform",
        "x-content-type-options": "nosniff",
      },
    });
  } catch (e: any) {
    // Fallback if JSON.stringify fails
    return new Response(
      `{"type":"error","code":"${code}","message":"${message || "Unknown error"}"}\n`,
      {
        status: 200,
        headers: {
          "content-type": "application/x-ndjson; charset=utf-8",
          "cache-control": "no-store, no-transform",
          "x-content-type-options": "nosniff",
        },
      }
    );
  }
}


export async function POST(req: NextRequest) {
  // Wrap entire handler in try-catch to prevent any unhandled errors
  try {
    // Parse request body - wrap in try-catch for safety
    let json: any = null;
    try {
      json = await req.json();
    } catch (e: any) {
      return ndjsonError("invalid_request", "Failed to parse request body");
    }

    if (!json || typeof json !== "object") {
      return ndjsonError("invalid_request", "Invalid request body");
    }

    const parsed = Body.safeParse(json);
    
    if (!parsed.success) {
      return ndjsonError("invalid_request", "Request body validation failed");
    }

    // Lazy env validation - dynamic import to prevent top-level errors
    let envResult: { ok: true; data: any } | { ok: false; error: string } | null = null;
    try {
      // Dynamic import to prevent module initialization errors
      const { getEnv } = await import("@/lib/env.server");
      envResult = getEnv();
    } catch (e: any) {
      return ndjsonError("ENV_MISSING", `Environment validation error: ${e?.message || "unknown"}`);
    }

    if (!envResult || !envResult.ok) {
      return ndjsonError("ENV_MISSING", "Environment variables are missing or invalid");
    }

    const env = envResult.data;

    // Normalize domain mode and get target webhook URL and secret
    let mode: "bicycle" | "auto" | "moto" | "tech";
    let target: string | undefined;
    let secret: string;

    try {
      mode = normalizeMode(parsed.data.domainMode);
      target = pickWebhookURL(mode, envResult);
      secret = env.N8N_WEBHOOK_SECRET;
    } catch (e: any) {
      return ndjsonError("ENV_MISSING", "Failed to process environment variables");
    }

    // Check if target URL exists
    if (!target || !secret) {
      return ndjsonError("ENV_MISSING", `Webhook URL or secret for mode "${mode}" is missing`);
    }

    // Fetch upstream webhook with timeout
    // Use AbortController instead of AbortSignal.timeout() for Edge runtime compatibility
    const timeoutMs = typeof env.REQUEST_TIMEOUT_MS === "number" ? env.REQUEST_TIMEOUT_MS : 40000;
    const abortController = new AbortController();
    let timeoutId: NodeJS.Timeout | null = null;

    let upstream: Response;
    try {
      timeoutId = setTimeout(() => abortController.abort(), timeoutMs);

      // Safely stringify request body
      let requestBody: string;
      try {
        requestBody = JSON.stringify({ ...parsed.data, domainMode: mode });
      } catch (e: any) {
        if (timeoutId) clearTimeout(timeoutId);
        return ndjsonError("invalid_request", "Failed to serialize request body");
      }

      // Build headers - support both custom header and HTTP Basic Auth
      const headers: Record<string, string> = {
        "content-type": "application/json",
      };

      // Check if secret contains ":" (username:password format for Basic Auth)
      if (secret.includes(":")) {
        // HTTP Basic Auth format
        const [username, password] = secret.split(":", 2);
        const basicAuth = Buffer.from(`${username}:${password}`).toString("base64");
        headers["Authorization"] = `Basic ${basicAuth}`;
      } else {
        // Custom header format (default: x-webhook-secret)
        headers["x-webhook-secret"] = secret;
      }

      upstream = await fetch(target, {
        method: "POST",
        headers,
        body: requestBody,
        signal: abortController.signal,
      });

      if (timeoutId) clearTimeout(timeoutId);
    } catch (e: any) {
      if (timeoutId) clearTimeout(timeoutId);
      // Convert fetch errors (network, timeout, etc.) to NDJSON error
      if (e.name === "AbortError" || e.message?.includes("aborted")) {
        return ndjsonError("UPSTREAM_FAILED", "Request timed out");
      }
      return ndjsonError("UPSTREAM_FAILED", e?.message || "Failed to connect to upstream service");
    }

    // Handle upstream HTTP errors → NDJSON error
    if (!upstream.ok) {
      const status = upstream.status;
      let text = "";
      
      try {
        text = await upstream.text();
      } catch {
        // Ignore text read errors
      }

      // Handle specific status codes
      if (status === 401 || status === 403) {
        return ndjsonError("UPSTREAM_AUTH_ERROR", "Authorization failed - check webhook secret");
      }

      if (status === 429 || (text && text.includes("limit_exceeded"))) {
        return ndjsonError("limit_exceeded");
      }

      return ndjsonError("upstream_error", text || `HTTP ${status}`);
    }

    // Stream forward → Convert n8n response to NDJSON format
    const stream = new ReadableStream({
      async start(controller) {
        try {
          // Check content-type to determine if it's NDJSON or regular JSON
          const contentType = upstream.headers.get("content-type") || "";
          const isNDJSON = contentType.includes("ndjson") || contentType.includes("x-ndjson");
          
          if (isNDJSON) {
            // Forward upstream NDJSON stream as-is
            const reader = upstream.body?.getReader();
            if (!reader) {
              controller.enqueue(encoder.encode(JSON.stringify({ type: "error", code: "stream_error", message: "No reader available" }) + "\n"));
              controller.close();
              return;
            }

            while (true) {
              const { value, done } = await reader.read();
              if (done) break;
              // Forward upstream chunks as-is (already NDJSON format)
              controller.enqueue(value);
            }

            controller.close();
            return;
          }

          // n8n returns regular JSON, convert to NDJSON
          // Read entire response body
          const text = await upstream.text();
          
          try {
            const data = JSON.parse(text);
            
            // Extract message from n8n response format
            // Expected format: { messages_aiagent: "...", intent: "...", traceId: "...", meta: {...} }
            const message = data.messages_aiagent || data.message || data.text || data.content || "";
            
            if (typeof message === "string" && message.length > 0) {
              // Stream message as NDJSON text deltas
              // Split into chunks for smoother streaming (word-by-word or character-by-character)
              const words = message.split(/(\s+)/); // Split by whitespace but keep separators
              
              for (let i = 0; i < words.length; i++) {
                const chunk = words[i];
                if (chunk) {
                  // Send as text delta
                  const delta = JSON.stringify({ type: "text", delta: chunk }) + "\n";
                  controller.enqueue(encoder.encode(delta));
                  
                  // Small delay for smoother streaming effect
                  await new Promise(resolve => setTimeout(resolve, 10));
                }
              }
            }
            
            // Send done event
            const doneEvent = JSON.stringify({ type: "done" }) + "\n";
            controller.enqueue(encoder.encode(doneEvent));
            
            controller.close();
          } catch (parseError: any) {
            // If parsing fails, try to send as plain text
            if (text && text.trim()) {
              const delta = JSON.stringify({ type: "text", delta: text }) + "\n";
              controller.enqueue(encoder.encode(delta));
            }
            
            const doneEvent = JSON.stringify({ type: "done" }) + "\n";
            controller.enqueue(encoder.encode(doneEvent));
            controller.close();
          }
        } catch (e: any) {
          controller.enqueue(encoder.encode(JSON.stringify({ type: "error", code: "stream_error", message: e?.message || "stream_error" }) + "\n"));
          controller.close();
        }
      },
    });

    return new Response(stream, {
      status: 200,
      headers: {
        "content-type": "application/x-ndjson; charset=utf-8",
        "cache-control": "no-store",
        "x-content-type-options": "nosniff",
      },
    });
  } catch (e: any) {
    // Final defense: never throw 500
    return ndjsonError("unknown", e?.message);
  }
}
