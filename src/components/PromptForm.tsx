import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { FormData, Provider, ModelConfig } from '@/types';
import { getAllModels, getProviderConfig, getModelConfig } from '@/lib/providerRegistry';
import { Sparkles, Settings, Target, Users } from 'lucide-react';

const formSchema = z.object({
  model_id: z.string().min(1, 'Please select a model'),
  provider: z.enum(['openai', 'gemini', 'claude', 'grok', 'llama', 'mistral', 'cohere']),
  user_prompt: z.string().min(10, 'Prompt must be at least 10 characters'),
  domain_context: z.string().optional(),
  audience: z.string().optional(),
  tone: z.string().optional(),
  style: z.string().optional(),
  format_requirements: z.string().optional(),
  hard_constraints: z.string().optional(),
  prohibited: z.string().optional(),
  success_criteria: z.string().optional(),
  exemplars: z.string().optional(),
  avoid_list: z.string().optional(),
  temperature: z.number().min(0).max(2),
  top_p: z.number().min(0).max(1).optional(),
  top_k: z.number().min(1).max(100).optional(),
  max_tokens: z.number().min(1).max(16384),
  reasoning_effort: z.enum(['low', 'medium', 'high']).optional(),
  verbosity: z.enum(['concise', 'standard', 'detailed']).optional(),
  structured_output: z.boolean(),
  live_search: z.boolean().optional(),
  enable_parallelization: z.boolean(),
});

interface PromptFormProps {
  onSubmit: (data: FormData) => void;
  isLoading?: boolean;
}

export function PromptForm({ onSubmit, isLoading }: PromptFormProps) {
  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      model_id: '',
      provider: 'openai',
      user_prompt: '',
      temperature: 0.7,
      max_tokens: 512,
      structured_output: false,
      enable_parallelization: false,
    },
  });

  const selectedModelId = form.watch('model_id');
  const selectedModel = getModelConfig(selectedModelId);
  const providerConfig = selectedModel ? getProviderConfig(selectedModel.provider) : null;

  const handleModelChange = (modelId: string) => {
    const modelConfig = getModelConfig(modelId);
    if (modelConfig) {
      form.setValue('model_id', modelId);
      form.setValue('provider', modelConfig.provider);
      form.setValue('max_tokens', Math.min(512, modelConfig.maxTokens));
    }
  };

  return (
    <Card className="h-full bg-gradient-surface border-border/50 shadow-card">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-xl font-semibold">
          <Sparkles className="h-5 w-5 text-primary" />
          Prompt Configuration
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-6 max-h-[calc(100vh-8rem)] overflow-y-auto">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            
            {/* Model Selection */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Settings className="h-4 w-4 text-muted-foreground" />
                <h3 className="text-sm font-medium text-foreground">Model Selection</h3>
              </div>
              
              <FormField
                control={form.control}
                name="model_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>AI Model</FormLabel>
                    <Select onValueChange={handleModelChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger className="bg-background/50 border-border/50">
                          <SelectValue placeholder="Select an AI model" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="bg-card border-border/50">
                        {Object.entries(
                          getAllModels().reduce((acc, model) => {
                            if (!acc[model.provider]) acc[model.provider] = [];
                            acc[model.provider].push(model);
                            return acc;
                          }, {} as Record<Provider, ModelConfig[]>)
                        ).map(([provider, models]) => (
                          <div key={provider}>
                            <div className="px-2 py-1.5 text-xs font-medium text-muted-foreground uppercase tracking-wide">
                              {provider}
                            </div>
                            {models.map((model) => (
                              <SelectItem key={model.id} value={model.id} className="pl-4">
                                {model.name}
                              </SelectItem>
                            ))}
                          </div>
                        ))}
                      </SelectContent>
                    </Select>
                  </FormItem>
                )}
              />
            </div>

            <Separator className="bg-border/50" />

            {/* Core Prompt */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Target className="h-4 w-4 text-muted-foreground" />
                <h3 className="text-sm font-medium text-foreground">Core Prompt</h3>
              </div>
              
              <FormField
                control={form.control}
                name="user_prompt"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Your Prompt</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Enter your prompt that needs optimization..."
                        className="min-h-[120px] bg-background/50 border-border/50 resize-none"
                        {...field}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>

            <Separator className="bg-border/50" />

            {/* Context & Requirements */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-muted-foreground" />
                <h3 className="text-sm font-medium text-foreground">Context & Requirements</h3>
              </div>
              
              <div className="grid grid-cols-1 gap-4">
                <FormField
                  control={form.control}
                  name="domain_context"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Domain Context</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., software development, marketing, legal" className="bg-background/50 border-border/50" {...field} />
                      </FormControl>
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="audience"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Target Audience</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., developers, executives, students" className="bg-background/50 border-border/50" {...field} />
                      </FormControl>
                    </FormItem>
                  )}
                />
                
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="tone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Tone</FormLabel>
                        <FormControl>
                          <Input placeholder="professional, casual, academic" className="bg-background/50 border-border/50" {...field} />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="style"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Style</FormLabel>
                        <FormControl>
                          <Input placeholder="concise, detailed, creative" className="bg-background/50 border-border/50" {...field} />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </div>
              </div>
            </div>

            <Separator className="bg-border/50" />

            {/* Model Parameters */}
            {providerConfig && (
              <div className="space-y-4">
                <h3 className="text-sm font-medium text-foreground">Model Parameters</h3>
                
                {providerConfig.params.temperature && (
                  <FormField
                    control={form.control}
                    name="temperature"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Temperature: {field.value}</FormLabel>
                        <FormControl>
                          <Slider
                            min={0}
                            max={2}
                            step={0.1}
                            value={[field.value]}
                            onValueChange={(value) => field.onChange(value[0])}
                            className="w-full"
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                )}

                {providerConfig.params.top_p && (
                  <FormField
                    control={form.control}
                    name="top_p"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Top P: {field.value || 'auto'}</FormLabel>
                        <FormControl>
                          <Slider
                            min={0}
                            max={1}
                            step={0.05}
                            value={[field.value || 1]}
                            onValueChange={(value) => field.onChange(value[0])}
                            className="w-full"
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                )}

                <FormField
                  control={form.control}
                  name="max_tokens"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Max Tokens</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min="1"
                          max={selectedModel?.maxTokens || 8192}
                          className="bg-background/50 border-border/50"
                          {...field}
                          onChange={(e) => field.onChange(parseInt(e.target.value))}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />

                {providerConfig.params.reasoning_effort && (
                  <FormField
                    control={form.control}
                    name="reasoning_effort"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Reasoning Effort</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger className="bg-background/50 border-border/50">
                              <SelectValue placeholder="Select effort level" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent className="bg-card border-border/50">
                            <SelectItem value="low">Low</SelectItem>
                            <SelectItem value="medium">Medium</SelectItem>
                            <SelectItem value="high">High</SelectItem>
                          </SelectContent>
                        </Select>
                      </FormItem>
                    )}
                  />
                )}

                {providerConfig.params.verbosity && (
                  <FormField
                    control={form.control}
                    name="verbosity"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Verbosity</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger className="bg-background/50 border-border/50">
                              <SelectValue placeholder="Select verbosity" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent className="bg-card border-border/50">
                            <SelectItem value="concise">Concise</SelectItem>
                            <SelectItem value="standard">Standard</SelectItem>
                            <SelectItem value="detailed">Detailed</SelectItem>
                          </SelectContent>
                        </Select>
                      </FormItem>
                    )}
                  />
                )}

                <div className="flex items-center justify-between">
                  <FormField
                    control={form.control}
                    name="structured_output"
                    render={({ field }) => (
                      <FormItem className="flex items-center space-x-2">
                        <FormControl>
                          <Switch checked={field.value} onCheckedChange={field.onChange} />
                        </FormControl>
                        <FormLabel>Structured Output</FormLabel>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="enable_parallelization"
                    render={({ field }) => (
                      <FormItem className="flex items-center space-x-2">
                        <FormControl>
                          <Switch checked={field.value} onCheckedChange={field.onChange} />
                        </FormControl>
                        <FormLabel>Parallel Tasks</FormLabel>
                      </FormItem>
                    )}
                  />
                </div>
              </div>
            )}

            <Button
              type="submit"
              className="w-full bg-gradient-primary hover:shadow-glow transition-all duration-300"
              disabled={isLoading}
            >
              {isLoading ? 'Optimizing...' : 'Optimize Prompt'}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}