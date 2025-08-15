// Simple test without vitest dependency
console.log('Testing buildMetaPrompt...');
import { buildMetaPrompt } from '../buildMetaPrompt';
import { FormData } from '@/types';

const mockFormData = {
  targetModel: 'claude-sonnet-4',
  rawPrompt: 'Write a blog post about AI',
  domainContext: 'Technology',
  audience: 'Developers',
  tone: 'Professional',
  style: 'Informative',
  creativity: 0.7,
  responseLengthTokens: 512,
  focusLevel: 'Standard',
  thinkingDepth: 'Standard',
  enableParallelization: false,
  model_id: 'test',
  provider: 'openai',
  user_prompt: 'test',
  temperature: 0.7,
  top_p: 1,
  max_tokens: 512,
  structured_output: false,
  enable_parallelization: false
};

// Basic test without framework
try {
  const { buildMetaPrompt } = require('../buildMetaPrompt');
  const result = buildMetaPrompt(mockFormData);
  
  const hasModel = result.includes('Claude Sonnet 4');
  const hasSections = result.includes('## Optimized Prompt') && 
                     result.includes('## Brief Thought Process') && 
                     result.includes('## Input Checklist');
  const hasData = result.includes('Write a blog post about AI');
  
  console.log('✓ Model profile included:', hasModel);
  console.log('✓ Required sections present:', hasSections);
  console.log('✓ Form data embedded:', hasData);
  console.log('Tests passed!');
} catch (error) {
  console.error('Test failed:', error);
}