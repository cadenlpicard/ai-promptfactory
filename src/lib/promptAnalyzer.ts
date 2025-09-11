import { supabase } from '@/integrations/supabase/client';
import { PromptAnalysis } from '@/types';

export async function analyzePrompt(userPrompt: string): Promise<PromptAnalysis> {
  console.log('Analyzing prompt:', userPrompt);
  
  try {
    const { data, error } = await supabase.functions.invoke('analyze-prompt', {
      body: { user_prompt: userPrompt }
    });

    if (error) {
      console.error('Supabase function error:', error);
      throw new Error(`Analysis failed: ${error.message}`);
    }

    if (!data) {
      throw new Error('No analysis data received');
    }

    console.log('Analysis completed:', data);
    return data as PromptAnalysis;

  } catch (error) {
    console.error('Error analyzing prompt:', error);
    
    // Return fallback analysis with broader domain support
    return {
      use_case: 'write-blog',
      task: 'executive-summary',
      domain: 'general',
      audience: 'general-public',
      tone: 'professional',
      style: 'clear',
      creativity: 0.7,
      responseLengthTokens: 512,
      focusLevel: 'Standard',
      thinkingDepth: 'Standard',
      confidence_scores: {
        use_case: 0.5,
        task: 0.5,
        domain: 0.5
      }
    };
  }
}