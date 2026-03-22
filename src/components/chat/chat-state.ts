import type { Attachment } from "@/lib/types";

export interface ChatState {
  hasSubmitted: boolean;
  hasManuallyScrolled: boolean;
  attachments: Attachment[];
  selectedVisibilityType: "public" | "private";
}

export type ChatAction =
  | { type: "SET_HAS_SUBMITTED"; payload: boolean }
  | { type: "SET_HAS_MANUALLY_SCROLLED"; payload: boolean }
  | { type: "SET_ATTACHMENTS"; payload: Attachment[] }
  | { type: "SET_VISIBILITY_TYPE"; payload: "public" | "private" }
  | { type: "RESET_UI_STATE" };

export const chatReducer = (
  state: ChatState,
  action: ChatAction,
): ChatState => {
  switch (action.type) {
    case "SET_HAS_SUBMITTED":
      return { ...state, hasSubmitted: action.payload };
    case "SET_HAS_MANUALLY_SCROLLED":
      return { ...state, hasManuallyScrolled: action.payload };
    case "SET_ATTACHMENTS":
      return { ...state, attachments: action.payload };
    case "SET_VISIBILITY_TYPE":
      return { ...state, selectedVisibilityType: action.payload };
    case "RESET_UI_STATE":
      if (!state.hasSubmitted && !state.hasManuallyScrolled) return state;
      return {
        ...state,
        hasSubmitted: false,
        hasManuallyScrolled: false,
      };
    default:
      return state;
  }
};

export const createInitialState = (
  initialVisibility: "public" | "private" = "private",
): ChatState => ({
  hasSubmitted: false,
  hasManuallyScrolled: false,
  attachments: [],
  selectedVisibilityType: initialVisibility,
});
