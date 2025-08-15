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

    // Get current user
    const { data: { user } } = await supabase.auth.getUser();
    
    const sessionData = {
      title,
      user_id: user?.id,
      // Form data
      model_id: formData.model_id,
      provider: formData.provider,
      user_prompt: formData.user_prompt,
      domain_context: formData.domain_context || null,
      audience: formData.audience || null,
      tone: formData.tone || null,
      style: formData.style || null,
      format_requirements: formData.format_requirements || null,
      hard_constraints: formData.hard_constraints || null,
      prohibited: formData.prohibited || null,
      success_criteria: formData.success_criteria || null,
      exemplars: formData.exemplars || null,
      avoid_list: formData.avoid_list || null,
      
      // Model parameters
      temperature: formData.temperature,
      top_p: formData.top_p || null,
      top_k: formData.top_k || null,
      max_tokens: formData.max_tokens,
      reasoning_effort: formData.reasoning_effort || null,
      verbosity: formData.verbosity || null,
      structured_output: formData.structured_output,
      live_search: formData.live_search || null,
      enable_parallelization: formData.enable_parallelization,
      
      // Optimization results (if available)
      optimized_prompt: response?.optimized_prompt || null,
      thought_process: response?.thought_process || null,
      input_checklist: response?.input_checklist || null,
      raw_response: response?.raw_response || null,
    };

    const { data, error } = await supabase
      .from('prompt_sessions')
      .insert(sessionData)
      .select()
      .single();

    if (error) {
      return { data: null, error };
    }

    // Convert back to proper format
    const convertedData: PromptSessionData = {
      ...data,
      thought_process: Array.isArray(data.thought_process) 
        ? data.thought_process as string[]
        : data.thought_process 
          ? JSON.parse(data.thought_process as string)
          : [],
      input_checklist: Array.isArray(data.input_checklist)
        ? data.input_checklist as string[]
        : data.input_checklist
          ? JSON.parse(data.input_checklist as string)
          : []
    };

    return { data: convertedData, error: null };
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

    if (error) {
      return { data: null, error };
    }

    // Convert to proper format
    const convertedData: PromptSessionData[] = (data || []).map(session => ({
      ...session,
      thought_process: Array.isArray(session.thought_process)
        ? session.thought_process as string[]
        : session.thought_process
          ? JSON.parse(session.thought_process as string)
          : [],
      input_checklist: Array.isArray(session.input_checklist)
        ? session.input_checklist as string[]
        : session.input_checklist
          ? JSON.parse(session.input_checklist as string)
          : []
    }));

    return { data: convertedData, error: null };
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