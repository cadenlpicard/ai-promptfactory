import { TARGET_MODEL_PROFILES, TargetModelId } from "@/constants/modelProfiles";
import type { FormData } from "@/types";

export function buildMetaPrompt(form: FormData): string {
  const profile = TARGET_MODEL_PROFILES[form.targetModel as TargetModelId];
  const join = (x?: string[] | string) =>
    Array.isArray(x) ? (x.length ? x.join(", ") : "none") : (x || "none");

  return `
You are an expert prompt engineer for multi-model LLMs. Your job is to transform the user's raw prompt and UI selections into a single, high-quality **Optimized Prompt** that consistently produces excellent results for the target model.

## Target Model
${profile.label}

## Target-Model Notes (use to tailor the Optimized Prompt)
- System/Role: ${profile.notes.systemRole}
- Sampling: ${profile.notes.samplingTips}
- Structure: ${profile.notes.structureTips}
${profile.notes.toolCallingTips ? `- Tools: ${profile.notes.toolCallingTips}` : ""}
${profile.notes.safetyTips ? `- Safety: ${profile.notes.safetyTips}` : ""}
${profile.notes.doNots?.length ? `- Do NOT: ${profile.notes.doNots.join("; ")}` : ""}

## Inputs from UI
- Raw Prompt: ${form.rawPrompt || form.user_prompt}
- Domain Context: ${form.domainContext || form.domain_context || "none"}
- Target Audience: ${form.audience || "General readers"}
- Tone / Style: ${form.tone || "Professional"} / ${form.style || "Succinct & structured"}
- Format Requirements: ${join(form.formatRequirements || form.format_requirements)}
- Hard Constraints: ${join(form.hardConstraints || form.hard_constraints)}
- Prohibited: ${join(form.prohibited)}
- Success Criteria: ${join(form.successCriteria || form.success_criteria)}
- Exemplars: ${join(form.exemplars)}

## Factory Settings (map UI → behavior; these are instructions to the *final* model)
- Creativity (temperature): ${form.creativity || form.temperature || 0.7}
- Response Length (tokens): ${form.responseLengthTokens || form.max_tokens || 512}
- Focus Level: ${form.focusLevel ?? "Standard"}  (Higher = tighter, fewer tangents)
- Thinking Depth: ${form.thinkingDepth ?? "Standard"}  (e.g., Quick / Standard / Deep Analysis)
- Parallelization: ${form.enableParallelization || form.enable_parallelization ? "true" : "false"}

## Output Contract — return EXACTLY these H2 sections in this order
## Optimized Prompt
## Brief Thought Process
## Input Checklist

### Optimized Prompt MUST contain (in this order)
1) Role & Goal — Set the role suitable for ${profile.label} and state the goal in one sentence.
2) Inputs You Will Receive — List concrete inputs (do NOT paste the raw prompt verbatim).
3) Before You Start (Planning & Think Deeper) — Instruct the model to: decompose, surface ambiguities, plan, validate. Add "Think deeper".
4) Process (do in order) —
   1. Decompose request into components.
   2. Ask up to 3 clarifying questions in one batch only if info is missing.
   3. Draft solution.
   4. Validate against success criteria & constraints.
   5. Revise once, then finalize.
5) Output Format — Use ${join(form.formatRequirements || form.format_requirements) || "H2 sections + final checklist"}.
6) Approach Summary (for the model's final answer) — Require 3–5 bullets at the top (no chain-of-thought).
7) Quality Rubric (internal) — The model must silently meet these before responding:
   - Follows hard constraints
   - Meets success criteria
   - Accuracy & relevance for ${form.audience || "the audience"}
   - Clear, well-structured, scoped to the request
   - Tone & style = ${form.tone || "Professional"} / ${form.style || "Succinct & structured"}
    - Brevity aligned to ${form.responseLengthTokens || form.max_tokens || 512} tokens
   - Safety/compliance respected
   Iterate once internally until all are "excellent".
8) Answer Parameters —
    - Final answer length target: ${form.responseLengthTokens || form.max_tokens || 512} tokens (do NOT expand reasoning)
   - Creativity (temperature): ${form.creativity || form.temperature || 0.7}
   - Focus guidance: ${form.focusLevel ?? "Standard"} (avoid tangents; prefer compact wording if high)
   - Reasoning effort: ${form.thinkingDepth ?? "Standard"}
   - Tone/Style: ${form.tone || "Professional"} / ${form.style || "Succinct & structured"}
9) Conflict Resolution — hard_constraints > safety/compliance > success_criteria > tone/style.
10) Safety — If disallowed or risky, refuse briefly and suggest compliant alternatives.

### Brief Thought Process (3–6 bullets)
Explain how you improved the prompt (structure, constraints, parameter mapping, target-model specifics). No chain-of-thought.

### Input Checklist
List missing specifics that would improve results next time (e.g., audience seniority, explicit metrics, deadline, links).

Now produce the three sections exactly:
## Optimized Prompt
## Brief Thought Process
## Input Checklist
`.trim();
}