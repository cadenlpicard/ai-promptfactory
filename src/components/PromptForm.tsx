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
import { Checkbox } from '@/components/ui/checkbox';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { FormData, Provider, ModelConfig, PromptAnalysis } from '@/types';
import { getAllModels, getProviderConfig, getModelConfig } from '@/lib/providerRegistry';
import { domainContextOptions, audienceOptions, toneOptions, styleOptions, thinkingDepthOptions, detailLevelOptions } from '@/lib/dropdownOptions';
import { USE_CASES, DOMAINS, getTasksForUseCase, getFieldsFor } from '@/config/tasksConfig';
import { Factory, Sparkles, Settings, Zap, Target, Palette, Sliders, Play, ChevronDown, ChevronUp, Layers, Wand2 } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';
import { useState, useEffect, useMemo } from 'react';
import { analyzePrompt } from '@/lib/promptAnalyzer';
import { useToast } from '@/hooks/use-toast';

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
  
  // Dynamic use case fields
  use_case: z.string().optional(),
  domain: z.string().optional(),
  task: z.string().optional(),
  dynamic_fields: z.record(z.any()).optional(),
  
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
  onAnalyzeStart?: () => void;
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

export function PromptForm({ onSubmit, isLoading, onAnalyzeStart }: PromptFormProps) {
  const isMobile = useIsMobile();
  const { toast } = useToast();
  const [specsOpen, setSpecsOpen] = useState(!isMobile);
  const [settingsOpen, setSettingsOpen] = useState(!isMobile);
  
  // Analysis state
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [aiSuggestions, setAiSuggestions] = useState<PromptAnalysis | null>(null);
  const [userOverrides, setUserOverrides] = useState<Set<string>>(new Set());
  
  // Dynamic use case state
  const [selectedUseCase, setSelectedUseCase] = useState<string | undefined>();
  const [selectedTask, setSelectedTask] = useState<string | undefined>();
const tasks = useMemo(() => getTasksForUseCase(selectedUseCase), [selectedUseCase]);
  const dynamicFields = useMemo(() => getFieldsFor(selectedUseCase, selectedTask), [selectedUseCase, selectedTask]);
  
  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      targetModel: 'gpt-5',
      model_id: 'gpt-5',
      provider: 'openai',
      user_prompt: '',
      domain_context: '',
      audience: '',
      tone: '',
      style: '',
      format_requirements: '',
      hard_constraints: '',
      use_case: '',
      domain: 'general',
      task: '',
      temperature: 0.7,
      creativity: 0.7,
      max_tokens: 512,
      responseLengthTokens: 512,
      structured_output: false,
      enable_parallelization: false,
      focusLevel: 'Standard',
      thinkingDepth: 'Standard',
      dynamic_fields: {},
    },
  });

  // Reset dynamic fields when use case or task changes
  useEffect(() => {
    const defaults: Record<string, any> = {};
    dynamicFields.forEach(field => {
      if (field.type === 'checkbox') {
        defaults[field.id] = field.default ?? false;
      } else if (field.type === 'number') {
        defaults[field.id] = field.default ?? field.min ?? 0;
      } else if (field.type === 'select') {
        const first = Array.isArray(field.options) ? field.options[0] : '';
        defaults[field.id] = field.default ?? first ?? '';
      } else if (field.type === 'multiselect') {
        defaults[field.id] = field.default ?? [];
      } else {
        defaults[field.id] = field.default ?? '';
      }
    });
    form.setValue('dynamic_fields', defaults, { shouldDirty: true, shouldValidate: true });
  }, [selectedUseCase, selectedTask, dynamicFields, form]);

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

  const handleAnalyzePrompt = async () => {
    const userPrompt = form.getValues('user_prompt');
    
    if (!userPrompt || userPrompt.trim().length < 10) {
      toast({
        title: "Prompt too short",
        description: "Please enter at least 10 characters to analyze your prompt.",
        variant: "destructive"
      });
      return;
    }

    onAnalyzeStart?.();
    setIsAnalyzing(true);
    
    try {
      const analysis = await analyzePrompt(userPrompt);
      setAiSuggestions(analysis);
      
      // Get available options for validation
      const useCaseOptions = USE_CASES.map(uc => uc.id);
      const domainOptions = DOMAINS.map(d => d.id);
      
      console.log('Analysis received:', analysis);
      console.log('Available use cases:', useCaseOptions);
      console.log('Available domains:', domainOptions);
      
      // Normalize and map AI suggestions to internal IDs
      const normalize = (s?: string) => (s ?? '').toLowerCase().replace(/[_\s]+/g, '-');
      const useCaseMap: Record<string, string> = {
        'content-creation': 'write-blog',
        'content_creation': 'write-blog',
        'blogging': 'write-blog',
        'write': 'write-blog',
        'writing': 'write-blog',
        'email': 'email-reply',
        'communications': 'email-reply',
        'communication': 'email-reply',
        'research': 'research',
        'data-analysis': 'data-analysis',
        'data_analysis': 'data-analysis',
        'analytics': 'data-analysis',
        'code-review': 'code-review',
        'code_review': 'code-review',
        'coding': 'code-review',
        'software-development': 'code-review',
        'dev': 'code-review',
        'creative-writing': 'creative-writing',
        'technical-documentation': 'technical-documentation',
        'project-planning': 'project-planning',
        // Sometimes the model reports a "presentation" use case; map to executive summary writing
        'presentation': 'write-blog',
      };
      const domainMap: Record<string, string> = {
        'business': 'marketing',
        'sales': 'marketing',
        'content': 'marketing',
        'software': 'software-engineering',
        'technology': 'software-engineering',
        'tech': 'software-engineering',
        'it': 'software-engineering',
        'general': 'general',
      };
      const audienceMap: Record<string, string> = {
        'business-executives': 'executives',
        'executives': 'executives',
        'general-public': 'general-public',
        'developers': 'developers',
      };
      const desiredUseCase = analysis.use_case ? (useCaseMap[normalize(analysis.use_case)] || analysis.use_case) : undefined;
      const desiredTask = (() => {
        let t = analysis.task;
        if (desiredUseCase === 'write-blog') {
          const tKey = normalize(analysis.task);
          if (tKey === 'presentation' || tKey === 'slide-deck' || tKey === 'slides') return 'executive-summary';
        }
        return t;
      })();
      const desiredDomain = analysis.domain ? (domainMap[normalize(analysis.domain)] || analysis.domain) : undefined;
      const desiredAudience = analysis.audience ? (audienceMap[normalize(analysis.audience)] || analysis.audience) : undefined;
      const desiredReasoning = (() => {
        const k = normalize(analysis.thinkingDepth);
        if (!k) return undefined;
        if (k === 'standard' || k === 'medium') return 'medium';
        if (k === 'quick' || k === 'low') return 'low';
        if (k === 'deep' || k === 'high') return 'high';
        return undefined;
      })();
      const desiredTopP = (() => {
        const k = normalize(analysis.focusLevel);
        if (!k) return undefined;
        if (k === 'laser-focused') return 0.2;
        if (k === 'focused') return 0.5;
        if (k === 'balanced' || k === 'standard') return 0.8;
        if (k === 'less-focused') return 1.0;
        return undefined;
      })();
      
      // Auto-populate form fields with AI suggestions (validate against available options)
      if (desiredUseCase) {
        if (useCaseOptions.includes(desiredUseCase)) {
          console.log('Setting use_case to:', desiredUseCase);
          form.setValue('use_case', desiredUseCase, { shouldDirty: true, shouldValidate: true });
          setSelectedUseCase(desiredUseCase);
        } else {
          console.log('Invalid use_case:', desiredUseCase, 'Available:', useCaseOptions);
        }
      }
      
      if (desiredTask) {
        const taskDefs = getTasksForUseCase(desiredUseCase);
        const availableTasks = taskDefs.map(t => t.id);
        let taskToSet = desiredTask;

        const norm = (s: string | undefined) => (s ?? '').toLowerCase().replace(/[_\s]+/g, '-');
        const desiredNorm = norm(analysis.task);

        if (!availableTasks.includes(taskToSet) && analysis.task) {
          // Try by id match (normalized)
          const byId = availableTasks.find(id => norm(id) === desiredNorm);
          if (byId) taskToSet = byId;

          // Try by task name exact
          if (!byId) {
            const byName = taskDefs.find(t => norm(t.name) === desiredNorm);
            if (byName) taskToSet = byName.id;
          }

          // Try partial match
          if (!availableTasks.includes(taskToSet)) {
            const partial = taskDefs.find(t => norm(t.name).includes(desiredNorm) || desiredNorm.includes(norm(t.name)));
            if (partial) taskToSet = partial.id;
          }

          // Synonyms
          if (!availableTasks.includes(taskToSet)) {
            const synonyms: Record<string, string> = {
              'summary': 'executive-summary',
              'summarize': 'executive-summary',
              'slides': 'executive-summary',
              'slide-deck': 'executive-summary',
              'presentation': 'executive-summary',
              'market-analysis': 'market-analysis-post',
              'tutorial': 'technical-tutorial',
            };
            const syn = synonyms[desiredNorm];
            if (syn && availableTasks.includes(syn)) taskToSet = syn;
          }
        }

        if (availableTasks.includes(taskToSet)) {
          console.log('Setting task to:', taskToSet);
          form.setValue('task', taskToSet, { shouldDirty: true, shouldValidate: true });
          setSelectedTask(taskToSet);
        } else {
          console.log('Invalid task:', desiredTask, 'Available:', availableTasks);
        }
      }
      
      if (desiredDomain && !userOverrides.has('domain')) {
        if (domainOptions.includes(desiredDomain)) {
          console.log('Setting domain to:', desiredDomain);
          form.setValue('domain', desiredDomain, { shouldDirty: true, shouldValidate: true });
        } else {
          console.log('Invalid domain:', desiredDomain, 'Available:', domainOptions);
        }
      }
      
      if (desiredAudience && !userOverrides.has('audience')) {
        console.log('Setting audience to:', desiredAudience);
        form.setValue('audience', desiredAudience, { shouldDirty: true, shouldValidate: true });
      }
      
      if (analysis.tone && !userOverrides.has('tone')) {
        console.log('Setting tone to:', analysis.tone);
        form.setValue('tone', analysis.tone, { shouldDirty: true, shouldValidate: true });
      }
      
      if (analysis.style && !userOverrides.has('style')) {
        console.log('Setting style to:', analysis.style);
        form.setValue('style', analysis.style, { shouldDirty: true, shouldValidate: true });
      }
      
      if (analysis.creativity !== undefined && !userOverrides.has('creativity')) {
        console.log('Setting creativity to:', analysis.creativity);
        form.setValue('creativity', analysis.creativity, { shouldDirty: true, shouldValidate: true });
        form.setValue('temperature', analysis.creativity, { shouldDirty: true, shouldValidate: true });
      }
      
      if (analysis.responseLengthTokens && !userOverrides.has('responseLengthTokens')) {
        console.log('Setting responseLengthTokens to:', analysis.responseLengthTokens);
        form.setValue('responseLengthTokens', analysis.responseLengthTokens, { shouldDirty: true, shouldValidate: true });
        form.setValue('max_tokens', analysis.responseLengthTokens, { shouldDirty: true, shouldValidate: true });
      }
      
      // Map focus/thinking to provider parameters when possible
      if (desiredTopP !== undefined && !userOverrides.has('top_p')) {
        console.log('Setting top_p to:', desiredTopP);
        form.setValue('top_p', desiredTopP, { shouldDirty: true, shouldValidate: true });
      }
      
      if (desiredReasoning && !userOverrides.has('reasoning_effort')) {
        console.log('Setting reasoning_effort to:', desiredReasoning);
        form.setValue('reasoning_effort', desiredReasoning, { shouldDirty: true, shouldValidate: true });
      }
      
      if (analysis.format_requirements && !userOverrides.has('format_requirements')) {
        console.log('Setting format_requirements to:', analysis.format_requirements);
        form.setValue('format_requirements', analysis.format_requirements, { shouldDirty: true, shouldValidate: true });
      }
      
      if (analysis.hard_constraints && !userOverrides.has('hard_constraints')) {
        console.log('Setting hard_constraints to:', analysis.hard_constraints);
        form.setValue('hard_constraints', analysis.hard_constraints, { shouldDirty: true, shouldValidate: true });
      }
      
      // Force form to re-render with new values
      form.trigger();

      toast({
        title: "Prompt analyzed successfully",
        description: "Your form has been auto-populated with AI suggestions. You can review and adjust as needed."
      });

    } catch (error) {
      console.error('Analysis failed:', error);
      toast({
        title: "Analysis failed",
        description: "Unable to analyze your prompt. You can still configure the form manually.",
        variant: "destructive"
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const markFieldAsUserOverride = (fieldName: string) => {
    setUserOverrides(prev => new Set([...prev, fieldName]));
  };

  return (
    <Card className="h-full border-2 border-primary/20 shadow-card hover:shadow-fun transition-all duration-300">
      <CardHeader className="pb-3 sm:pb-4 bg-gradient-subtle rounded-t-lg px-4 py-4 sm:px-6 sm:py-6">
        <div className="flex items-center gap-3 sm:gap-4">
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-gradient-primary flex items-center justify-center shadow-glow flex-shrink-0">
            <Factory className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
          </div>
          <div className="min-w-0 flex-1">
            <CardTitle className="text-lg sm:text-2xl">🏭 Factory Controls</CardTitle>
            <CardDescription className="text-sm sm:text-base text-muted-foreground">
              Configure your prompt manufacturing settings
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4 sm:space-y-6 max-h-[calc(100vh-8rem)] sm:max-h-[calc(100vh-10rem)] overflow-y-auto p-4 sm:p-6">
        <Form {...form}>
          <form onSubmit={form.handleSubmit((data) => {
            console.log("Form submission triggered with data:", data);
            onSubmit(data);
          })} className="space-y-4 sm:space-y-8">
            
            {/* Raw Material Section - Now First */}
            <div className="space-y-4 sm:space-y-6 p-4 sm:p-6 rounded-xl bg-gradient-surface border border-border/50">
              <div className="flex items-center gap-3 sm:gap-4">
                <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <Factory className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
                </div>
                <h3 className="text-lg sm:text-xl font-semibold">🛠️ Raw Material</h3>
              </div>

              <FormField
                control={form.control}
                name="user_prompt"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium">Your Raw Prompt *</FormLabel>
                    <FormDescription className="text-xs text-muted-foreground">
                      Enter your draft prompt here. We'll analyze it and suggest optimal settings.
                    </FormDescription>
                    <FormControl>
                      <Textarea
                        placeholder="Enter your prompt ideas, goals, or draft content here..."
                        className="border-2 border-primary/20 rounded-xl min-h-[120px] resize-none"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                <Button
                  type="button"
                  onClick={handleAnalyzePrompt}
                  disabled={isAnalyzing || !form.watch('user_prompt')?.trim() || form.watch('user_prompt')?.trim().length < 10}
                  className="flex-1 bg-gradient-primary hover:opacity-90 text-white border-0 shadow-glow h-12 rounded-xl"
                >
                  {isAnalyzing ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                      Analyzing...
                    </>
                  ) : (
                    <>
                      <Wand2 className="w-4 h-4 mr-2" />
                      Analyze & Pre-populate
                    </>
                  )}
                </Button>
                <p className="text-xs text-muted-foreground mt-2">
                  Note: The Meta Prompt updates after you click “Start Production”. Analyze only pre-fills the form.
                </p>
              </div>

              {aiSuggestions && (
                <div className="p-3 rounded-lg bg-accent/10 border border-accent/20">
                  <p className="text-xs text-muted-foreground">
                    ✨ AI analysis complete! Fields below are auto-populated with suggestions. 
                    You can review and adjust any values as needed.
                  </p>
                </div>
              )}
            </div>

            {/* Dynamic Use Cases Section */}
            <div className="space-y-4 sm:space-y-6 p-4 sm:p-6 rounded-xl bg-gradient-surface border border-border/50">
              <div className="flex items-center gap-3 sm:gap-4">
                <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-secondary/10 flex items-center justify-center flex-shrink-0">
                  <Layers className="h-4 w-4 sm:h-5 sm:w-5 text-secondary" />
                </div>
                <h3 className="text-lg sm:text-xl font-semibold">🔧 Use Case & Task</h3>
                {aiSuggestions && (
                  <div className="px-2 py-1 rounded-full bg-accent/20 text-xs text-accent-foreground">
                    AI Suggested
                  </div>
                )}
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
                {/* Use Case Selection */}
                <FormField
                  control={form.control}
                  name="use_case"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium">📋 Use Case</FormLabel>
                      <Select 
                        onValueChange={(value) => {
                          field.onChange(value);
                          setSelectedUseCase(value);
                          setSelectedTask(undefined);
                          form.setValue('task', '');
                          markFieldAsUserOverride('use_case');
                        }}
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger className="border-2 border-primary/20 rounded-xl h-12">
                            <SelectValue placeholder="Select use case..." />
                          </SelectTrigger>
                        </FormControl>
                         <SelectContent>
                           <SelectItem value="none">None (General)</SelectItem>
                           {USE_CASES.map((useCase) => (
                            <SelectItem key={useCase.id} value={useCase.id}>
                              {useCase.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Task Selection */}
                <FormField
                  control={form.control}
                  name="task"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium">⚡ Task</FormLabel>
                      <Select 
                        onValueChange={(value) => {
                          field.onChange(value);
                          setSelectedTask(value);
                          markFieldAsUserOverride('task');
                        }}
                        value={field.value}
                        disabled={!selectedUseCase}
                      >
                        <FormControl>
                          <SelectTrigger className="border-2 border-primary/20 rounded-xl h-12">
                            <SelectValue placeholder={selectedUseCase ? "Select task..." : "Select use case first"} />
                          </SelectTrigger>
                        </FormControl>
                         <SelectContent>
                           <SelectItem value="none">None (General)</SelectItem>
                           {tasks.map((task) => (
                            <SelectItem key={task.id} value={task.id}>
                              {task.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Domain Selection */}
                <FormField
                  control={form.control}
                  name="domain"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium">🏢 Domain</FormLabel>
                       <Select onValueChange={(value) => {
                         field.onChange(value);
                         markFieldAsUserOverride('domain');
                       }} value={field.value}>
                        <FormControl>
                          <SelectTrigger className="border-2 border-primary/20 rounded-xl h-12">
                            <SelectValue placeholder="Select domain..." />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {DOMAINS.map((domain) => (
                            <SelectItem key={domain.id} value={domain.id}>
                              {domain.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Dynamic Fields */}
              {dynamicFields.length > 0 && (
                <div className="space-y-4 pt-4 border-t border-border/20">
                  <h4 className="text-base font-medium text-foreground">📝 Task-Specific Details</h4>
                  <div className="grid gap-4">
                    {dynamicFields.map((field) => (
                      <div key={field.id}>
                        {field.type === 'text' && (
                          <FormField
                            control={form.control}
                            name={`dynamic_fields.${field.id}`}
                            render={({ field: formField }) => (
                              <FormItem>
                                <FormLabel className="text-sm font-medium">
                                  {field.label} {field.required && <span className="text-destructive">*</span>}
                                </FormLabel>
                                <FormControl>
                                  <Input
                                    placeholder={field.placeholder}
                                    className="border-2 border-primary/20 rounded-xl h-12"
                                    {...formField}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        )}

                        {field.type === 'textarea' && (
                          <FormField
                            control={form.control}
                            name={`dynamic_fields.${field.id}`}
                            render={({ field: formField }) => (
                              <FormItem>
                                <FormLabel className="text-sm font-medium">
                                  {field.label} {field.required && <span className="text-destructive">*</span>}
                                </FormLabel>
                                <FormControl>
                                  <Textarea
                                    placeholder={field.placeholder}
                                    className="border-2 border-primary/20 rounded-xl min-h-[80px]"
                                    {...formField}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        )}

                        {field.type === 'number' && (
                          <FormField
                            control={form.control}
                            name={`dynamic_fields.${field.id}`}
                            render={({ field: formField }) => (
                              <FormItem>
                                <FormLabel className="text-sm font-medium">
                                  {field.label} {field.required && <span className="text-destructive">*</span>}
                                </FormLabel>
                                <FormControl>
                                  <Input
                                    type="number"
                                    min={field.min}
                                    max={field.max}
                                    placeholder={field.placeholder}
                                    className="border-2 border-primary/20 rounded-xl h-12"
                                    {...formField}
                                    onChange={(e) => formField.onChange(Number(e.target.value))}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        )}

                        {field.type === 'checkbox' && (
                          <FormField
                            control={form.control}
                            name={`dynamic_fields.${field.id}`}
                            render={({ field: formField }) => (
                              <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                                <FormControl>
                                  <Checkbox
                                    checked={formField.value}
                                    onCheckedChange={formField.onChange}
                                  />
                                </FormControl>
                                <div className="space-y-1 leading-none">
                                  <FormLabel className="text-sm font-medium">
                                    {field.label} {field.required && <span className="text-destructive">*</span>}
                                  </FormLabel>
                                </div>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        )}

                        {field.type === 'select' && (
                          <FormField
                            control={form.control}
                            name={`dynamic_fields.${field.id}`}
                            render={({ field: formField }) => (
                              <FormItem>
                                <FormLabel className="text-sm font-medium">
                                  {field.label} {field.required && <span className="text-destructive">*</span>}
                                </FormLabel>
                                <Select onValueChange={formField.onChange} value={formField.value}>
                                  <FormControl>
                                    <SelectTrigger className="border-2 border-primary/20 rounded-xl h-12">
                                      <SelectValue placeholder={field.placeholder || "Select option..."} />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    {field.options?.map((option) => (
                                      <SelectItem key={option} value={option}>
                                        {option}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        )}

                        {field.type === 'multiselect' && (
                          <FormField
                            control={form.control}
                            name={`dynamic_fields.${field.id}`}
                            render={({ field: formField }) => (
                              <FormItem>
                                <FormLabel className="text-sm font-medium">
                                  {field.label} {field.required && <span className="text-destructive">*</span>}
                                </FormLabel>
                                <FormControl>
                                  <Input
                                    placeholder={field.placeholder || "Enter comma-separated values..."}
                                    className="border-2 border-primary/20 rounded-xl h-12"
                                    {...formField}
                                  />
                                </FormControl>
                                <FormDescription className="text-xs">
                                  Enter multiple values separated by commas
                                </FormDescription>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Target Model Selection */}
            <div className="space-y-4 sm:space-y-6 p-4 sm:p-6 rounded-xl bg-gradient-surface border border-border/50">
              <div className="flex items-center gap-3 sm:gap-4">
                <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <Zap className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
                </div>
                <h3 className="text-lg sm:text-xl font-semibold">🎯 Target Model</h3>
              </div>
              
              <FormField
                control={form.control}
                name="targetModel"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-base sm:text-lg font-medium">Optimize For</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger className="border-2 border-primary/20 rounded-xl h-12 sm:h-14 text-sm sm:text-base">
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
                    <FormDescription className="text-sm sm:text-base">
                      We'll optimize your prompt for this model's best practices using OpenAI
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>


            {/* Manufacturing Specs */}
            <Collapsible open={specsOpen} onOpenChange={setSpecsOpen}>
              <div className="space-y-4 p-4 sm:p-6 rounded-xl bg-gradient-surface border border-border/50">
                <CollapsibleTrigger asChild>
                  <button 
                    type="button"
                    className="w-full flex items-center justify-between gap-3 text-left focus:outline-none focus:ring-2 focus:ring-primary/20 rounded-lg p-2 -m-2"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-accent/10 flex items-center justify-center">
                        <Target className="h-4 w-4 text-accent" />
                      </div>
                      <h3 className="text-lg font-semibold">🎯 Manufacturing Specs</h3>
                      {aiSuggestions && (
                        <div className="px-2 py-1 rounded-full bg-accent/20 text-xs text-accent-foreground">
                          AI Suggested
                        </div>
                      )}
                    </div>
                    {isMobile && (
                      <div className="flex-shrink-0">
                        {specsOpen ? (
                          <ChevronUp className="h-5 w-5 text-muted-foreground" />
                        ) : (
                          <ChevronDown className="h-5 w-5 text-muted-foreground" />
                        )}
                      </div>
                    )}
                  </button>
                </CollapsibleTrigger>
                
                <CollapsibleContent className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                    <FormField
                      control={form.control}
                      name="tone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-sm font-medium">🎭 Tone</FormLabel>
                          <Select onValueChange={(value) => {
                            field.onChange(value);
                            markFieldAsUserOverride('tone');
                          }} value={field.value}>
                            <FormControl>
                              <SelectTrigger className="border-2 border-primary/20 rounded-xl h-12">
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
                          <Select onValueChange={(value) => {
                            field.onChange(value);
                            markFieldAsUserOverride('style');
                           }} value={field.value}>
                            <FormControl>
                              <SelectTrigger className="border-2 border-primary/20 rounded-xl h-12">
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
                              className="border-2 border-primary/20 rounded-xl h-12"
                              {...field}
                              onChange={(e) => {
                                field.onChange(e);
                                markFieldAsUserOverride('format_requirements');
                              }}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                      <FormField
                        control={form.control}
                        name="hard_constraints"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-sm font-medium">⚠️ Hard Constraints</FormLabel>
                            <FormControl>
                              <Input 
                                placeholder="Must include..."
                                className="border-2 border-primary/20 rounded-xl h-12"
                                {...field}
                                onChange={(e) => {
                                  field.onChange(e);
                                  markFieldAsUserOverride('hard_constraints');
                                }}
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
                                className="border-2 border-primary/20 rounded-xl h-12"
                                {...field} 
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>
                </CollapsibleContent>
              </div>
            </Collapsible>

            {/* Factory Settings */}
            <Collapsible open={settingsOpen} onOpenChange={setSettingsOpen}>
              <div className="space-y-4 p-4 sm:p-6 rounded-xl bg-gradient-surface border border-border/50">
                <CollapsibleTrigger asChild>
                  <button 
                    type="button"
                    className="w-full flex items-center justify-between gap-3 text-left focus:outline-none focus:ring-2 focus:ring-primary/20 rounded-lg p-2 -m-2"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-success/10 flex items-center justify-center">
                        <Sliders className="h-4 w-4 text-success" />
                      </div>
                      <h3 className="text-lg font-semibold">⚙️ Factory Settings</h3>
                    </div>
                    {isMobile && (
                      <div className="flex-shrink-0">
                        {settingsOpen ? (
                          <ChevronUp className="h-5 w-5 text-muted-foreground" />
                        ) : (
                          <ChevronDown className="h-5 w-5 text-muted-foreground" />
                        )}
                      </div>
                    )}
                  </button>
                </CollapsibleTrigger>

                <CollapsibleContent className="space-y-4">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
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
                                 onValueChange={(vals) => {
                                   field.onChange(vals[0]);
                                   markFieldAsUserOverride('focusLevel');
                                 }}
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
                            <Select onValueChange={(value) => {
                              field.onChange(value);
                              markFieldAsUserOverride('thinkingDepth');
                            }} value={field.value}>
                              <FormControl>
                                <SelectTrigger className="border-2 border-primary/20 rounded-xl h-12">
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
                            <Select onValueChange={field.onChange} value={field.value}>
                              <FormControl>
                                <SelectTrigger className="border-2 border-primary/20 rounded-xl h-12">
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
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 mt-6">
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
                               checked={!!field.value}
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
                                 checked={!!field.value}
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
                              checked={!!field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  </div>
                </CollapsibleContent>
              </div>
            </Collapsible>

            <div className="pt-6 sm:pt-8 border-t border-border/30">
              <Button 
                type="submit" 
                className="w-full bg-gradient-fun hover:scale-105 shadow-fun border-0 text-white font-semibold text-lg sm:text-xl h-12 sm:h-16 rounded-xl sm:rounded-2xl transition-all duration-300" 
                disabled={isLoading}
                size="lg"
              >
                {isLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 sm:h-6 sm:w-6 border-b-2 border-white mr-2" />
                    🏭 Manufacturing Magic...
                  </>
                ) : (
                  <>
                    <Play className="mr-2 h-5 w-5 sm:h-6 sm:w-6" />
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