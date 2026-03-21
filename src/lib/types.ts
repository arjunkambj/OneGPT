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
			details?: { type: string; summary: string }[];
	  }
	| {
			type: "tool-invocation";
			toolInvocationId: string;
			toolName: string;
			args: unknown;
			result?: unknown;
			state: "pending" | "result" | "error";
	  }
	| { type: "error"; error: string };

export interface Chat {
	id: string;
	title: string;
	createdAt: number;
	updatedAt: number;
	isPinned: boolean;
	visibility: "public" | "private";
	shareToken?: string;
}

export type SubscriptionTier = "free" | "pro" | "max";

export type SubscriptionStatus =
	| "active"
	| "canceled"
	| "past_due"
	| "trialing"
	| "paused";
