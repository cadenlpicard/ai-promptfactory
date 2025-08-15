import { TARGET_MODEL_PROFILES, TargetModelId } from "@/constants/modelProfiles";
import type { FormData } from "@/types";

export function buildMetaPrompt(form: FormData): string {
  const profile = TARGET_MODEL_PROFILES[form.targetModel as TargetModelId];
  
  // Simplified meta prompt for faster processing

  return `You are an expert prompt engineer. Transform this raw prompt into an optimized version for ${profile.label}.

## Target Model: ${profile.label}
${profile.notes.systemRole} | ${profile.notes.samplingTips} | ${profile.notes.structureTips}

## Raw Input
"${form.rawPrompt || form.user_prompt}"

## Settings
- Domain: ${form.domainContext || form.domain_context || "General"}
- Audience: ${form.audience || "General"}
- Tone/Style: ${form.tone || "Professional"}/${form.style || "Clear"}
- Creativity: ${form.creativity || form.temperature || 0.7}
- Length: ${form.responseLengthTokens || form.max_tokens || 512} tokens

## Required Output (exactly 3 sections):
## Optimized Prompt
[Create a production-ready prompt optimized for ${profile.label}]

## Brief Thought Process  
[3-4 bullets explaining key improvements made]

## Input Checklist
[List what could improve this prompt further]`;
}