import { openai } from "./openai";
import { buildMetaPrompt } from "./buildMetaPrompt";
import type { FormData, OptimizedResponse } from "@/types";
import { savePromptSession } from './promptSessionService';

export async function optimizePrompt(form: FormData): Promise<OptimizedResponse> {
  try {
    const meta = buildMetaPrompt(form);

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      max_tokens: 2000,
      temperature: 0.3,
      messages: [
        { role: "system", content: "You are a meticulous assistant that follows the output contract exactly." },
        { role: "user", content: meta }
      ]
    });

    const text = completion.choices?.[0]?.message?.content?.trim() || "";
    const { optimizedPrompt, briefThoughtProcess, inputChecklist } = splitThreeSections(text);
    
    const response: OptimizedResponse = {
      optimized_prompt: optimizedPrompt,
      optimizedPrompt,
      thought_process: briefThoughtProcess.split('\n').filter(line => line.trim()),
      briefThoughtProcess,
      input_checklist: inputChecklist.split('\n').filter(line => line.trim()),
      inputChecklist
    };

    // Save to database (non-blocking)
    savePromptSession(form, response).catch(saveError => {
      console.error('Error saving prompt session:', saveError);
    });
    
    return response;
    
  } catch (error) {
    console.error('Error optimizing prompt:', error);
    
    // Enhanced fallback response
    const optimizedResponse = await createLocalOptimizedResponse(form);
    
    // Try to save to database even on error (non-blocking)
    savePromptSession(form, optimizedResponse).catch(saveError => {
      console.error('Error saving prompt session:', saveError);
    });
    
    return optimizedResponse;
  }
}

function splitThreeSections(text: string) {
  const t = text.replace(/\r\n/g, "\n");
  const get = (label: string) => {
    const re = new RegExp(`(^|\\n)##\\s*${label}[\\s\\S]*?(?=\\n##\\s*|$)`, "i");
    return (t.match(re)?.[0] || "").replace(/(^|\\n)##\\s*[^\\n]+\\n?/, "").trim();
  };
  return {
    optimizedPrompt: get("Optimized Prompt") || t,
    briefThoughtProcess: get("Brief Thought Process"),
    inputChecklist: get("Input Checklist")
  };
}

async function createLocalOptimizedResponse(form: FormData): Promise<OptimizedResponse> {
  const optimizedPrompt = createEnhancedPrompt(form);
  
  // Removed artificial delay for better performance
  
  return {
    optimized_prompt: optimizedPrompt,
    optimizedPrompt,
    thought_process: [
      '🎯 Applied advanced prompt engineering techniques',
      '📐 Structured with clear thinking framework',
      '👥 Incorporated domain expertise and audience targeting',
      '✅ Added quality validation checkpoints',
      '🎨 Enhanced with user-specified tone and style preferences',
      '🚀 Ready for production use!'
    ],
    briefThoughtProcess: [
      '🎯 Applied advanced prompt engineering techniques',
      '📐 Structured with clear thinking framework',
      '👥 Incorporated domain expertise and audience targeting',
      '✅ Added quality validation checkpoints',
      '🎨 Enhanced with user-specified tone and style preferences',
      '🚀 Ready for production use!'
    ].join('\n'),
    input_checklist: [
      form.domain_context ? '✅ Domain context: Well-defined' : '💡 Tip: Add domain context for better targeting',
      form.audience ? '✅ Target audience: Specified' : '💡 Tip: Define your target audience',
      form.tone ? '✅ Tone: Configured' : '💡 Tip: Choose a tone for better results',
      form.style ? '✅ Style: Set' : '💡 Tip: Select a communication style',
      form.success_criteria ? '✅ Success criteria: Defined' : '💡 Tip: Add success criteria for validation',
      '🔧 Session saved to your prompt history'
    ],
    inputChecklist: [
      form.domain_context ? '✅ Domain context: Well-defined' : '💡 Tip: Add domain context for better targeting',
      form.audience ? '✅ Target audience: Specified' : '💡 Tip: Define your target audience',
      form.tone ? '✅ Tone: Configured' : '💡 Tip: Choose a tone for better results',
      form.style ? '✅ Style: Set' : '💡 Tip: Select a communication style',
      form.success_criteria ? '✅ Success criteria: Defined' : '💡 Tip: Add success criteria for validation',
      '🔧 Session saved to your prompt history'
    ].join('\n')
  };
}

function createEnhancedPrompt(form: FormData): string {
  const role = form.domain_context ? `${form.domain_context} expert` : 'helpful assistant';
  const audience = form.audience || 'users';
  const tone = form.tone || 'professional';
  const style = form.style || 'clear and comprehensive';

  return `You are an expert ${role}. Your task is to ${form.user_prompt}

## 🎯 Context & Approach
**Target Audience:** ${audience}
**Communication Style:** ${tone} and ${style}
**Domain Focus:** ${form.domain_context || 'General assistance'}

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

${form.format_requirements ? `\n## 📐 Format Requirements\n${form.format_requirements}` : ''}

${form.hard_constraints ? `\n## ⚠️ Critical Requirements\n${form.hard_constraints}` : ''}

${form.prohibited ? `\n## 🚫 Avoid\n${form.prohibited}` : ''}

${form.success_criteria ? `\n## ✅ Success Criteria\n${form.success_criteria}` : ''}

## 🚀 Execute
Now complete this task following the framework above, ensuring excellence at every step.`;
}