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
  return `You are an expert prompt engineer. Rewrite the user's prompt into a clear, constrained, reproducible prompt that maximizes instruction adherence.

## Model Controls

Reasoning effort: ${formData.reasoning_effort || 'medium'}
Verbosity: ${formData.verbosity || 'standard'} (final answer length only)
Temperature: ${formData.temperature || 0.7}
Top-p: ${formData.top_p || 1.0}
Parallelization: ${formData.enable_parallelization ? 'enabled' : 'disabled'}

## Output Contract

Return ONLY:

1. **Optimized Prompt** (final version ready for user)
2. **Brief Thought Process** (3–6 bullets on improvement choices)
3. **Input Checklist** (missing inputs or suggestions)

Tone: ${formData.tone || 'not specified'}
Style: ${formData.style || 'not specified'}
Avoid: ${formData.avoid_list || 'not specified'}

# USER CONTENT

Raw Prompt: ${formData.user_prompt}
Domain: ${formData.domain_context || 'not specified'}
Audience: ${formData.audience || 'not specified'}
Formatting: ${formData.format_requirements || 'not specified'}
Hard constraints: ${formData.hard_constraints || 'not specified'}
Prohibited: ${formData.prohibited || 'not specified'}
Success criteria: ${formData.success_criteria || 'not specified'}
Exemplars: ${formData.exemplars || 'not specified'}

# Instructions for Optimized Prompt

1. Include "think deeper" and a short planning phase (decompose, identify ambiguities, plan, validate).
2. Eliminate conflicts (priority: hard_constraints > safety/compliance > success_criteria > tone/style).
3. Explicitly structure: role, goal, inputs, process, output format, tone/style/verbosity.
4. Require an Approach Summary at the start of the final answer (3–5 bullets, no hidden reasoning).
5. Add an internal Quality Rubric (5–7 criteria) and iterate until "excellent".
6. ${formData.enable_parallelization ? 'Allow parallel tasks' : 'No parallelization'}
7. Add a Safety clause to refuse/redirect if disallowed.

# Safety

If disallowed or risky, briefly refuse and suggest compliant alternatives.

# Response Format

Please structure your response exactly as follows:

## Optimized Prompt
[Your improved prompt here]

## Thought Process
• [Improvement 1]
• [Improvement 2]
• [Improvement 3]
• [Additional improvements as needed]

## Input Checklist
• [Missing input 1 or suggestion]
• [Missing input 2 or suggestion]
• [Additional suggestions as needed]`
}

function parseOptimizedResponse(rawResponse: string): any {
  try {
    // Split the response into sections
    const sections = rawResponse.split('##').map(s => s.trim()).filter(s => s.length > 0)
    
    let optimized_prompt = ''
    let thought_process: string[] = []
    let input_checklist: string[] = []
    
    sections.forEach(section => {
      if (section.toLowerCase().startsWith('optimized prompt')) {
        optimized_prompt = section.replace(/^optimized prompt\s*/i, '').trim()
      } else if (section.toLowerCase().startsWith('thought process')) {
        const content = section.replace(/^thought process\s*/i, '').trim()
        thought_process = content.split('•').map(item => item.trim()).filter(item => item.length > 0)
      } else if (section.toLowerCase().startsWith('input checklist')) {
        const content = section.replace(/^input checklist\s*/i, '').trim()
        input_checklist = content.split('•').map(item => item.trim()).filter(item => item.length > 0)
      }
    })
    
    return {
      optimized_prompt: optimized_prompt || rawResponse,
      thought_process: thought_process.length > 0 ? thought_process : ['Prompt optimized for clarity and effectiveness'],
      input_checklist: input_checklist.length > 0 ? input_checklist : ['All required inputs provided'],
      raw_response: rawResponse
    }
  } catch (error) {
    // Fallback if parsing fails
    return {
      optimized_prompt: rawResponse,
      thought_process: ['Prompt optimized using advanced techniques'],
      input_checklist: ['Review output for completeness'],
      raw_response: rawResponse
    }
  }
}