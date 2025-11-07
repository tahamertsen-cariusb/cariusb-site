export type ChatMessage = { role: "user" | "assistant"; content: string };

export type Conversation = {
  id: string;
  createdAt: number;
  mode: "BICYCLE" | "AUTO" | "MOTO" | "TECH";
  messages: ChatMessage[];
};

export type DeepsearchMode = "off" | "auto" | "on";




