import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { formData } = await req.json()
    
    const openaiApiKey = Deno.env.get('OPENAI_API_KEY')
    if (!openaiApiKey) {
      throw new Error('OpenAI API key not found')
    }

    // Build the meta-prompt using the form data
    const metaPrompt = buildMetaPrompt(formData)
    
    // Call OpenAI API
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openaiApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-5-2025-08-07',
        messages: [
          { 
            role: 'system', 
            content: 'You are an expert prompt engineer. Follow the output contract exactly and return only the requested format.' 
          },
          { 
            role: 'user', 
            content: metaPrompt 
          }
        ],
        temperature: formData.temperature || 0.7,
        top_p: formData.top_p || 1,
        max_tokens: Math.min(formData.max_tokens || 2048, 4000),
      }),
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(`OpenAI API error: ${errorData.error?.message || 'Unknown error'}`)
    }

    const data = await response.json()
    const rawResponse = data.choices[0]?.message?.content || ''
    
    // Parse the response to extract structured parts
    const optimizedResponse = parseOptimizedResponse(rawResponse)
    
    return new Response(JSON.stringify(optimizedResponse), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
    
  } catch (error) {
    console.error('Error:', error)
    return new Response(JSON.stringify({ 
      error: error.message 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})

function buildMetaPrompt(formData: any): string {
  return `You are an expert prompt engineer. Think deeper first (briefly). Decompose the task, spot ambiguities, and plan before writing the Optimized Prompt.

ASSISTANT INSTRUCTIONS (how to rewrite):

1. Think deeper first (briefly). Decompose the task, spot ambiguities, and plan before writing the Optimized Prompt.

2. Eliminate conflicts. If two rules clash, apply this priority: hard_constraints > safety/compliance > success_criteria > tone/style. State the chosen resolution in "Brief Thought Process."

3. Planning phase (inline in the prompt). Include a short pre-execution checklist inside the Optimized Prompt:
   - Decompose task
   - Identify ambiguities  
   - Plan steps
   - Validate understanding

4. Explicit structure. In the Optimized Prompt, specify: role, goal, inputs expected, steps/sequence, output format (headings/bullets/tables as needed), and the verbosity target.

5. Reasoning transparency (short). Instruct the model to include a 3–5 bullet "Approach Summary" at the start of its final answer (not chain-of-thought; just high-level rationale).

6. Iteration & self-check. Add a self-evaluation rubric (5–7 criteria) and tell the model to quietly iterate until it meets "excellent" across criteria, then deliver the final answer.

7. Parallelization. If enable_parallelization = true, add a note allowing parallel work on independent subtasks.

8. Parameter hints. Reflect UI choices inside the prompt (e.g., "Answer length: ${formData.verbosity}", "Creativity: temperature ${formData.temperature}, top-p ${formData.top_p || 1.0}," "Reasoning effort: ${formData.reasoning_effort}").

9. Safety & compliance. Include one line instructing refusal/redirect if the user asks for disallowed content.

# USER CONTENT

Raw Prompt: ${formData.user_prompt}
Domain: ${formData.domain_context || 'not specified'}
Audience: ${formData.audience || 'not specified'}
Formatting: ${formData.format_requirements || 'not specified'}
Hard constraints: ${formData.hard_constraints || 'not specified'}
Prohibited: ${formData.prohibited || 'not specified'}
Success criteria: ${formData.success_criteria || 'not specified'}
Exemplars: ${formData.exemplars || 'not specified'}
Tone: ${formData.tone || 'not specified'}
Style: ${formData.style || 'not specified'}

EXAMPLE SHAPE OF "Optimized Prompt" YOU SHOULD PRODUCE:

**Role & Goal:** You are a ${formData.domain_context || 'domain'} expert. Your goal is to [succinct_goal].

**Inputs You Will Receive:** [explicit_input_list]

**When to Start:** Proceed only after confirming missing inputs from the checklist are resolved.

**Process (do in order):**
1. Decompose the request into core components
2. Identify ambiguities and ask up to 3 clarifying questions (one batch)
3. Draft solution; validate against success criteria
4. Revise to meet the rubric; finalize

**Parallelization:** ${formData.enable_parallelization ? 'Allow parallel work on independent subtasks' : 'Complete tasks sequentially'}

**Output Format:** ${formData.format_requirements || 'Clear structured response'} (headings/bullets/tables/code blocks as needed)

**Approach Summary:** Begin your final answer with 3–5 bullets explaining your approach (no chain-of-thought).

**Quality Rubric (internal, do not show scores):** [5-7 criteria for excellence]

**Answer Length & Tone:** ${formData.verbosity || 'standard'}, ${formData.tone || 'professional'}; creativity temp ${formData.temperature}, top-p ${formData.top_p || 1.0}; reasoning effort ${formData.reasoning_effort || 'medium'}.

**Safety:** If the request is disallowed or risky, refuse with a brief reason and suggest compliant alternatives.

Return ONLY the optimized prompt.`
}

function parseOptimizedResponse(rawResponse: string): any {
  // Since we're only returning the optimized prompt now, no parsing needed
  return {
    optimized_prompt: rawResponse.trim(),
    thought_process: [],
    input_checklist: [],
    raw_response: rawResponse
  }
}