// Types, interfaces, and helper functions for AI models
import { models, PROVIDERS } from '@/app/constant/ai-model';

export { models, PROVIDERS };

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
  | 'scira'
  | 'xai'
  | 'openai'
  | 'anthropic'
  | 'google'
  | 'alibaba'
  | 'mistral'
  | 'deepseek'
  | 'zhipu'
  | 'cohere'
  | 'moonshot'
  | 'minimax'
  | 'bytedance'
  | 'arcee'
  | 'vercel'
  | 'amazon'
  | 'xiaomi'
  | 'kwaipilot'
  | 'stepfun'
  | 'sarvam'
  | 'inception'
  | 'nvidia';

export interface ProviderInfo {
  id: ModelProvider;
  name: string;
  icon: string; // SVG path or icon identifier
  hasNew?: boolean;
}

export interface Model {
  value: string;
  label: string;
  description: string;
  vision: boolean;
  reasoning: boolean;
  experimental: boolean;
  category: string;
  pdf: boolean;
  pro: boolean;
  max?: boolean; // Requires Max plan (superset of Pro)
  requiresAuth: boolean;
  freeUnlimited: boolean;
  maxOutputTokens: number;
  extreme?: boolean;
  fast?: boolean;
  isNew?: boolean;
  parameters?: ModelParameters;
  provider?: ModelProvider; // Optional - will be derived if not specified
}

// ---------------------------------------------------------------------------
// Helper functions for model access checks
// ---------------------------------------------------------------------------

export function getModelConfig(modelValue: string): Model | undefined {
  return models.find((model) => model.value === modelValue);
}

export function requiresAuthentication(modelValue: string): boolean {
  const model = getModelConfig(modelValue);
  return model?.requiresAuth || false;
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

export function hasPdfSupport(modelValue: string): boolean {
  const model = getModelConfig(modelValue);
  return model?.pdf || false;
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
  user: any,
  isProUser: boolean,
  isMaxUser: boolean = false,
): { canUse: boolean; reason?: string } {
  const model = getModelConfig(modelValue);

  if (!model) {
    return { canUse: false, reason: 'Model not found' };
  }

  // Check if model requires authentication
  if (model.requiresAuth && !user) {
    return { canUse: false, reason: 'authentication_required' };
  }

  // Check if model requires Max subscription
  if (model.max && !isMaxUser) {
    return { canUse: false, reason: 'max_subscription_required' };
  }

  // Check if model requires Pro subscription (Max is a superset of Pro)
  if (model.pro && !isProUser && !isMaxUser) {
    return { canUse: false, reason: 'pro_subscription_required' };
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
  // Document file types for file_query_search tool - available for ALL models
  const documentTypes = '.csv,.xlsx,.xls,.docx';

  // Vision models get images + documents, PDF models also get PDFs
  if (model?.vision) {
    if (model?.pdf) {
      return `image/*,.pdf,${documentTypes}`;
    }
    return `image/*,${documentTypes}`;
  }

  // Non-vision models only get document types for file_query_search
  return documentTypes;
}

// Check if a model supports extreme mode
export function supportsExtremeMode(modelValue: string): boolean {
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
const RESTRICTED_REGIONS = ['CN', 'KP', 'RU']; // China, North Korea, Russia

// Models that should be filtered in restricted regions
const OPENAI_MODELS = [
  'scira-gpt-4.1',
  'scira-gpt-4.1-mini',
  'scira-gpt-4.1-nano',
  'scira-gpt5',
  'scira-gpt5-mini',
  'scira-gpt5-nano',
  'scira-gpt5-medium',
  'scira-gpt5-codex',
  'scira-gpt-5.1',
  'scira-gpt-5.1-codex',
  'scira-gpt-5.1-codex-mini',
  'scira-gpt-5.1-codex-max',
  'scira-gpt-5.1-thinking',
  'scira-gpt-5.2',
  'scira-gpt-5.4',
  'scira-gpt-5.4-mini',
  'scira-gpt-5.4-nano',
  'scira-gpt-5.4-thinking',
  'scira-gpt-5.4-thinking-xhigh',
  'scira-gpt-5.2-thinking',
  'scira-gpt-5.2-thinking-xhigh',
  'scira-gpt-5.2-codex',
  'scira-gpt-5.3-codex',
  'scira-o3',
  'scira-o4-mini',
];

const ANTHROPIC_MODELS = [
  'scira-haiku',
  'scira-anthropic-small',
  'scira-anthropic',
  'scira-anthropic-think',
  'scira-anthropic-opus',
  'scira-anthropic-opus-think',
  'scira-anthropic-sonnet-4.6',
  'scira-anthropic-sonnet-4.6-think',
  'scira-anthropic-opus-4.6',
  'scira-anthropic-opus-4.6-think',
];

// Check if a model should be filtered based on region
export function isModelRestrictedInRegion(modelValue: string, countryCode?: string): boolean {
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

  return models.filter((model) => !isModelRestrictedInRegion(model.value, countryCode));
}

// Legacy arrays for backward compatibility (deprecated - use helper functions instead)
export const authRequiredModels = models.filter((m) => m.requiresAuth).map((m) => m.value);
export const proRequiredModels = models.filter((m) => m.pro).map((m) => m.value);
export const freeUnlimitedModels = models.filter((m) => m.freeUnlimited).map((m) => m.value);

// Helper function to derive provider from model value/label patterns
export function getModelProvider(modelValue: string, label?: string): ModelProvider {
  const value = modelValue.toLowerCase();
  const modelLabel = (label || '').toLowerCase();

  // xAI (Grok)
  if (
    value.includes('grok') ||
    value.includes('scira-default') ||
    (value.includes('scira-code') && !value.includes('codex'))
  ) {
    return 'xai';
  }

  // OpenAI (GPT, o3, o4)
  if (value.includes('gpt') || value.includes('scira-o3') || value.includes('scira-o4')) {
    return 'openai';
  }

  // Anthropic (Claude)
  if (value.includes('anthropic') || value.includes('haiku') || modelLabel.includes('claude')) {
    return 'anthropic';
  }

  // Google (Gemini)
  if (value.includes('google') || value.includes('gemini')) {
    return 'google';
  }

  // Alibaba (Qwen)
  if (value.includes('qwen')) {
    return 'alibaba';
  }

  // Mistral (Mistral, Ministral, Magistral, Devstral, Leanstral)
  if (
    value.includes('mistral') ||
    value.includes('ministral') ||
    value.includes('magistral') ||
    value.includes('devstral') ||
    value.includes('leanstral')
  ) {
    return 'mistral';
  }

  // DeepSeek
  if (value.includes('deepseek')) {
    return 'deepseek';
  }

  // Zhipu (GLM)
  if (value.includes('glm')) {
    return 'zhipu';
  }

  // Cohere (Command)
  if (value.includes('cmd') || modelLabel.includes('command')) {
    return 'cohere';
  }

  // MoonShot (Kimi)
  if (value.includes('kimi')) {
    return 'moonshot';
  }

  // Minimax
  if (value.includes('minimax')) {
    return 'minimax';
  }

  // ByteDance (Seed)
  if (value.includes('seed')) {
    return 'bytedance';
  }

  // Arcee (Trinity)
  if (value.includes('trinity')) {
    return 'arcee';
  }

  // Vercel (v0)
  if (value.includes('v0')) {
    return 'vercel';
  }

  // Amazon (Nova)
  if (value.includes('nova')) {
    return 'amazon';
  }

  // Xiaomi (Mimo)
  if (value.includes('mimo')) {
    return 'xiaomi';
  }

  // Kwaipilot (KAT)
  if (value.includes('kat')) {
    return 'kwaipilot';
  }

  // StepFun (Step)
  if (value.includes('step')) {
    return 'stepfun';
  }

  // Sarvam
  if (value.includes('sarvam')) {
    return 'sarvam';
  }

  // Inception (Mercury)
  if (value.includes('mercury')) {
    return 'inception';
  }

  // Default fallback
  return 'openai';
}

// Get provider info for a model
export function getModelProviderInfo(modelValue: string): ProviderInfo {
  const model = getModelConfig(modelValue);
  const provider = model?.provider || getModelProvider(modelValue, model?.label);
  return PROVIDERS[provider];
}

// Get all unique providers that have models
export function getActiveProviders(): ProviderInfo[] {
  const providerSet = new Set<ModelProvider>();
  for (const model of models) {
    const provider = model.provider || getModelProvider(model.value, model.label);
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
