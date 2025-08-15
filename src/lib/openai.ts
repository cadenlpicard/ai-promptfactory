import OpenAI from "openai";

const apiKey = import.meta.env.VITE_OPENAI_API_KEY || process.env.OPENAI_API_KEY;

if (!apiKey) {
  console.warn("OpenAI API key not found. Please set VITE_OPENAI_API_KEY environment variable.");
}

export const openai = new OpenAI({
  apiKey: apiKey || "placeholder",
  dangerouslyAllowBrowser: true
});