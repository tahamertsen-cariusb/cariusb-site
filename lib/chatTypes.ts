/**
 * Chat types for streaming and message handling
 */

export type Role = "user" | "assistant" | "system";

export type DeepsearchMode = "auto" | "on" | "off";

/**
 * Agent message payload from n8n
 */
export type AgentMessage = {
  type: "messages_aiagent";
  messages: Array<{ role: Role; content: string }>;
};

/**
 * Stream events from the API
 */
export type StreamEvent =
  | { type: "text"; delta: string }
  | { type: "done"; usage?: { tokens?: number } }
  | { type: "agent"; payload: AgentMessage }
  | {
      type: "error";
      code: "limit_exceeded" | "invalid_request" | "upstream_timeout" | "upstream_failed" | "unknown";
      message?: string;
    };

/**
 * Chat message in conversation
 */
export type ChatMessage = {
  id: string;
  role: Role;
  content: string;
  createdAt: number;
};

/**
 * Conversation type
 */
export type Conversation = {
  id: string;
  createdAt: number;
  mode: "BICYCLE" | "AUTO" | "MOTO" | "TECH";
  messages: ChatMessage[];
};



