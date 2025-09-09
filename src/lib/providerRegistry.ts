import { ProviderConfig, Provider, ModelConfig } from '@/types';

export const providerRegistry: Record<Provider, ProviderConfig> = {
  openai: {
    models: [
      { id: 'gpt-5-2025-08-07', name: 'GPT-5', provider: 'openai', maxTokens: 16384 },
      { id: 'gpt-4o', name: 'GPT-4o', provider: 'openai', maxTokens: 8192 },
    ],
    params: { 
      temperature: true, 
      top_p: true, 
      max_tokens: true, 
      reasoning_effort: true, 
      verbosity: true,
      structured_output: true
    }
  },
  gemini: {
    models: [
      { id: 'gemini-2.5-pro', name: 'Gemini 2.5 Pro', provider: 'gemini', maxTokens: 16384 },
      { id: 'gemini-2.5-flash', name: 'Gemini 2.5 Flash', provider: 'gemini', maxTokens: 8192 },
      { id: 'gemini-1.5-pro', name: 'Gemini 1.5 Pro', provider: 'gemini', maxTokens: 8192 },
      { id: 'gemini-1.5-flash', name: 'Gemini 1.5 Flash', provider: 'gemini', maxTokens: 8192 },
      { id: 'gemini-1.5-flash-8b', name: 'Gemini 1.5 Flash 8B', provider: 'gemini', maxTokens: 8192 },
      { id: 'gemini-experimental', name: 'Gemini Experimental', provider: 'gemini', maxTokens: 8192 },
      { id: 'gemini-thinking-exp-1219', name: 'Gemini Thinking Experimental', provider: 'gemini', maxTokens: 8192 },
      { id: 'learnlm-1.5-pro-experimental', name: 'LearnLM 1.5 Pro Experimental', provider: 'gemini', maxTokens: 8192 },
    ],
    params: { 
      temperature: true, 
      top_p: true, 
      top_k: true, 
      max_tokens: true,
      structured_output: true
    }
  },
  claude: {
    models: [
      { id: 'claude-sonnet-4-20250514', name: 'Claude 4 Sonnet', provider: 'claude', maxTokens: 8192 },
      { id: 'claude-opus-4-20250514', name: 'Claude 4 Opus', provider: 'claude', maxTokens: 8192 },
    ],
    params: { 
      temperature: true, 
      top_p: true, 
      top_k: true, 
      max_tokens: true,
      structured_output: true
    }
  },
  grok: {
    models: [
      { id: 'grok-4', name: 'Grok 4', provider: 'grok', maxTokens: 8192 },
      { id: 'grok-3', name: 'Grok 3', provider: 'grok', maxTokens: 8192 },
    ],
    params: { 
      temperature: true, 
      top_p: true, 
      max_tokens: true,
      live_search: true,
      structured_output: true
    }
  },
  llama: {
    models: [
      { id: 'llama-3.1-405b-instruct', name: 'Llama 3.1 405B', provider: 'llama', maxTokens: 8192 },
      { id: 'llama-3.1-70b-instruct', name: 'Llama 3.1 70B', provider: 'llama', maxTokens: 8192 },
      { id: 'llama-3.1-8b-instruct', name: 'Llama 3.1 8B', provider: 'llama', maxTokens: 8192 },
    ],
    params: { 
      temperature: true, 
      top_p: true, 
      top_k: true, 
      max_tokens: true,
      structured_output: true
    }
  },
  mistral: {
    models: [
      { id: 'mistral-large-2', name: 'Mistral Large 2', provider: 'mistral', maxTokens: 8192 },
      { id: 'mistral-medium-3', name: 'Mistral Medium 3', provider: 'mistral', maxTokens: 8192 },
      { id: 'mistral-small-3.1', name: 'Mistral Small 3.1', provider: 'mistral', maxTokens: 8192 },
      { id: 'codestral-latest', name: 'Codestral (Coding)', provider: 'mistral', maxTokens: 8192 },
    ],
    params: { 
      temperature: true, 
      top_p: true, 
      top_k: true, 
      max_tokens: true,
      structured_output: true
    }
  },
  cohere: {
    models: [
      { id: 'command-r+', name: 'Command R+', provider: 'cohere', maxTokens: 4096 },
      { id: 'command-r', name: 'Command R', provider: 'cohere', maxTokens: 4096 },
    ],
    params: { 
      temperature: true, 
      max_tokens: true,
      structured_output: true
    }
  }
};

export const getAllModels = (): ModelConfig[] => {
  return Object.values(providerRegistry).flatMap(config => config.models);
};

export const getProviderConfig = (provider: Provider): ProviderConfig => {
  return providerRegistry[provider];
};

export const getModelConfig = (modelId: string): ModelConfig | undefined => {
  return getAllModels().find(model => model.id === modelId);
};