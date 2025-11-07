/**
 * Chat client for streaming API calls
 * Handles timeout, retry, and abort logic
 */

import type { StreamEvent, DeepsearchMode } from "./chatTypes";

const REQUEST_TIMEOUT_MS = 40000; // 40 seconds

export interface ChatRequest {
  message: string;
  session_id: string;
  user_plan: "guest" | "free" | "pro";
  deepsearch: DeepsearchMode;
  lang: string;
  user_id?: string;
  guest_id?: string;
  conversationId?: string;
  mode?: string;
  messages?: Array<{ role: string; content: string }>;
  domainMode?: "bicycle" | "auto" | "moto" | "tech"; // domain mode for webhook routing
}

/**
 * Stream chat messages from API
 * Yields StreamEvent objects
 * Handles timeout, retry (1x for upstream_timeout), and abort
 */
export async function* streamChat(body: ChatRequest): AsyncGenerator<StreamEvent, void, unknown> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  let retryCount = 0;
  const maxRetries = 1; // Only retry once for upstream_timeout

  while (retryCount <= maxRetries) {
    try {
      clearTimeout(timeoutId);
      const newTimeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
        signal: controller.signal,
      });

      clearTimeout(newTimeoutId);

      if (!res.ok) {
        // Parse NDJSON error event from stream
        if (!res.body) {
          yield {
            type: "error",
            code: res.status === 400 ? "invalid_request" : res.status === 429 ? "limit_exceeded" : res.status === 502 ? "upstream_failed" : "unknown",
            message: `HTTP ${res.status}`,
          };
          return;
        }

        const reader = res.body.getReader();
        const decoder = new TextDecoder();
        let buffer = "";

        try {
          while (true) {
            const { done, value } = await reader.read();
            
            if (done) {
              // No error event found, use default
              yield {
                type: "error",
                code: res.status === 400 ? "invalid_request" : res.status === 429 ? "limit_exceeded" : res.status === 502 ? "upstream_failed" : "unknown",
                message: `HTTP ${res.status}`,
              };
              return;
            }

            buffer += decoder.decode(value, { stream: true });
            const lines = buffer.split("\n");
            buffer = lines.pop() || "";

            for (const line of lines) {
              const trimmed = line.trim();
              if (!trimmed) continue;

              try {
                const data = JSON.parse(trimmed);
                if (data.type === "error") {
                  // Handle retry for upstream_failed (502)
                  if (data.code === "upstream_failed" && res.status === 502 && retryCount < maxRetries) {
                    retryCount++;
                    yield {
                      type: "error",
                      code: "upstream_timeout",
                      message: "Service temporarily unavailable, retrying...",
                    };
                    await new Promise((resolve) => setTimeout(resolve, 1000));
                    reader.releaseLock();
                    break; // Break out of inner while loop to retry outer while loop
                  }
                  
                  yield {
                    type: "error",
                    code: data.code || "unknown",
                    message: data.message || "Unknown error",
                  };
                  reader.releaseLock();
                  return;
                }
              } catch {
                // Not JSON, continue
              }
            }
          }
        } finally {
          reader.releaseLock();
        }
      }

      if (!res.body) {
        yield {
          type: "error",
          code: "unknown",
          message: "No response body",
        };
        return;
      }

      // Read stream
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      try {
        while (true) {
          const { done, value } = await reader.read();
          
          if (done) {
            // Finalize
            if (buffer.trim()) {
              // Last chunk
              yield { type: "text", delta: buffer };
            }
            yield { type: "done" };
            return;
          }

          buffer += decoder.decode(value, { stream: true });
          
          // Parse lines (SSE/NDJSON format)
          const lines = buffer.split("\n");
          buffer = lines.pop() || ""; // Keep incomplete line in buffer

          for (const line of lines) {
            const trimmed = line.trim();
            if (!trimmed) continue;

            // Try to parse as JSON (NDJSON)
            try {
              const data = JSON.parse(trimmed);
              if (data.type === "agent" && data.payload) {
                yield { type: "agent", payload: data.payload };
              } else if (data.type === "text" && data.delta) {
                yield { type: "text", delta: data.delta };
              } else if (data.type === "done") {
                yield { type: "done", usage: data.usage };
                return;
              } else if (data.type === "error") {
                yield {
                  type: "error",
                  code: data.code || "unknown",
                  message: data.message,
                };
                return;
              }
            } catch {
              // Not JSON, treat as plain text delta
              yield { type: "text", delta: trimmed + "\n" };
            }
          }
        }
      } finally {
        reader.releaseLock();
      }
    } catch (err: any) {
      clearTimeout(timeoutId);

      if (err.name === "AbortError") {
        // Timeout - retry once if not already retried
        if (retryCount < maxRetries) {
          retryCount++;
          yield {
            type: "error",
            code: "upstream_timeout",
            message: "Request timed out, retrying...",
          };
          await new Promise((resolve) => setTimeout(resolve, 1000));
          continue;
        }
        
        yield {
          type: "error",
          code: "upstream_timeout",
          message: "Request timed out after 40 seconds",
        };
        return;
      }

      yield {
        type: "error",
        code: "unknown",
        message: err.message || "Unknown error",
      };
      return;
    }
  }
}

