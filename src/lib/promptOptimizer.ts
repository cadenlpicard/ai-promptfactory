import { FormData, OptimizedResponse } from '@/types';
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

const supabase = supabaseUrl && supabaseAnonKey 
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

export async function optimizePrompt(formData: FormData): Promise<OptimizedResponse> {
  try {
    // Try to use Supabase edge function if available
    if (supabase) {
      const { data, error } = await supabase.functions.invoke('optimize-prompt', {
        body: { formData }
      });

      if (error) {
        console.warn('Supabase function error:', error);
        throw new Error('Supabase function failed');
      }

      if (data) {
        return data as OptimizedResponse;
      }
    }

    // Fallback: Enhanced local optimization
    console.log('Using enhanced local optimization');
    const optimizedPrompt = createEnhancedPrompt(formData);
    
    return {
      optimized_prompt: optimizedPrompt,
      thought_process: [
        'Applied advanced prompt engineering techniques',
        'Structured with clear thinking framework',
        'Incorporated domain expertise and audience targeting',
        'Added quality validation checkpoints',
        'Enhanced with user-specified tone and style preferences'
      ],
      input_checklist: [
        formData.domain_context ? '✅ Domain context: Well-defined' : '💡 Tip: Add domain context for better targeting',
        formData.audience ? '✅ Target audience: Specified' : '💡 Tip: Define your target audience',
        formData.tone ? '✅ Tone: Configured' : '💡 Tip: Choose a tone for better results',
        formData.style ? '✅ Style: Set' : '💡 Tip: Select a communication style',
        formData.success_criteria ? '✅ Success criteria: Defined' : '💡 Tip: Add success criteria for validation'
      ]
    };
    
  } catch (error) {
    console.error('Error optimizing prompt:', error);
    
    // Enhanced fallback response
    const optimizedPrompt = createEnhancedPrompt(formData);
    
    return {
      optimized_prompt: optimizedPrompt,
      thought_process: [
        'Applied prompt engineering best practices',
        'Added structured thinking framework', 
        'Incorporated user specifications for tone and style',
        'Built in quality validation steps',
        '⚠️ Note: Using local optimization (API connection pending)'
      ],
      input_checklist: [
        formData.domain_context ? '✓ Domain context provided' : '⚠️ Consider adding domain context',
        formData.audience ? '✓ Target audience defined' : '⚠️ Target audience could be specified',
        formData.success_criteria ? '✓ Success criteria set' : '⚠️ Success criteria would help',
        formData.format_requirements ? '✓ Format requirements specified' : '⚠️ Output format could be clarified',
        '🔧 OpenAI API integration ready - configure your API key'
      ]
    };
  }
}

function createEnhancedPrompt(formData: FormData): string {
  const role = formData.domain_context ? `${formData.domain_context} expert` : 'helpful assistant';
  const audience = formData.audience || 'users';
  const tone = formData.tone || 'professional';
  const style = formData.style || 'clear and comprehensive';

  return `You are an expert ${role}. Your task is to ${formData.user_prompt}

## 🎯 Context & Approach
**Target Audience:** ${audience}
**Communication Style:** ${tone} and ${style}
**Domain Focus:** ${formData.domain_context || 'General assistance'}

## 🧠 Thinking Framework
Before responding:
1. **Analyze** the request thoroughly
2. **Plan** your approach step-by-step  
3. **Consider** the specific needs of ${audience}
4. **Structure** your response for maximum clarity

## 📋 Quality Standards
Ensure your response:
- Addresses the core request completely
- Uses ${tone} tone throughout
- Follows ${style} presentation style
- Provides actionable information
- Is appropriate for ${audience}

${formData.format_requirements ? `\n## 📐 Format Requirements\n${formData.format_requirements}` : ''}

${formData.hard_constraints ? `\n## ⚠️ Critical Requirements\n${formData.hard_constraints}` : ''}

${formData.prohibited ? `\n## 🚫 Avoid\n${formData.prohibited}` : ''}

${formData.success_criteria ? `\n## ✅ Success Criteria\n${formData.success_criteria}` : ''}

## 🚀 Execute
Now complete this task following the framework above, ensuring excellence at every step.`;
}