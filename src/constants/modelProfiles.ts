export type TargetModelId =
  | "gpt-5"
  | "gpt-4o"
  | "claude-sonnet-4"
  | "claude-opus-4"
  | "gemini-1.5-pro"
  | "gemini-1.5-flash"
  | "llama-3.1-405b-instruct"
  | "llama-3.1-70b-instruct"
  | "llama-3.1-8b-instruct"
  | "mistral-large-2"
  | "command-r-plus"
  | "grok-4";

export interface TargetModelProfile {
  label: string;
  notes: {
    systemRole: string;
    samplingTips: string;
    structureTips: string;
    toolCallingTips?: string;
    safetyTips?: string;
    doNots?: string[];
  };
}

export const TARGET_MODEL_PROFILES: Record<TargetModelId, TargetModelProfile> = {
  "gpt-5": {
    label: "GPT-5 (OpenAI)",
    notes: {
      systemRole: "Very steerable; put the role in the system or opening instruction.",
      samplingTips: "Use temperature; top_p optional. Verbosity and 'reasoning effort' can be requested via instructions.",
      structureTips: "Be explicit: planning phase, short approach summary, internal quality rubric.",
      safetyTips: "Avoid conflicting instructions; define precedence.",
      doNots: []
    }
  },
  "gpt-4o": {
    label: "GPT-4o (OpenAI)",
    notes: {
      systemRole: "Role can be set in a system message; follows style strongly.",
      samplingTips: "Temperature primarily; top_p optional.",
      structureTips: "Clear headings and output contract improve adherence.",
      doNots: []
    }
  },
  "claude-sonnet-4": {
    label: "Claude Sonnet 4",
    notes: {
      systemRole: "Use a concise system role + explicit instructions.",
      samplingTips: "Adjust temperature OR top_p (not both).",
      structureTips: "JSON/structured format works well; explicit sections and constraints.",
      safetyTips: "Prefer clarity; avoid contradictions.",
      doNots: ["Do not tune temperature and top_p simultaneously."]
    }
  },
  "claude-opus-4": {
    label: "Claude Opus 4",
    notes: {
      systemRole: "Strong system instruction; keep tone explicit.",
      samplingTips: "Pick one: temperature or top_p.",
      structureTips: "Great with explicit constraints and review step.",
      doNots: ["Avoid simultaneous temp+top_p tuning."]
    }
  },
  "gemini-1.5-pro": {
    label: "Gemini 1.5 Pro",
    notes: {
      systemRole: "Use a 'system_instruction' concept; be direct and structured.",
      samplingTips: "Supports temperature and topP; topK sometimes; specify only those needed.",
      structureTips: "If strict JSON is needed, say 'response_mime_type: application/json'.",
      doNots: []
    }
  },
  "gemini-1.5-flash": {
    label: "Gemini 1.5 Flash",
    notes: {
      systemRole: "Keep role concise; Flash favors brevity.",
      samplingTips: "Lower temperature for deterministic tasks.",
      structureTips: "Short, clearly-scoped instructions; fast results.",
      doNots: []
    }
  },
  "llama-3.1-405b-instruct": {
    label: "Llama 3.1 405B Instruct",
    notes: {
      systemRole: "Explicit role works well; detailed constraints help.",
      samplingTips: "Use temperature; top_p/top_k optional depending on host.",
      structureTips: "Clear formatting; discourage hallucinations via checks.",
      doNots: []
    }
  },
  "llama-3.1-70b-instruct": {
    label: "Llama 3.1 70B Instruct",
    notes: {
      systemRole: "Same as 405B with tighter scopes.",
      samplingTips: "Temperature primary; keep top_p stable unless expert.",
      structureTips: "Lists/tables improve fidelity.",
      doNots: []
    }
  },
  "llama-3.1-8b-instruct": {
    label: "Llama 3.1 8B Instruct",
    notes: {
      systemRole: "Be extra explicit; avoid long ambiguous tasks.",
      samplingTips: "Lower temperature for accuracy.",
      structureTips: "Shorter outputs; emphasize validation checklist.",
      doNots: []
    }
  },
  "mistral-large-2": {
    label: "Mistral Large 2",
    notes: {
      systemRole: "Use a clear, direct role and constraints.",
      samplingTips: "Prefer adjusting temperature OR top_p; top_k optional.",
      structureTips: "Supports response_format for JSON; explicit steps help.",
      doNots: ["Don't push temp and top_p together unless expert."]
    }
  },
  "command-r-plus": {
    label: "Cohere Command R+",
    notes: {
      systemRole: "Preambles/system guidance help consistency.",
      samplingTips: "Temperature only for most use; structured outputs via cookbook-style prompts.",
      structureTips: "Be explicit about sections and evidence.",
      doNots: []
    }
  },
  "grok-4": {
    label: "xAI Grok 4",
    notes: {
      systemRole: "OpenAI-style prompt works; note if web/live search should be avoided.",
      samplingTips: "Temperature/top_p similar to OpenAI.",
      structureTips: "Ask for strict sections for reliable parsing.",
      doNots: []
    }
  }
};