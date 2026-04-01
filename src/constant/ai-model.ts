// Types, interfaces, and helper functions for AI models
// Models and providers data is defined below the type/interface declarations

type JsonPrimitive = string | number | boolean | null;
type JsonValue = JsonPrimitive | JsonObject | JsonArray;
type JsonObject = { [key: string]: JsonValue };
type JsonArray = JsonValue[];

export interface ModelParameters {
  temperature?: number;
  topP?: number;
  topK?: number;
  minP?: number;
  frequencyPenalty?: number;
  presencePenalty?: number;
  maxOutputTokens?: number;
}

// Provider definitions for model categorization
export type ModelProvider =
  | "xai"
  | "openai"
  | "anthropic"
  | "google"
  | "alibaba"
  | "deepseek"
  | "zhipu"
  | "moonshot"
  | "minimax";

export interface ProviderInfo {
  id: ModelProvider;
  name: string;
  icon: string; // SVG path or icon identifier
  hasNew?: boolean;
}

export interface Model {
  value: string;
  openrouterId: string;
  label: string;
  description: string;
  vision: boolean;
  reasoning: boolean;
  experimental: boolean;
  category: string;
  pro: boolean;
  max?: boolean; // Requires Max plan (superset of Pro)
  requiresAuth: boolean;
  freeUnlimited: boolean;
  maxOutputTokens: number;
  extreme?: boolean;
  fast?: boolean;
  isNew?: boolean;
  parameters?: ModelParameters;
  openrouterProviderOptions?: OpenRouterProviderOptions;
  provider?: ModelProvider; // Optional - will be derived if not specified
}

export const PROVIDERS: Record<ModelProvider, ProviderInfo> = {
  xai: { id: "xai", name: "xAI", icon: "xai", hasNew: true },
  openai: { id: "openai", name: "OpenAI", icon: "openai", hasNew: true },
  anthropic: {
    id: "anthropic",
    name: "Anthropic",
    icon: "anthropic",
    hasNew: true,
  },
  google: { id: "google", name: "Google", icon: "google", hasNew: true },
  alibaba: { id: "alibaba", name: "Alibaba", icon: "alibaba", hasNew: true },
  zhipu: { id: "zhipu", name: "Zhipu AI", icon: "zhipu" },
  minimax: { id: "minimax", name: "Minimax", icon: "minimax", hasNew: true },
  deepseek: { id: "deepseek", name: "DeepSeek", icon: "deepseek" },
  moonshot: { id: "moonshot", name: "MoonShot", icon: "moonshot" },
};

export const models: Model[] = [
  // Models (xAI)
  {
    value: "onegpt-grok-4.20-multi-agent-beta",
    openrouterId: "x-ai/grok-4.20-multi-agent-beta",
    label: "Grok 4.20 Multi Agent Beta",
    description: "xAI's experimental beta multi-agent model",
    vision: true,
    reasoning: true,
    experimental: true,
    category: "Pro",
    pro: true,
    requiresAuth: true,
    freeUnlimited: false,
    maxOutputTokens: 30000,
    isNew: true,
    provider: "xai",
  },
  {
    value: "onegpt-grok-4.20-experimental-beta-0304",
    openrouterId: "x-ai/grok-4.20-beta",
    label: "Grok 4.20 Beta",
    description: "xAI's experimental beta chat model",
    vision: true,
    reasoning: false,
    experimental: true,
    category: "Pro",
    pro: true,
    requiresAuth: true,
    freeUnlimited: false,
    maxOutputTokens: 30000,
    isNew: true,
    provider: "xai",
  },
  {
    value: "onegpt-grok-4.20-experimental-beta-0304-thinking",
    openrouterId: "x-ai/grok-4.20-beta",
    label: "Grok 4.20 Beta Thinking",
    description: "xAI's experimental beta reasoning model",
    vision: true,
    reasoning: true,
    experimental: true,
    category: "Pro",
    pro: true,
    requiresAuth: true,
    freeUnlimited: false,
    maxOutputTokens: 30000,
    isNew: true,
    provider: "xai",
  },
  {
    value: "onegpt-qwen-32b",
    openrouterId: "qwen/qwen3.5-27b",
    label: "Qwen 3 32B",
    description: "Alibaba's base LLM",
    vision: false,
    reasoning: false,
    experimental: false,
    category: "Free",
    pro: false,
    requiresAuth: true,
    freeUnlimited: false,
    maxOutputTokens: 40960,
    fast: true,
    parameters: {
      temperature: 0.7,
      topP: 0.8,
      topK: 20,
      minP: 0,
    },
    provider: "alibaba",
  },
  {
    value: "onegpt-gpt-5.4",
    openrouterId: "openai/gpt-5.4",
    label: "GPT 5.4 Instant",
    description: "OpenAI's latest and greatest LLM",
    vision: true,
    reasoning: false,
    experimental: false,
    category: "Pro",
    pro: true,
    requiresAuth: true,
    freeUnlimited: false,
    maxOutputTokens: 16000,
    extreme: true,
    fast: false,
    isNew: true,
    provider: "openai",
  },
  {
    value: "onegpt-gpt-5.4-thinking",
    openrouterId: "openai/gpt-5.4-pro",
    label: "GPT 5.4 Thinking",
    description: "OpenAI's latest and greatest reasoning LLM",
    vision: true,
    reasoning: true,
    experimental: false,
    category: "Pro",
    pro: true,
    requiresAuth: true,
    freeUnlimited: false,
    maxOutputTokens: 16000,
    extreme: true,
    fast: false,
    isNew: true,
    provider: "openai",
  },
  {
    value: "onegpt-deepseek-chat",
    openrouterId: "deepseek/deepseek-chat",
    label: "DeepSeek v3.2",
    description: "DeepSeek's advanced chat LLM",
    vision: false,
    reasoning: false,
    experimental: false,
    category: "Pro",
    pro: true,
    requiresAuth: true,
    freeUnlimited: false,
    maxOutputTokens: 16000,
    isNew: true,
    parameters: {
      temperature: 1.0,
      topP: 0.95,
    },
    provider: "deepseek",
  },
  {
    value: "onegpt-deepseek-chat-think",
    openrouterId: "deepseek/deepseek-reasoner",
    label: "DeepSeek v3.2 Thinking",
    description: "DeepSeek's advanced chat LLM with thinking",
    vision: false,
    reasoning: true,
    experimental: false,
    category: "Pro",
    pro: true,
    requiresAuth: true,
    freeUnlimited: false,
    maxOutputTokens: 16000,
    isNew: true,
    provider: "deepseek",
  },
  {
    value: "onegpt-deepseek-r1",
    openrouterId: "deepseek/deepseek-reasoner",
    label: "DeepSeek R1",
    description: "DeepSeek's advanced reasoning LLM",
    vision: false,
    reasoning: true,
    experimental: false,
    category: "Pro",
    pro: true,
    requiresAuth: true,
    freeUnlimited: false,
    maxOutputTokens: 16000,
    isNew: false,
    provider: "deepseek",
  },
  {
    value: "onegpt-qwen-3.5-plus",
    openrouterId: "qwen/qwen3.5-plus-02-15",
    label: "Qwen 3.5 Plus",
    description: "Alibaba's latest flagship LLM with vision and reasoning",
    vision: true,
    reasoning: true,
    experimental: false,
    category: "Pro",
    pro: true,
    requiresAuth: true,
    freeUnlimited: false,
    maxOutputTokens: 130000,
    fast: false,
    isNew: true,
    provider: "alibaba",
  },
  {
    value: "onegpt-qwen-3.5-flash",
    openrouterId: "qwen/qwen3.5-flash-02-23",
    label: "Qwen 3.5 Flash",
    description: "Alibaba's fast vision reasoning LLM",
    vision: true,
    reasoning: false,
    experimental: false,
    category: "Pro",
    pro: true,
    requiresAuth: true,
    freeUnlimited: false,
    maxOutputTokens: 10000,
    fast: true,
    isNew: true,
    provider: "alibaba",
    parameters: {
      temperature: 1,
      topP: 0.95,
      topK: 20,
      minP: 0,
      presencePenalty: 1.5,
    },
  },
  {
    value: "onegpt-kimi-k2.5",
    openrouterId: "moonshotai/kimi-k2.5",
    label: "Kimi K2.5",
    description: "MoonShot AI's latest vision-enabled LLM",
    vision: true,
    reasoning: true,
    experimental: false,
    category: "Free",
    pro: false,
    requiresAuth: true,
    freeUnlimited: false,
    maxOutputTokens: 10000,
    isNew: true,
    provider: "moonshot",
    openrouterProviderOptions: {
      openrouter: {
        provider: {
          order: ["inceptron/int4"],
          allow_fallbacks: false,
        },
      },
    },
  },
  {
    value: "onegpt-minimax-m2.7",
    openrouterId: "minimax/minimax-m2.7",
    label: "MiniMax M2.7",
    description: "MiniMax's latest high-speed reasoning LLM",
    vision: false,
    reasoning: true,
    experimental: false,
    category: "Free",
    pro: false,
    requiresAuth: true,
    freeUnlimited: false,
    maxOutputTokens: 10000,
    fast: true,
    isNew: true,
    parameters: {
      temperature: 1.0,
      topP: 0.95,
      topK: 40,
    },
    provider: "minimax",
  },
  {
    value: "onegpt-minimax-m2.5",
    openrouterId: "minimax/minimax-m2.5",
    label: "Minimax M2.5",
    description: "Minimax's most capable reasoning LLM",
    vision: false,
    reasoning: true,
    experimental: false,
    category: "Pro",
    pro: true,
    requiresAuth: true,
    freeUnlimited: false,
    maxOutputTokens: 10000,
    isNew: false,
    parameters: {
      temperature: 1.0,
      topP: 0.95,
      topK: 40,
    },
    provider: "minimax",
  },
  {
    value: "onegpt-glm-4.7",
    openrouterId: "zhipu/glm-4-plus",
    label: "GLM 4.7",
    description: "Zhipu AI's latest advanced reasoning LLM",
    vision: false,
    reasoning: true,
    experimental: false,
    category: "Pro",
    pro: true,
    requiresAuth: true,
    freeUnlimited: false,
    maxOutputTokens: 20000,
    isNew: false,
    fast: true,
    parameters: {
      temperature: 1,
      topP: 0.95,
    },
    provider: "zhipu",
  },
  {
    value: "onegpt-glm-4.7-flash",
    openrouterId: "zhipu/glm-4-flash",
    label: "GLM 4.7 Flash",
    description: "Zhipu AI's latest fast vision reasoning LLM",
    vision: true,
    reasoning: true,
    experimental: false,
    category: "Pro",
    pro: true,
    requiresAuth: true,
    freeUnlimited: false,
    maxOutputTokens: 20000,
    isNew: false,
    fast: true,
    provider: "zhipu",
  },
  {
    value: "onegpt-glm-5",
    openrouterId: "z-ai/glm-5",
    label: "GLM 5",
    description: "Zhipu AI's most powerful LLM",
    vision: false,
    reasoning: false,
    experimental: false,
    category: "Free",
    pro: false,
    requiresAuth: true,
    freeUnlimited: false,
    maxOutputTokens: 20000,
    isNew: true,
    parameters: {
      temperature: 1,
      topP: 0.95,
    },
    provider: "zhipu",
  },
  {
    value: "onegpt-gemini-3-flash",
    openrouterId: "google/gemini-3-flash-preview",
    label: "Gemini 3 Flash",
    description: "Google's latest small SOTA LLM",
    vision: true,
    reasoning: false,
    experimental: false,
    category: "Pro",
    pro: true,
    requiresAuth: true,
    freeUnlimited: false,
    extreme: true,
    maxOutputTokens: 10000,
    isNew: true,
    provider: "google",
  },
  {
    value: "onegpt-gemini-3-flash-think",
    openrouterId: "google/gemini-3-flash-preview",
    label: "Gemini 3 Flash Thinking",
    description: "Google's latest small SOTA LLM with thinking",
    vision: true,
    reasoning: true,
    experimental: false,
    category: "Pro",
    pro: true,
    requiresAuth: true,
    freeUnlimited: false,
    extreme: true,
    maxOutputTokens: 10000,
    isNew: true,
    provider: "google",
  },
  {
    value: "onegpt-gemini-3.1-flash-lite",
    openrouterId: "google/gemini-3.1-flash-lite-preview",
    label: "Gemini 3.1 Flash Lite",
    description: "Google's newest lightweight flash LLM",
    vision: true,
    reasoning: false,
    experimental: false,
    category: "Free",
    pro: false,
    requiresAuth: true,
    freeUnlimited: false,
    extreme: true,
    maxOutputTokens: 10000,
    fast: true,
    isNew: true,
    provider: "google",
  },
  {
    value: "onegpt-gemini-3.1-flash-lite-think",
    openrouterId: "google/gemini-3.1-flash-lite-preview",
    label: "Gemini 3.1 Flash Lite Thinking",
    description: "Google's newest lightweight flash LLM with thinking",
    vision: true,
    reasoning: true,
    experimental: false,
    category: "Pro",
    pro: true,
    requiresAuth: true,
    freeUnlimited: false,
    extreme: true,
    maxOutputTokens: 10000,
    fast: true,
    isNew: true,
    provider: "google",
  },
  {
    value: "onegpt-anthropic-sonnet-4.6",
    openrouterId: "anthropic/claude-sonnet-4.6",
    label: "Claude Sonnet 4.6",
    description: "Anthropic's latest Sonnet LLM",
    vision: true,
    reasoning: false,
    experimental: false,
    category: "Max",
    pro: true,
    max: true,
    requiresAuth: true,
    freeUnlimited: false,
    maxOutputTokens: 8000,
    isNew: true,
    provider: "anthropic",
  },
  {
    value: "onegpt-anthropic-opus-4.6",
    openrouterId: "anthropic/claude-opus-4.6",
    label: "Claude 4.6 Opus",
    description: "Anthropic's most advanced LLM",
    vision: true,
    reasoning: false,
    experimental: false,
    category: "Max",
    pro: true,
    max: true,
    requiresAuth: true,
    freeUnlimited: false,
    maxOutputTokens: 8000,
    isNew: true,
    provider: "anthropic",
  },
];

export type OpenRouterProviderOptions = Record<string, JsonObject>;

export type SupportedModel = string;

const SUPPORTED_MODEL_VALUE_SET = new Set(models.map((model) => model.value));

export const DEFAULT_MODEL_VALUE = "onegpt-kimi-k2.5";
export const TITLE_MODEL_VALUE = "onegpt-minimax-m2.7";
export const DEFAULT_FAVORITE_MODELS: SupportedModel[] = [
  "onegpt-kimi-k2.5",
  "onegpt-gpt-5.4",
  "onegpt-glm-5",
  "onegpt-minimax-m2.7",
];
export const SUPPORTED_MODEL_VALUES = models.map(
  (model) => model.value,
) as SupportedModel[];

export function isSupportedModel(
  modelValue: string,
): modelValue is SupportedModel {
  return SUPPORTED_MODEL_VALUE_SET.has(modelValue);
}

export function getSupportedModelValues() {
  return SUPPORTED_MODEL_VALUES;
}

export function getDefaultModelValue() {
  return DEFAULT_MODEL_VALUE;
}

export function getTitleModelValue() {
  return TITLE_MODEL_VALUE;
}

export function getOpenRouterModelId(modelValue: string) {
  return (
    getModelConfig(modelValue)?.openrouterId ||
    getModelConfig(DEFAULT_MODEL_VALUE)?.openrouterId ||
    "x-ai/grok-4.20-beta"
  );
}

export function mapModelToOpenRouter(modelValue: string) {
  return getOpenRouterModelId(modelValue);
}

export function getOpenRouterProviderOptions(modelValue: string) {
  return getModelConfig(modelValue)?.openrouterProviderOptions;
}

// ---------------------------------------------------------------------------
// Helper functions for model access checks
// ---------------------------------------------------------------------------

export function getModelConfig(modelValue: string): Model | undefined {
  return models.find((model) => model.value === modelValue);
}

export function requiresAuthentication(_modelValue: string): boolean {
  return true;
}

export function requiresProSubscription(modelValue: string): boolean {
  const model = getModelConfig(modelValue);
  return model?.pro || false;
}

export function requiresMaxSubscription(modelValue: string): boolean {
  const model = getModelConfig(modelValue);
  return model?.max || false;
}

export function isFreeUnlimited(modelValue: string): boolean {
  const model = getModelConfig(modelValue);
  return model?.freeUnlimited || false;
}

export function hasVisionSupport(modelValue: string): boolean {
  const model = getModelConfig(modelValue);
  return model?.vision || false;
}

export function hasReasoningSupport(modelValue: string): boolean {
  const model = getModelConfig(modelValue);
  return model?.reasoning || false;
}

export function isExperimentalModel(modelValue: string): boolean {
  const model = getModelConfig(modelValue);
  return model?.experimental || false;
}

export function getMaxOutputTokens(modelValue: string): number {
  const model = getModelConfig(modelValue);
  return model?.maxOutputTokens || 8000;
}

export function getModelParameters(modelValue: string): ModelParameters {
  const model = getModelConfig(modelValue);
  return model?.parameters || {};
}

// Access control helper
export function canUseModel(
  modelValue: string,
  user: unknown,
  isProUser: boolean,
  isMaxUser: boolean = false,
): { canUse: boolean; reason?: string } {
  const model = getModelConfig(modelValue);

  if (!model) {
    return { canUse: false, reason: "Model not found" };
  }

  // All models require authentication.
  if (!user) {
    return { canUse: false, reason: "authentication_required" };
  }

  // Check if model requires Max subscription
  if (model.max && !isMaxUser) {
    return { canUse: false, reason: "max_subscription_required" };
  }

  // Check if model requires Pro subscription (Max is a superset of Pro)
  if (model.pro && !isProUser && !isMaxUser) {
    return { canUse: false, reason: "pro_subscription_required" };
  }

  return { canUse: true };
}

// Helper to check if user should bypass rate limits
export function shouldBypassRateLimits(modelValue: string): boolean {
  const model = getModelConfig(modelValue);
  return model?.freeUnlimited || false;
}

// Get acceptable file types for a model
export function getAcceptedFileTypes(modelValue: string): string {
  const model = getModelConfig(modelValue);

  // Only image attachments are supported.
  if (model?.vision) {
    return "image/*";
  }

  return "";
}

// Check if a model supports extreme mode
export function supportsExtremeMode(_modelValue: string): boolean {
  // Extreme mode restrictions removed: allow all models in extreme mode
  return true;
}

// Get models that support extreme mode
export function getExtremeModels(): Model[] {
  // With restrictions removed, all models are considered extreme-capable
  return models;
}

// Canvas mode is not supported in this application
export function supportsCanvasMode(_modelValue: string): boolean {
  return false;
}

// ---------------------------------------------------------------------------
// Region restrictions
// ---------------------------------------------------------------------------

// Restricted regions for OpenAI and Anthropic models
const RESTRICTED_REGIONS = ["CN", "KP", "RU"]; // China, North Korea, Russia

// Models that should be filtered in restricted regions
const OPENAI_MODELS = ["onegpt-gpt-5.4", "onegpt-gpt-5.4-thinking"];

const ANTHROPIC_MODELS = [
  "onegpt-anthropic-sonnet-4.6",
  "onegpt-anthropic-opus-4.6",
];

// Check if a model should be filtered based on region
export function isModelRestrictedInRegion(
  modelValue: string,
  countryCode?: string,
): boolean {
  if (!countryCode) return false;

  const isRestricted = RESTRICTED_REGIONS.includes(countryCode.toUpperCase());
  if (!isRestricted) return false;

  const isOpenAI = OPENAI_MODELS.includes(modelValue);
  const isAnthropic = ANTHROPIC_MODELS.includes(modelValue);

  return isOpenAI || isAnthropic;
}

// Filter models based on user's region
export function getFilteredModels(countryCode?: string): Model[] {
  if (!countryCode || !RESTRICTED_REGIONS.includes(countryCode.toUpperCase())) {
    return models;
  }

  return models.filter(
    (model) => !isModelRestrictedInRegion(model.value, countryCode),
  );
}

// Legacy arrays for backward compatibility (deprecated - use helper functions instead)
export const authRequiredModels = models.map((m) => m.value);
export const proRequiredModels = models
  .filter((m) => m.pro)
  .map((m) => m.value);
export const freeUnlimitedModels = models
  .filter((m) => m.freeUnlimited)
  .map((m) => m.value);

// Helper function to derive provider from model value/label patterns
export function getModelProvider(
  modelValue: string,
  _label?: string,
): ModelProvider {
  const model = getModelConfig(modelValue);
  if (model?.provider) return model.provider;

  const openrouterId = model?.openrouterId;
  if (!openrouterId) return "openai";

  const providerPrefix = openrouterId.split("/")[0];
  switch (providerPrefix) {
    case "x-ai":
      return "xai";
    case "openai":
      return "openai";
    case "google":
      return "google";
    case "anthropic":
      return "anthropic";
    case "qwen":
      return "alibaba";
    case "deepseek":
      return "deepseek";
    case "moonshotai":
      return "moonshot";
    case "minimax":
      return "minimax";
    case "zhipu":
    case "deepinfra":
      return "zhipu";
    default:
      return "openai";
  }
}

// Get provider info for a model
export function getModelProviderInfo(modelValue: string): ProviderInfo {
  const model = getModelConfig(modelValue);
  const provider =
    model?.provider || getModelProvider(modelValue, model?.label);
  return PROVIDERS[provider];
}

// Get all unique providers that have models
export function getActiveProviders(): ProviderInfo[] {
  const providerSet = new Set<ModelProvider>();
  for (const model of models) {
    const provider =
      model.provider || getModelProvider(model.value, model.label);
    providerSet.add(provider);
  }
  return Array.from(providerSet).map((p) => PROVIDERS[p]);
}

// Get models by provider
export function getModelsByProvider(provider: ModelProvider): Model[] {
  return models.filter((m) => {
    const modelProvider = m.provider || getModelProvider(m.value, m.label);
    return modelProvider === provider;
  });
}
