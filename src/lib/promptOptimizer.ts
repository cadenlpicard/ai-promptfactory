import { FormData, OptimizedResponse } from '@/types';
import { buildMetaPrompt } from './metaPrompt';

// Mock optimization service for demo purposes
export async function optimizePrompt(form: FormData): Promise<OptimizedResponse> {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  const metaPrompt = buildMetaPrompt(form);
  
  // Mock optimized response based on the meta-prompt
  const mockResponse: OptimizedResponse = {
    optimized_prompt: `You are a ${form.tone || 'professional'} ${form.domain_context || 'general'} expert. Your task is to ${form.user_prompt}.

## Planning Phase
Think deeply about this request:
1. Decompose the core requirements
2. Identify any ambiguities that need clarification  
3. Plan your approach step-by-step
4. Validate against success criteria

## Approach Summary
- ${form.success_criteria || 'Deliver a clear, accurate response'}
- Follow ${form.style || 'clear and direct'} communication style
- Ensure ${form.format_requirements || 'well-structured output'}

## Quality Rubric
Before finalizing, verify:
1. Completeness: All requirements addressed
2. Clarity: Easy to understand for ${form.audience || 'general audience'}
3. Accuracy: Factually correct and reliable
4. Structure: Well-organized and logical
5. Tone: Appropriately ${form.tone || 'professional'}

## Safety Check
If the request involves prohibited content (${form.prohibited || 'harmful content'}), politely decline and suggest compliant alternatives.

## Output Requirements
${form.format_requirements || 'Provide a comprehensive response'}

Execute this task following the approach above, iterating until the quality rubric criteria are met at an "excellent" level.`,
    
    thought_process: [
      "Enhanced structure with clear role definition and planning phase",
      "Added explicit approach summary for transparency",
      `Incorporated ${form.tone || 'professional'} tone and ${form.style || 'clear'} style requirements`,
      "Built in quality rubric for self-validation",
      "Added safety clause for content moderation",
      "Structured output requirements for consistency"
    ],
    
    input_checklist: [
      form.domain_context ? "✓ Domain context provided" : "⚠️ Consider adding domain context",
      form.audience ? "✓ Target audience defined" : "⚠️ Target audience could be specified",
      form.success_criteria ? "✓ Success criteria set" : "⚠️ Success criteria would help",
      form.format_requirements ? "✓ Format requirements specified" : "⚠️ Output format could be clarified",
      form.exemplars ? "✓ Examples provided" : "⚠️ Examples could improve results"
    ],
    
    raw_response: metaPrompt
  };
  
  return mockResponse;
}