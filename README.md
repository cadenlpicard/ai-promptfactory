# MagicPromptFactory

MagicPromptFactory is a **prompt optimization tool** that helps users generate, refine, and manage structured prompts for large language models (LLMs).  
It’s designed for AI power users, researchers, and professionals who want **better prompts with less friction**.

---

## ✨ Features

- **Dynamic Prompt Builder**  
  Choose tasks, use cases, and industries from drop-downs to generate meta-prompts.

- **Multi-Model Support**  
  Works with OpenAI today, with guidance for Gemini, Claude, Llama, Mistral, and more.

- **Prompt Optimization**  
  Sends your draft meta-prompt to an OpenAI-powered Supabase Edge Function, which returns:
  - Optimized prompt
  - Brief reasoning
  - Input checklist
  - Meta-prompt preview

- **Session Storage**  
  Automatically saves prompt sessions (inputs + outputs) in Supabase Postgres for history and reuse.

- **Clean UI**  
  Built with React + TypeScript + TailwindCSS + shadcn/ui, optimized for speed and usability.

---

## 🛠 Tech Stack

- **Frontend**
  - Vite + React + TypeScript
  - TailwindCSS + shadcn/ui + Radix UI
  - react-hook-form + zod
  - lucide-react, sonner (toasts), recharts, cmdk

- **Backend / Infra**
  - Supabase (Postgres + Edge Functions in Deno)
  - OpenAI SDK (for prompt optimization)
  - ESLint + SWC + Bun/npm

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v18+ or Bun)
- Supabase account + project
- OpenAI API key

### Setup
1. Clone the repo:
   ```bash
   git clone https://github.com/your-org/magicpromptfactory.git
   cd magicpromptfactory
