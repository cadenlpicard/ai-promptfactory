-- Create prompt_sessions table to store user prompts and optimizations
CREATE TABLE public.prompt_sessions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  
  -- Form data
  model_id TEXT NOT NULL,
  provider TEXT NOT NULL,
  user_prompt TEXT NOT NULL,
  domain_context TEXT,
  audience TEXT,
  tone TEXT,
  style TEXT,
  format_requirements TEXT,
  hard_constraints TEXT,
  prohibited TEXT,
  success_criteria TEXT,
  exemplars TEXT,
  avoid_list TEXT,
  
  -- Model parameters
  temperature DECIMAL NOT NULL DEFAULT 0.7,
  top_p DECIMAL,
  top_k INTEGER,
  max_tokens INTEGER NOT NULL DEFAULT 512,
  reasoning_effort TEXT,
  verbosity TEXT,
  structured_output BOOLEAN NOT NULL DEFAULT false,
  live_search BOOLEAN,
  enable_parallelization BOOLEAN NOT NULL DEFAULT false,
  
  -- Optimization results
  optimized_prompt TEXT,
  thought_process JSONB,
  input_checklist JSONB,
  raw_response TEXT
);

-- Enable Row Level Security
ALTER TABLE public.prompt_sessions ENABLE ROW LEVEL SECURITY;

-- Create policies for user access
CREATE POLICY "Users can view their own prompt sessions" 
ON public.prompt_sessions 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own prompt sessions" 
ON public.prompt_sessions 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own prompt sessions" 
ON public.prompt_sessions 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own prompt sessions" 
ON public.prompt_sessions 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_prompt_sessions_updated_at
  BEFORE UPDATE ON public.prompt_sessions
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create index for better performance
CREATE INDEX idx_prompt_sessions_user_id ON public.prompt_sessions(user_id);
CREATE INDEX idx_prompt_sessions_created_at ON public.prompt_sessions(created_at DESC);