import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormDescription, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { FormData, Provider, ModelConfig } from '@/types';
import { getAllModels, getProviderConfig, getModelConfig } from '@/lib/providerRegistry';
import { domainContextOptions, audienceOptions, toneOptions, styleOptions, thinkingDepthOptions, detailLevelOptions } from '@/lib/dropdownOptions';
import { Factory, Sparkles, Settings, Zap, Target, Palette, Sliders, Play } from 'lucide-react';

const formSchema = z.object({
  targetModel: z.string().min(1, 'Please select a target model'),
  model_id: z.string().optional(), // Made optional since we use targetModel now
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
  creativity: z.number().min(0).max(2).optional(),
  top_p: z.number().min(0).max(1).optional(),
  top_k: z.number().min(1).max(100).optional(),
  max_tokens: z.number().min(1).max(16384),
  responseLengthTokens: z.number().min(1).max(16384).optional(),
  reasoning_effort: z.enum(['low', 'medium', 'high']).optional(),
  verbosity: z.enum(['concise', 'standard', 'detailed']).optional(),
  structured_output: z.boolean(),
  live_search: z.boolean().optional(),
  enable_parallelization: z.boolean(),
  focusLevel: z.string().optional(),
  thinkingDepth: z.string().optional(),
});

interface PromptFormProps {
  onSubmit: (data: FormData) => void;
  isLoading?: boolean;
}

// Helper functions for representative labels
const getCreativityLabel = (value: number): string => {
  if (value <= 0.3) return "Rule Follower";
  if (value <= 0.7) return "Balanced";
  if (value <= 1.2) return "Creative";
  if (value <= 1.6) return "Very Creative";
  return "Creative Genius";
};

const getFocusLabel = (value: number): string => {
  if (value <= 0.2) return "Laser Focused";
  if (value <= 0.5) return "Focused";
  if (value <= 0.8) return "Balanced";
  return "Less Focused";
};

const getResponseLengthLabel = (value: number): string => {
  if (value <= 100) return "Brief";
  if (value <= 300) return "Concise";
  if (value <= 800) return "Standard";
  if (value <= 1500) return "Detailed";
  return "Comprehensive";
};

export function PromptForm({ onSubmit, isLoading }: PromptFormProps) {
  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      targetModel: 'gpt-5',
      model_id: 'gpt-5', // Set default to prevent validation issues
      provider: 'openai',
      user_prompt: '',
      temperature: 0.7,
      creativity: 0.7,
      max_tokens: 512,
      responseLengthTokens: 512,
      structured_output: false,
      enable_parallelization: false,
      focusLevel: 'Standard',
      thinkingDepth: 'Standard',
    },
  });

  const selectedModelId = form.watch('model_id');
  const selectedModel = getModelConfig(selectedModelId);
  const selectedProvider = selectedModel ? getProviderConfig(selectedModel.provider) : null;

  const handleModelChange = (modelId: string) => {
    const modelConfig = getModelConfig(modelId);
    if (modelConfig) {
      form.setValue('model_id', modelId);
      form.setValue('provider', modelConfig.provider);
      form.setValue('max_tokens', Math.min(512, modelConfig.maxTokens));
    }
  };

  return (
    <Card className="h-full border-2 border-primary/20 shadow-card hover:shadow-fun transition-all duration-300">
      <CardHeader className="pb-4 bg-gradient-subtle rounded-t-lg">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-primary flex items-center justify-center shadow-glow">
            <Factory className="h-5 w-5 text-white" />
          </div>
          <div>
            <CardTitle className="text-xl">🏭 Factory Controls</CardTitle>
            <CardDescription className="text-muted-foreground">
              Configure your prompt manufacturing settings
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-6 max-h-[calc(100vh-8rem)] overflow-y-auto">
        <Form {...form}>
          <form onSubmit={form.handleSubmit((data) => {
            console.log("Form submission triggered with data:", data);
            onSubmit(data);
          })} className="space-y-8">
            
            {/* Target Model Selection */}
            <div className="space-y-4 p-4 rounded-xl bg-gradient-surface border border-border/50">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Zap className="h-4 w-4 text-primary" />
                </div>
                <h3 className="text-lg font-semibold">🎯 Target Model</h3>
              </div>
              
              <FormField
                control={form.control}
                name="targetModel"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-base font-medium">Optimize For</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger className="border-2 border-primary/20 rounded-xl h-12">
                          <SelectValue placeholder="Choose target model..." />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="gpt-5">GPT-5 (OpenAI)</SelectItem>
                        <SelectItem value="gpt-4o">GPT-4o (OpenAI)</SelectItem>
                        <SelectItem value="claude-sonnet-4">Claude Sonnet 4</SelectItem>
                        <SelectItem value="claude-opus-4">Claude Opus 4</SelectItem>
                        <SelectItem value="gemini-1.5-pro">Gemini 1.5 Pro</SelectItem>
                        <SelectItem value="gemini-1.5-flash">Gemini 1.5 Flash</SelectItem>
                        <SelectItem value="llama-3.1-405b-instruct">Llama 3.1 405B Instruct</SelectItem>
                        <SelectItem value="llama-3.1-70b-instruct">Llama 3.1 70B Instruct</SelectItem>
                        <SelectItem value="llama-3.1-8b-instruct">Llama 3.1 8B Instruct</SelectItem>
                        <SelectItem value="mistral-large-2">Mistral Large 2</SelectItem>
                        <SelectItem value="command-r-plus">Cohere Command R+</SelectItem>
                        <SelectItem value="grok-4">xAI Grok 4</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      We'll optimize your prompt for this model's best practices using OpenAI
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Raw Material Input */}
            <div className="space-y-4 p-4 rounded-xl bg-gradient-surface border border-border/50">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-secondary/10 flex items-center justify-center">
                  <Sparkles className="h-4 w-4 text-secondary" />
                </div>
                <h3 className="text-lg font-semibold">✨ Raw Material</h3>
              </div>

              <FormField
                control={form.control}
                name="user_prompt"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-base font-medium">🎯 Your Raw Prompt</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Describe what you want the AI to do... We'll turn it into gold! ✨"
                        className="min-h-[120px] resize-none border-2 border-primary/20 focus:border-primary/40 rounded-xl"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      Don't worry about perfection - that's our job! 🏭
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Manufacturing Specs */}
            <div className="space-y-4 p-4 rounded-xl bg-gradient-surface border border-border/50">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-accent/10 flex items-center justify-center">
                  <Target className="h-4 w-4 text-accent" />
                </div>
                <h3 className="text-lg font-semibold">🎯 Manufacturing Specs</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="domain_context"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium">🏢 Domain Context</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger className="border-2 border-primary/20 rounded-xl">
                            <SelectValue placeholder="Choose your domain..." />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {domainContextOptions.map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="audience"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium">👥 Target Audience</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger className="border-2 border-primary/20 rounded-xl">
                            <SelectValue placeholder="Who's your audience?" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {audienceOptions.map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="tone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium">🎭 Tone</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger className="border-2 border-primary/20 rounded-xl">
                            <SelectValue placeholder="Pick your tone..." />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {toneOptions.map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="style"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium">✍️ Style</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger className="border-2 border-primary/20 rounded-xl">
                            <SelectValue placeholder="Choose your style..." />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {styleOptions.map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Additional Context Fields */}
              <div className="grid grid-cols-1 gap-4 mt-4">
                <FormField
                  control={form.control}
                  name="format_requirements"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium">📋 Format Requirements</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="e.g., Use bullet points, Include examples..."
                          className="border-2 border-primary/20 rounded-xl"
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="hard_constraints"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-medium">⚠️ Hard Constraints</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="Must include..."
                            className="border-2 border-primary/20 rounded-xl"
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="prohibited"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-medium">🚫 Prohibited Content</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="Don't mention..."
                            className="border-2 border-primary/20 rounded-xl"
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>
            </div>

            {/* Factory Settings */}
            <div className="space-y-4 p-4 rounded-xl bg-gradient-surface border border-border/50">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-success/10 flex items-center justify-center">
                  <Sliders className="h-4 w-4 text-success" />
                </div>
                <h3 className="text-lg font-semibold">⚙️ Factory Settings</h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 {/* Creativity Level */}
                <FormField
                  control={form.control}
                  name="creativity"
                  render={({ field }) => (
                    <FormItem className="space-y-3">
                       <FormLabel className="text-sm font-medium flex items-center gap-2">
                         🎨 Creativity Level
                         <span className="text-xs text-muted-foreground">
                           ({field.value || 0.7} - {getCreativityLabel(field.value || 0.7)})
                         </span>
                       </FormLabel>
                      <FormControl>
                        <Slider
                          min={0}
                          max={2}
                          step={0.1}
                          value={[field.value || 0.7]}
                          onValueChange={(vals) => {
                            field.onChange(vals[0]);
                            form.setValue('temperature', vals[0]);
                          }}
                          className="w-full"
                        />
                      </FormControl>
                      <FormDescription className="text-xs">
                        How creative should the final model be? 🎪
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Response Length */}
                <FormField
                  control={form.control}
                  name="max_tokens"
                  render={({ field }) => (
                    <FormItem className="space-y-3">
                       <FormLabel className="text-sm font-medium flex items-center gap-2">
                         📏 Response Length
                         <span className="text-xs text-muted-foreground">
                           ({field.value} tokens - {getResponseLengthLabel(field.value)})
                         </span>
                       </FormLabel>
                      <FormControl>
                        <Slider
                          min={50}
                          max={selectedModel?.maxTokens || 4000}
                          step={50}
                          value={[field.value]}
                          onValueChange={(vals) => field.onChange(vals[0])}
                          className="w-full"
                        />
                      </FormControl>
                      <FormDescription className="text-xs">
                        How long should the response be? 📚
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Focus Level */}
                {selectedProvider?.params.top_p && (
                  <FormField
                    control={form.control}
                    name="top_p"
                    render={({ field }) => (
                      <FormItem className="space-y-3">
                         <FormLabel className="text-sm font-medium flex items-center gap-2">
                           🎯 Focus Level
                           <span className="text-xs text-muted-foreground">
                             ({field.value || 1.0} - {getFocusLabel(field.value || 1.0)})
                           </span>
                         </FormLabel>
                        <FormControl>
                          <Slider
                            min={0}
                            max={1}
                            step={0.1}
                            value={[field.value || 1]}
                            onValueChange={(vals) => field.onChange(vals[0])}
                            className="w-full"
                          />
                        </FormControl>
                        <FormDescription className="text-xs">
                          How focused should the response be? 🔍
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}

                {/* Variety Level */}
                {selectedProvider?.params.top_k && (
                  <FormField
                    control={form.control}
                    name="top_k"
                    render={({ field }) => (
                      <FormItem className="space-y-3">
                        <FormLabel className="text-sm font-medium flex items-center gap-2">
                          🌈 Variety Level
                          <span className="text-xs text-muted-foreground">({field.value || 'Auto'})</span>
                        </FormLabel>
                        <FormControl>
                          <Slider
                            min={1}
                            max={100}
                            step={1}
                            value={[field.value || 40]}
                            onValueChange={(vals) => field.onChange(vals[0])}
                            className="w-full"
                          />
                        </FormControl>
                        <FormDescription className="text-xs">
                          How varied should the word choices be? 🎨
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}

                {/* Thinking Depth */}
                {selectedProvider?.params.reasoning_effort && (
                  <FormField
                    control={form.control}
                    name="reasoning_effort"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-medium">🧠 Thinking Depth</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger className="border-2 border-primary/20 rounded-xl">
                              <SelectValue placeholder="How deep should it think?" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {thinkingDepthOptions.map((option) => (
                              <SelectItem key={option.value} value={option.value}>
                                {option.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormDescription className="text-xs">
                          How much should the AI think before responding? 🤔
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}

                {/* Detail Level */}
                {selectedProvider?.params.verbosity && (
                  <FormField
                    control={form.control}
                    name="verbosity"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-medium">📝 Detail Level</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger className="border-2 border-primary/20 rounded-xl">
                              <SelectValue placeholder="How detailed?" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {detailLevelOptions.map((option) => (
                              <SelectItem key={option.value} value={option.value}>
                                {option.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormDescription className="text-xs">
                          How detailed should the response be? 📚
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}
              </div>

              {/* Feature Toggles */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
                <FormField
                  control={form.control}
                  name="structured_output"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-xl border-2 border-primary/20 p-4 shadow-card bg-gradient-subtle">
                      <div className="space-y-0.5">
                        <FormLabel className="text-sm font-medium">📋 Organized Format</FormLabel>
                        <FormDescription className="text-xs">
                          Structure the output nicely
                        </FormDescription>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />

                {selectedProvider?.params.live_search && (
                  <FormField
                    control={form.control}
                    name="live_search"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-xl border-2 border-primary/20 p-4 shadow-card bg-gradient-subtle">
                        <div className="space-y-0.5">
                          <FormLabel className="text-sm font-medium">🔍 Live Search</FormLabel>
                          <FormDescription className="text-xs">
                            Real-time web search
                          </FormDescription>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                )}

                <FormField
                  control={form.control}
                  name="enable_parallelization"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-xl border-2 border-primary/20 p-4 shadow-card bg-gradient-subtle">
                      <div className="space-y-0.5">
                        <FormLabel className="text-sm font-medium">⚡ Multi-step Processing</FormLabel>
                        <FormDescription className="text-xs">
                          Enable parallel tasks
                        </FormDescription>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>
            </div>

            <div className="pt-6 border-t border-border/30">
              <Button 
                type="submit" 
                className="w-full bg-gradient-fun hover:scale-105 shadow-fun border-0 text-white font-semibold text-lg h-14 rounded-2xl transition-all duration-300" 
                disabled={isLoading}
                size="lg"
              >
                {isLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3" />
                    🏭 Manufacturing Magic...
                  </>
                ) : (
                  <>
                    <Play className="mr-3 h-5 w-5" />
                    🚀 Start Production!
                  </>
                )}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}