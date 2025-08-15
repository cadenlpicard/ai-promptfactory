import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface FormData {
  targetModel?: string;
  user_prompt: string;
  domain_context?: string;
  audience?: string;
  tone?: string;
  style?: string;
  format_requirements?: string;
  hard_constraints?: string;
  prohibited?: string;
  success_criteria?: string;
  temperature?: number;
  max_tokens?: number;
  focusLevel?: string;
  thinkingDepth?: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    if (!openAIApiKey) {
      console.error('OpenAI API key not found');
      return new Response(JSON.stringify({ error: 'OpenAI API key not configured' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const formData: FormData = await req.json();
    console.log('Received form data:', JSON.stringify(formData, null, 2));
    
    const metaPrompt = buildMetaPrompt(formData);
    console.log('Built meta prompt');

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        max_tokens: 2000,
        temperature: 0.3,
        messages: [
          { role: 'system', content: 'You are a meticulous assistant that follows the output contract exactly.' },
          { role: 'user', content: metaPrompt }
        ]
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('OpenAI API error:', errorData);
      return new Response(JSON.stringify({ error: 'OpenAI API error', details: errorData }), {
        status: response.status,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const data = await response.json();
    console.log('OpenAI response received');
    
    const rawResponse = data.choices?.[0]?.message?.content?.trim() || "";
    const parsed = parseOptimizedResponse(rawResponse);
    
    return new Response(JSON.stringify(parsed), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in optimize-prompt function:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

function buildMetaPrompt(formData: FormData): string {
  const getCreativityLevel = (temp: number) => {
    if (temp <= 0.3) return "Low (focused, deterministic)";
    if (temp <= 0.7) return "Medium (balanced)";
    return "High (creative, diverse)";
  };

  const getResponseLength = (tokens: number) => {
    if (tokens <= 256) return "Short (1-2 paragraphs)";
    if (tokens <= 512) return "Medium (3-4 paragraphs)";
    if (tokens <= 1024) return "Long (detailed response)";
    return "Extended (comprehensive)";
  };

  return `You are an expert prompt engineer for multi-model LLMs. Your job is to transform the user's raw prompt and UI selections into a single, high-quality **Optimized Prompt** that consistently produces excellent results for the target model.

## Target Model
${formData.targetModel || 'GPT-4'} (OpenAI)

## Target-Model Notes (use to tailor the Optimized Prompt)
- System/Role: Very steerable; put the role in the system or opening instruction.
- Sampling: Use temperature; top_p optional. Verbosity and 'reasoning effort' can be requested via instructions.
- Structure: Be explicit: planning phase, short approach summary, internal quality rubric.
- Safety: Avoid conflicting instructions; define precedence.

## Inputs from UI
- Raw Prompt: ${formData.user_prompt}
- Domain Context: ${formData.domain_context || 'none'}
- Target Audience: ${formData.audience || 'General readers'}
- Tone / Style: ${formData.tone || 'Professional'} / ${formData.style || 'Clear and structured'}
- Format Requirements: ${formData.format_requirements || 'none'}
- Hard Constraints: ${formData.hard_constraints || 'none'}
- Prohibited: ${formData.prohibited || 'none'}
- Success Criteria: ${formData.success_criteria || 'none'}

## Factory Settings (map UI → behavior; these are instructions to the *final* model)
- Creativity (temperature): ${formData.temperature || 0.7}
- Response Length (tokens): ${formData.max_tokens || 512}
- Focus Level: ${formData.focusLevel || 'Standard'}  (Higher = tighter, fewer tangents)
- Thinking Depth: ${formData.thinkingDepth || 'Standard'}  (e.g., Quick / Standard / Deep Analysis)

## Output Contract — return EXACTLY these H2 sections in this order
## Optimized Prompt
## Brief Thought Process
## Input Checklist

### Optimized Prompt MUST contain (in this order)
1) Role & Goal — Set the role suitable for the target model and state the goal in one sentence.
2) Inputs You Will Receive — List concrete inputs (do NOT paste the raw prompt verbatim).
3) Before You Start (Planning & Think Deeper) — Instruct the model to: decompose, surface ambiguities, plan, validate. Add "Think deeper".
4) Process (do in order) —
   1. Decompose request into components.
   2. Ask up to 3 clarifying questions in one batch only if info is missing.
   3. Draft solution.
   4. Validate against success criteria & constraints.
   5. Revise once, then finalize.
5) Output Format — Use ${formData.format_requirements || 'standard text format'}.
6) Approach Summary (for the model's final answer) — Require 3–5 bullets at the top (no chain-of-thought).
7) Quality Rubric (internal) — The model must silently meet these before responding:
   - Follows hard constraints
   - Meets success criteria
   - Accuracy & relevance for the audience
   - Clear, well-structured, scoped to the request
   - Tone & style = ${formData.tone || 'Professional'} / ${formData.style || 'Clear and structured'}
   - Brevity aligned to ${getResponseLength(formData.max_tokens || 512)}
   - Safety/compliance respected
   Iterate once internally until all are "excellent".
8) Answer Parameters —
   - Final answer length target: ${formData.max_tokens || 512} tokens
   - Creativity level: ${getCreativityLevel(formData.temperature || 0.7)}
   - Focus guidance: ${formData.focusLevel || 'Standard'}
   - Reasoning effort: ${formData.thinkingDepth || 'Standard'}
   - Tone/Style: ${formData.tone || 'Professional'} / ${formData.style || 'Clear and structured'}
9) Conflict Resolution — hard_constraints > safety/compliance > success_criteria > tone/style.
10) Safety — If disallowed or risky, refuse briefly and suggest compliant alternatives.

### Brief Thought Process (3–6 bullets)
Explain how you improved the prompt (structure, constraints, parameter mapping, target-model specifics). No chain-of-thought.

### Input Checklist
List missing specifics that would improve results next time (e.g., audience seniority, explicit metrics, deadline, links).

Now produce the three sections exactly:
## Optimized Prompt
## Brief Thought Process
## Input Checklist`;
}

function parseOptimizedResponse(rawResponse: string) {
  const sections = splitThreeSections(rawResponse);
  
  return {
    optimized_prompt: sections.optimizedPrompt,
    optimizedPrompt: sections.optimizedPrompt,
    thought_process: sections.briefThoughtProcess.split('\n').filter(line => line.trim()),
    briefThoughtProcess: sections.briefThoughtProcess,
    input_checklist: sections.inputChecklist.split('\n').filter(line => line.trim()),
    inputChecklist: sections.inputChecklist,
    raw_response: rawResponse
  };
}

function splitThreeSections(text: string) {
  const t = text.replace(/\r\n/g, "\n");
  const get = (label: string) => {
    const re = new RegExp(`(^|\\n)##\\s*${label}[\\s\\S]*?(?=\\n##\\s*|$)`, "i");
    const match = t.match(re)?.[0] || "";
    return match.replace(/(^|\\n)##\\s*[^\\n]+\\n?/, "").trim();
  };
  
  let optimizedPrompt = get("Optimized Prompt") || t;
  optimizedPrompt = optimizedPrompt.replace(/^##\s*Optimized\s+Prompt\s*\n?/i, "").trim();
  
  return {
    optimizedPrompt,
    briefThoughtProcess: get("Brief Thought Process"),
    inputChecklist: get("Input Checklist")
  };
}