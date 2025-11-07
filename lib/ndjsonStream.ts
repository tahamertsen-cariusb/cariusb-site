/**
 * NDJSON stream parser for client-side
 * Parses NDJSON (newline-delimited JSON) stream and yields parsed events
 */

export type NDJSONEvent = 
  | { type: "text"; delta: string }
  | { type: "done" }
  | { type: "error"; code: string; message?: string }
  | { type: "agent"; payload?: any };

/**
 * Parse NDJSON stream from ReadableStream
 * Yields NDJSONEvent objects
 */
export async function* ndjsonStream(
  stream: ReadableStream<Uint8Array>
): AsyncGenerator<NDJSONEvent, void, unknown> {
  const reader = stream.getReader();
  const decoder = new TextDecoder();
  let buffer = "";

  try {
    while (true) {
      const { done, value } = await reader.read();
      
      if (done) {
        // Process remaining buffer
        if (buffer.trim()) {
          const lines = buffer.split("\n").filter((line) => line.trim());
          for (const line of lines) {
            try {
              const data = JSON.parse(line);
              if (data.type === "text" && data.delta) {
                yield { type: "text", delta: data.delta };
              } else if (data.type === "done") {
                yield { type: "done" };
              } else if (data.type === "error") {
                yield {
                  type: "error",
                  code: data.code || "unknown",
                  message: data.message,
                };
              } else if (data.type === "agent" && data.payload) {
                yield { type: "agent", payload: data.payload };
              }
            } catch {
              // Invalid JSON, skip
            }
          }
        }
        return;
      }

      // Decode chunk and append to buffer
      buffer += decoder.decode(value, { stream: true });
      
      // Split by newlines and process complete lines
      const lines = buffer.split("\n");
      buffer = lines.pop() || ""; // Keep incomplete line in buffer

      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed) continue;

        try {
          const data = JSON.parse(trimmed);
          
          if (data.type === "text" && data.delta) {
            yield { type: "text", delta: data.delta };
          } else if (data.type === "done") {
            yield { type: "done" };
            return;
          } else if (data.type === "error") {
            yield {
              type: "error",
              code: data.code || "unknown",
              message: data.message,
            };
            return;
          } else if (data.type === "agent" && data.payload) {
            yield { type: "agent", payload: data.payload };
          }
        } catch {
          // Invalid JSON, skip line
        }
      }
    }
  } finally {
    reader.releaseLock();
  }
}



