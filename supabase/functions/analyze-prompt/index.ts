import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface AnalysisRequest {
  user_prompt: string;
}

interface AnalysisResponse {
  use_case?: string;
  task?: string;
  domain?: string;
  audience?: string;
  tone?: string;
  style?: string;
  creativity?: number;
  responseLengthTokens?: number;
  focusLevel?: string;
  thinkingDepth?: string;
  format_requirements?: string;
  hard_constraints?: string;
  confidence_scores?: Record<string, number>;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { user_prompt }: AnalysisRequest = await req.json();

    if (!user_prompt || user_prompt.trim().length < 10) {
      return new Response(
        JSON.stringify({ error: 'Prompt must be at least 10 characters long' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const analysisPrompt = `You are an expert prompt engineer. Analyze the following raw prompt and suggest optimal form field values for a prompt optimization tool.

Raw prompt to analyze:
"""
${user_prompt}
"""

Based on this prompt, suggest values for the following fields. Return your response as valid JSON:

Use Cases (choose the best match):
- content_creation (writing, editing, copywriting)
- analysis (research, data analysis, summarization)
- coding (programming, debugging, code review)
- creative (brainstorming, ideation, creative writing)
- education (learning, teaching, explanations)
- business (strategy, planning, proposals)
- communication (emails, messages, presentations)

Tasks (suggest based on use case):
- For content_creation: blog_post, social_media, email_copy, product_description, etc.
- For analysis: market_research, competitive_analysis, data_interpretation, etc.
- For coding: code_review, debugging, architecture_design, etc.
- For creative: brainstorming, story_writing, naming, etc.
- For education: explanation, tutorial, lesson_plan, etc.
- For business: strategy_doc, proposal, meeting_summary, etc.
- For communication: email_draft, presentation, report, etc.

Domains:
- technology, business, healthcare, education, finance, marketing, legal, creative, science, general

Tones:
- professional, casual, friendly, formal, authoritative, conversational, enthusiastic, neutral

Styles:
- clear, concise, detailed, creative, technical, persuasive, informative, engaging

Response format (JSON only, no markdown):
{
  "use_case": "suggested_use_case",
  "task": "suggested_task",
  "domain": "suggested_domain", 
  "audience": "target audience (e.g., 'developers', 'business executives', 'students')",
  "tone": "suggested_tone",
  "style": "suggested_style",
  "creativity": 0.7,
  "responseLengthTokens": 512,
  "focusLevel": "Standard",
  "thinkingDepth": "Standard",
  "format_requirements": "any specific format needs identified",
  "hard_constraints": "any constraints or requirements identified",
  "confidence_scores": {
    "use_case": 0.85,
    "task": 0.75,
    "domain": 0.90
  }
}`;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: 'You are an expert prompt engineer. Always respond with valid JSON only, no markdown formatting or additional text.' },
          { role: 'user', content: analysisPrompt }
        ],
        temperature: 0.3,
        max_tokens: 1000,
      }),
    });

    if (!response.ok) {
      console.error('OpenAI API error:', response.status, response.statusText);
      const errorText = await response.text();
      console.error('OpenAI API error details:', errorText);
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    const analysisResult = data.choices[0].message.content;

    // Parse the JSON response
    let parsedAnalysis: AnalysisResponse;
    try {
      // Clean the response in case it has markdown formatting
      const cleanJson = analysisResult.replace(/```json\n?|\n?```/g, '').trim();
      parsedAnalysis = JSON.parse(cleanJson);
    } catch (parseError) {
      console.error('Failed to parse OpenAI response:', analysisResult);
      throw new Error('Failed to parse analysis result');
    }

    console.log('Prompt analysis completed:', parsedAnalysis);

    return new Response(JSON.stringify(parsedAnalysis), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in analyze-prompt function:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Internal server error' }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});