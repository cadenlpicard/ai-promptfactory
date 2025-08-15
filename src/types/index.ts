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
  // Target model selection (for optimization)
  targetModel: string;
  
  // Model selection (legacy fields for compatibility)
  model_id: string;
  provider: Provider;
  
  // User inputs
  user_prompt: string;
  rawPrompt?: string; // New field mapping to user_prompt
  domain_context?: string;
  domainContext?: string; // Camel case version
  audience?: string;
  tone?: string;
  style?: string;
  format_requirements?: string;
  formatRequirements?: string; // Camel case version
  hard_constraints?: string;
  hardConstraints?: string; // Camel case version
  prohibited?: string;
  success_criteria?: string;
  successCriteria?: string; // Camel case version
  exemplars?: string;
  avoid_list?: string;
  
  // Model parameters
  temperature: number;
  creativity?: number; // Maps to temperature for prompt generation
  top_p?: number;
  top_k?: number;
  max_tokens: number;
  responseLengthTokens?: number; // Maps to max_tokens
  reasoning_effort?: 'low' | 'medium' | 'high';
  verbosity?: 'concise' | 'standard' | 'detailed';
  structured_output: boolean;
  live_search?: boolean;
  enable_parallelization: boolean;
  enableParallelization?: boolean; // Camel case version
  focusLevel?: string;
  thinkingDepth?: string;
}

export interface OptimizedResponse {
  optimized_prompt: string;
  optimizedPrompt?: string; // Camel case version
  thought_process: string[];
  briefThoughtProcess?: string; // New field for single string
  input_checklist: string[];
  inputChecklist?: string; // New field for single string
  raw_response?: string;
}

export interface PromptSession {
  id: string;
  timestamp: number;
  form: FormData;
  response?: OptimizedResponse;
}