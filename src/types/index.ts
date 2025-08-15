export type Provider = 'openai' | 'gemini' | 'claude' | 'grok' | 'llama' | 'mistral' | 'cohere';

export interface ModelConfig {
  id: string;
  name: string;
  provider: Provider;
  maxTokens: number;
}

export interface ProviderConfig {
  models: ModelConfig[];
  params: {
    temperature?: boolean;
    top_p?: boolean;
    top_k?: boolean;
    max_tokens?: boolean;
    reasoning_effort?: boolean;
    verbosity?: boolean;
    structured_output?: boolean;
    live_search?: boolean;
  };
}

export interface FormData {
  // Model selection
  model_id: string;
  provider: Provider;
  
  // User inputs
  user_prompt: string;
  domain_context?: string;
  audience?: string;
  tone?: string;
  style?: string;
  format_requirements?: string;
  hard_constraints?: string;
  prohibited?: string;
  success_criteria?: string;
  exemplars?: string;
  avoid_list?: string;
  
  // Model parameters
  temperature: number;
  top_p?: number;
  top_k?: number;
  max_tokens: number;
  reasoning_effort?: 'low' | 'medium' | 'high';
  verbosity?: 'concise' | 'standard' | 'detailed';
  structured_output: boolean;
  live_search?: boolean;
  enable_parallelization: boolean;
}

export interface OptimizedResponse {
  optimized_prompt: string;
  thought_process: string[];
  input_checklist: string[];
  raw_response?: string;
}

export interface PromptSession {
  id: string;
  timestamp: number;
  form: FormData;
  response?: OptimizedResponse;
}