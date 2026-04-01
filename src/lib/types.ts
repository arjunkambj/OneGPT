export interface Attachment {
  name: string;
  contentType?: string;
  mediaType?: string;
  url: string;
  size: number;
}

export interface ChatMessage {
  id: string;
  role: "user" | "assistant" | "system";
  parts: MessagePart[];
  attachments?: Attachment[];
  parentMessageId?: string;
  mode?: ChatMode;
  model?: string;
  inputTokens?: number;
  outputTokens?: number;
  totalTokens?: number;
  completionTime?: number;
  createdAt?: number;
}

export type MessagePart =
  | { type: "text"; text: string }
  | {
      type: "reasoning";
      reasoning: string;
      state?: "streaming" | "done";
      details?: { type: string; summary: string }[];
    }
  | {
      type: "source-url";
      sourceId: string;
      url: string;
      title?: string;
      providerMetadata?: unknown;
    }
  | {
      type: "tool-invocation";
      toolInvocationId: string;
      toolName: string;
      args: unknown;
      result?: unknown;
      state: "pending" | "result" | "error";
    }
  | { type: "error"; error: string }
  | { type: "file"; mediaType: string; url: string; filename?: string };

export type ChatMode = "chat" | "search";

export type SearchStatusData = {
  phase: "generating-queries" | "searching" | "complete";
  queries?: string[];
  resultCount?: number;
};
