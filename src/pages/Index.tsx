import { useState } from 'react';
import { PromptForm } from '@/components/PromptForm';
import { ResultsPanel } from '@/components/ResultsPanel';
import { FormData, OptimizedResponse } from '@/types';
import { optimizePrompt } from '@/lib/promptOptimizer';
import { Factory, Sparkles, Zap } from 'lucide-react';

const Index = () => {
  const [response, setResponse] = useState<OptimizedResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleOptimize = async (data: FormData) => {
    setIsLoading(true);
    setResponse(null);
    
    try {
      const optimizedResponse = await optimizePrompt(data);
      setResponse(optimizedResponse);
    } catch (error) {
      console.error('Error optimizing prompt:', error);
      // Handle error - could show toast here
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-subtle">
      {/* Header */}
      <header className="border-b border-border/50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-fun flex items-center justify-center shadow-fun transform hover:scale-105 transition-transform duration-200">
              <Factory className="h-7 w-7 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">Prompt Factory</h1>
              <p className="text-sm text-muted-foreground flex items-center gap-1">
                <Zap className="h-3 w-3" />
                Where Raw Prompts Become Refined Gold
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <div className="px-4 py-2 rounded-full bg-gradient-primary border-2 border-primary/20 shadow-glow">
              <span className="text-sm font-semibold text-white">Beta</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-[calc(100vh-7rem)]">
          {/* Left Panel - Form */}
          <div className="flex flex-col">
            <PromptForm onSubmit={handleOptimize} isLoading={isLoading} />
          </div>
          
          {/* Right Panel - Results */}
          <div className="flex flex-col">
            <ResultsPanel response={response} isLoading={isLoading} />
          </div>
        </div>
      </main>
    </div>
  );
};

export default Index;