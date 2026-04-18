import type { FileUIPart } from "ai";
import type { ChatMode } from "@/lib/types";

const STORAGE_KEY = "onegpt.pending-chat-draft";

type PendingChatDraft = {
  text: string;
  mode: ChatMode;
  files: FileUIPart[];
};

function isFileUIPart(value: unknown): value is FileUIPart {
  return (
    typeof value === "object" &&
    value !== null &&
    "type" in value &&
    value.type === "file" &&
    "mediaType" in value &&
    typeof value.mediaType === "string" &&
    "url" in value &&
    typeof value.url === "string"
  );
}

function isPendingChatDraft(value: unknown): value is PendingChatDraft {
  return (
    typeof value === "object" &&
    value !== null &&
    "text" in value &&
    typeof value.text === "string" &&
    "mode" in value &&
    (value.mode === "chat" || value.mode === "search") &&
    "files" in value &&
    Array.isArray(value.files) &&
    value.files.every(isFileUIPart)
  );
}

export function savePendingChatDraft(draft: PendingChatDraft) {
  if (typeof window === "undefined") {
    return { saved: false, preservedFiles: false };
  }

  try {
    window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(draft));
    return { saved: true, preservedFiles: draft.files.length > 0 };
  } catch {
    if (!draft.text.trim()) {
      return { saved: false, preservedFiles: false };
    }

    try {
      window.sessionStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ ...draft, files: [] }),
      );
      return { saved: true, preservedFiles: false };
    } catch {
      return { saved: false, preservedFiles: false };
    }
  }
}

export function consumePendingChatDraft() {
  if (typeof window === "undefined") return null;

  const raw = window.sessionStorage.getItem(STORAGE_KEY);
  if (!raw) return null;

  window.sessionStorage.removeItem(STORAGE_KEY);

  try {
    const draft = JSON.parse(raw) as unknown;
    return isPendingChatDraft(draft) ? draft : null;
  } catch {
    return null;
  }
}
