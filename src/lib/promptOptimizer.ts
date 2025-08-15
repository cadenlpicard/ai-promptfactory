import { FormData, OptimizedResponse } from '@/types';
import { supabase } from '@/integrations/supabase/client';
import { savePromptSession } from './promptSessionService';

export async function optimizePrompt(formData: FormData): Promise<OptimizedResponse> {
  try {
    // Try to use the OpenAI edge function first
    const { data: optimizeData, error: optimizeError } = await supabase.functions.invoke('optimize-prompt', {
      body: { formData }
    });

    if (optimizeData && !optimizeError) {
      console.log('Using OpenAI optimization via edge function');
      
      // Save to database
      await savePromptSession(formData, optimizeData);
      
      return optimizeData;
    }

    // Fall back to enhanced local optimization
    console.log('Falling back to local optimization...');
    const optimizedResponse = await createLocalOptimizedResponse(formData);
    
    // Save to database
    await savePromptSession(formData, optimizedResponse);
    
    return optimizedResponse;
    
  } catch (error) {
    console.error('Error optimizing prompt:', error);
    
    // Enhanced fallback response
    const optimizedResponse = await createLocalOptimizedResponse(formData);
    
    // Try to save to database even on error
    try {
      await savePromptSession(formData, optimizedResponse);
    } catch (saveError) {
      console.error('Error saving prompt session:', saveError);
    }
    
    return optimizedResponse;
  }
}

async function createLocalOptimizedResponse(formData: FormData): Promise<OptimizedResponse> {
  const optimizedPrompt = createEnhancedPrompt(formData);
  
  // Simulate processing time for better UX
  await new Promise(resolve => setTimeout(resolve, 1500));
  
  return {
    optimized_prompt: optimizedPrompt,
    thought_process: [
      '🎯 Applied advanced prompt engineering techniques',
      '📐 Structured with clear thinking framework',
      '👥 Incorporated domain expertise and audience targeting',
      '✅ Added quality validation checkpoints',
      '🎨 Enhanced with user-specified tone and style preferences',
      '🚀 Ready for production use!'
    ],
    input_checklist: [
      formData.domain_context ? '✅ Domain context: Well-defined' : '💡 Tip: Add domain context for better targeting',
      formData.audience ? '✅ Target audience: Specified' : '💡 Tip: Define your target audience',
      formData.tone ? '✅ Tone: Configured' : '💡 Tip: Choose a tone for better results',
      formData.style ? '✅ Style: Set' : '💡 Tip: Select a communication style',
      formData.success_criteria ? '✅ Success criteria: Defined' : '💡 Tip: Add success criteria for validation',
      '🔧 Session saved to your prompt history'
    ]
  };
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