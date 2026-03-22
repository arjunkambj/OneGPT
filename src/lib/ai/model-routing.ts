// Maps supported OneGPT internal model values to OpenRouter model identifiers.
// OpenRouter format: "provider/model-name"
const MODEL_MAP = {
  // xAI
  "onegpt-default": "x-ai/grok-4.20-beta",
  "onegpt-grok-4.20-multi-agent-beta": "x-ai/grok-4.20-multi-agent-beta",
  "onegpt-grok-4": "x-ai/grok-4.20-beta",
  "onegpt-grok-4.20-experimental-beta-0304": "x-ai/grok-4.20-beta",
  "onegpt-grok-4.20-experimental-beta-0304-thinking": "x-ai/grok-4.20-beta",
  "onegpt-grok4.1-fast-thinking": "x-ai/grok-4.20-beta",
  "onegpt-code": "x-ai/grok-4.20-beta",

  // Sarvam
  "onegpt-sarvam-105b": "sarvam/sarvam-m",

  // ByteDance
  "onegpt-seed-2.0-mini": "bytedance-seed/seed-2.0-mini",
  "onegpt-seed-2.0-lite": "bytedance-seed/seed-2.0-lite",
  "onegpt-seed-1.6": "bytedance-seed/seed-1.6",
  "onegpt-seed-1.8": "bytedance-seed/seed-1.6",
  "onegpt-seed-1.6-flash": "bytedance-seed/seed-1.6-flash",

  // Alibaba (Qwen)
  "onegpt-qwen-32b": "qwen/qwen3.5-27b",
  "onegpt-qwen-3.5-plus": "qwen/qwen3.5-plus-02-15",
  "onegpt-qwen-3.5-flash": "qwen/qwen3.5-flash-02-23",

  // NVIDIA
  "onegpt-nemotron-3-super": "nvidia/nemotron-3-super-120b-a12b",

  // OpenAI
  "onegpt-gpt-oss-20": "openai/gpt-5.4-nano",
  "onegpt-gpt5-nano": "openai/gpt-5.4-nano",
  "onegpt-gpt-4.1-nano": "openai/gpt-5.4-nano",
  "onegpt-gpt-4.1-mini": "openai/gpt-5.4-mini",
  "onegpt-gpt-4.1": "openai/gpt-5.4",
  "onegpt-gpt-5.1": "openai/gpt-5.2-chat",
  "onegpt-gpt-5.1-thinking": "openai/gpt-5.2-pro",
  "onegpt-gpt-5.2": "openai/gpt-5.2",
  "onegpt-gpt-5.3-chat-latest": "openai/gpt-5.3-chat",
  "onegpt-gpt-5.4": "openai/gpt-5.4",
  "onegpt-gpt-5.4-mini": "openai/gpt-5.4-mini",
  "onegpt-gpt-5.4-nano": "openai/gpt-5.4-nano",
  "onegpt-gpt-5.4-thinking": "openai/gpt-5.4-pro",
  "onegpt-gpt-5.2-thinking": "openai/gpt-5.2-pro",
  "onegpt-gpt-5.2-thinking-xhigh": "openai/gpt-5.2-pro",
  "onegpt-gpt5-mini": "openai/gpt-5.4-mini",
  "onegpt-gpt5": "openai/gpt-5.4",
  "onegpt-gpt5-medium": "openai/gpt-5.4-pro",
  "onegpt-gpt-oss-120": "openai/gpt-5.4",
  "onegpt-gpt-5.1-codex": "openai/gpt-5.2-codex",
  "onegpt-gpt-5.1-codex-mini": "openai/gpt-5.2-codex",
  "onegpt-gpt-5.1-codex-max": "openai/gpt-5.3-codex",
  "onegpt-gpt-5.2-codex": "openai/gpt-5.2-codex",
  "onegpt-gpt-5.3-codex": "openai/gpt-5.3-codex",
  "onegpt-gpt5-codex": "openai/gpt-5.3-codex",

  // Google
  "onegpt-google-lite": "google/gemini-3.1-flash-lite-preview",
  "onegpt-google": "google/gemini-3-flash-preview",
  "onegpt-google-think": "google/gemini-3-flash-preview",
  "onegpt-google-pro": "google/gemini-3.1-pro-preview",
  "onegpt-google-pro-think": "google/gemini-3.1-pro-preview",
  "onegpt-gemini-3-flash": "google/gemini-3-flash-preview",
  "onegpt-gemini-3-flash-think": "google/gemini-3-flash-preview",
  "onegpt-gemini-3.1-flash-lite": "google/gemini-3.1-flash-lite-preview",
  "onegpt-gemini-3.1-flash-lite-think": "google/gemini-3.1-flash-lite-preview",
  "onegpt-gemini-3.1-pro": "google/gemini-3.1-pro-preview",

  // Anthropic
  "onegpt-anthropic-sonnet-4.6": "anthropic/claude-sonnet-4.6",
  "onegpt-anthropic-opus-4.6": "anthropic/claude-opus-4.6",

  // Mistral
  "onegpt-ministral-3b": "mistralai/ministral-3b-latest",
  "onegpt-ministral-8b": "mistralai/ministral-8b-latest",
  "onegpt-ministral-14b": "mistralai/ministral-8b-latest",
  "onegpt-devstral": "mistralai/devstral-2512",
  "onegpt-devstral-small": "mistralai/devstral-small-latest",
  "onegpt-mistral-large": "mistralai/mistral-large-latest",
  "onegpt-mistral-medium": "mistralai/mistral-medium-latest",
  "onegpt-magistral-small": "mistralai/magistral-small-latest",
  "onegpt-magistral-medium": "mistralai/magistral-medium-latest",
  "onegpt-mistral-small": "mistralai/mistral-small-2603",
  "onegpt-mistral-small-think": "mistralai/mistral-small-2603",
  "onegpt-leanstral": "mistralai/mistral-small-creative",

  // Arcee
  "onegpt-trinity-mini": "arcee-ai/trinity-large-preview:free",
  "onegpt-trinity-large": "arcee-ai/trinity-large-preview:free",

  // DeepSeek
  "onegpt-deepseek-v3": "deepseek/deepseek-chat",
  "onegpt-deepseek-v3.1-terminus": "deepseek/deepseek-chat",
  "onegpt-deepseek-chat": "deepseek/deepseek-chat",
  "onegpt-deepseek-chat-think": "deepseek/deepseek-reasoner",
  "onegpt-deepseek-chat-exp": "deepseek/deepseek-chat",
  "onegpt-deepseek-chat-think-exp": "deepseek/deepseek-reasoner",
  "onegpt-deepseek-r1": "deepseek/deepseek-reasoner",
  "onegpt-deepseek-r1-0528": "deepseek/deepseek-reasoner",

  // Cohere
  "onegpt-cmd-a": "cohere/command-a-03-2025",
  "onegpt-cmd-a-think": "cohere/command-a-03-2025",

  // Moonshot (Kimi)
  "onegpt-kimi-k2.5": "moonshotai/kimi-k2.5",

  // Minimax
  "onegpt-minimax-m2.7": "minimax/minimax-m2.7",
  "onegpt-minimax-m2.5": "minimax/minimax-m2.5",

  // Zhipu (GLM)
  "onegpt-glm-5": "deepinfra/fp4",
  "onegpt-glm-4.7": "zhipu/glm-4-plus",
  "onegpt-glm-4.7-flash": "zhipu/glm-4-flash",

  // Kwaipilot
  "onegpt-kat-coder": "kwaipilot/kat-coder-pro",

  // Xiaomi
  "onegpt-mimo-v2-flash": "xiaomi/mimo-v2-flash",
  "onegpt-mimo-v2-pro": "xiaomi/mimo-v2-pro",

  // Amazon
  "onegpt-nova-2-lite": "amazon/nova-lite-v1",

  // Vercel
  "onegpt-v0-10": "vercel/v0-1.0-md",
  "onegpt-v0-15": "vercel/v0-1.5-md",

  // StepFun
  "onegpt-step-3.5-flash": "stepfun/step-3.5-flash",

  // Inception
  "onegpt-mercury-2": "inception/mercury-2",

  // Auto → default
  "onegpt-auto": "x-ai/grok-4.20-beta",
} as const;

const MODEL_PROVIDER_OPTIONS: Partial<
  Record<
    keyof typeof MODEL_MAP,
    {
      openrouter: {
        provider: {
          order: string[];
          allow_fallbacks: boolean;
        };
      };
    }
  >
> = {
  "onegpt-kimi-k2.5": {
    openrouter: {
      provider: {
        order: ["inceptron/int4"],
        allow_fallbacks: false,
      },
    },
  },
} as const;

const DEFAULT_MODEL = "x-ai/grok-4.20-beta";

export const SUPPORTED_MODEL_VALUES = Object.keys(MODEL_MAP);

export type SupportedModel = keyof typeof MODEL_MAP;

export function isSupportedModel(
  modelValue: string,
): modelValue is SupportedModel {
  return modelValue in MODEL_MAP;
}

export function mapModelToOpenRouter(modelValue: keyof typeof MODEL_MAP) {
  return MODEL_MAP[modelValue] ?? DEFAULT_MODEL;
}

export function getOpenRouterProviderOptions(
  modelValue: keyof typeof MODEL_MAP,
) {
  return MODEL_PROVIDER_OPTIONS[modelValue];
}
