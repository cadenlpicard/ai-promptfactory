import { supabase } from '@/integrations/supabase/client';
import { FormData, OptimizedResponse } from '@/types';

export interface PromptSessionData {
  id?: string;
  user_id?: string;
  title?: string;
  created_at?: string;
  updated_at?: string;
  
  // Form data
  model_id: string;
  provider: string;
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
  reasoning_effort?: string;
  verbosity?: string;
  structured_output: boolean;
  live_search?: boolean;
  enable_parallelization: boolean;
  
  // Optimization results
  optimized_prompt?: string;
  thought_process?: string[];
  input_checklist?: string[];
  raw_response?: string;
}

export async function savePromptSession(
  formData: FormData, 
  response?: OptimizedResponse
): Promise<{ data: PromptSessionData | null; error: any }> {
  try {
    // Generate a title from the user prompt (first 50 chars)
    const title = formData.user_prompt.length > 50 
      ? formData.user_prompt.substring(0, 50) + '...'
      : formData.user_prompt;

    const sessionData: Partial<PromptSessionData> = {
      title,
      // Form data
      model_id: formData.model_id,
      provider: formData.provider,
      user_prompt: formData.user_prompt,
      domain_context: formData.domain_context,
      audience: formData.audience,
      tone: formData.tone,
      style: formData.style,
      format_requirements: formData.format_requirements,
      hard_constraints: formData.hard_constraints,
      prohibited: formData.prohibited,
      success_criteria: formData.success_criteria,
      exemplars: formData.exemplars,
      avoid_list: formData.avoid_list,
      
      // Model parameters
      temperature: formData.temperature,
      top_p: formData.top_p,
      top_k: formData.top_k,
      max_tokens: formData.max_tokens,
      reasoning_effort: formData.reasoning_effort,
      verbosity: formData.verbosity,
      structured_output: formData.structured_output,
      live_search: formData.live_search,
      enable_parallelization: formData.enable_parallelization,
      
      // Optimization results (if available)
      optimized_prompt: response?.optimized_prompt,
      thought_process: response?.thought_process,
      input_checklist: response?.input_checklist,
      raw_response: response?.raw_response,
    };

    // Get current user
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      sessionData.user_id = user.id;
    }

    const { data, error } = await supabase
      .from('prompt_sessions')
      .insert(sessionData)
      .select()
      .single();

    return { data, error };
  } catch (error) {
    console.error('Error saving prompt session:', error);
    return { data: null, error };
  }
}

export async function getUserPromptSessions(): Promise<{ data: PromptSessionData[] | null; error: any }> {
  try {
    const { data, error } = await supabase
      .from('prompt_sessions')
      .select('*')
      .order('created_at', { ascending: false });

    return { data, error };
  } catch (error) {
    console.error('Error fetching prompt sessions:', error);
    return { data: null, error };
  }
}

export async function deletePromptSession(id: string): Promise<{ error: any }> {
  try {
    const { error } = await supabase
      .from('prompt_sessions')
      .delete()
      .eq('id', id);

    return { error };
  } catch (error) {
    console.error('Error deleting prompt session:', error);
    return { error };
  }
}