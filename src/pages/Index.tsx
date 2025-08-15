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
    console.log("handleOptimize called with:", data);
    setIsLoading(true);
    setResponse(null);
    
    try {
      console.log("Calling optimizePrompt...");
      const optimizedResponse = await optimizePrompt(data);
      console.log("optimizePrompt completed:", optimizedResponse);
      setResponse(optimizedResponse);
    } catch (error) {
      console.error('Error optimizing prompt:', error);
      // Handle error - could show toast here
    } finally {
      setIsLoading(false);
      console.log("handleOptimize completed");
    }
  };

  return (
    <div className="min-h-screen overflow-x-hidden bg-gradient-subtle">
      {/* Header */}
      <header className="border-b border-border/50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-3 sm:px-4 h-14 sm:h-16 flex items-center justify-between">
          <div className="flex items-center gap-3 sm:gap-3">
            <div className="w-12 h-12 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-gradient-fun flex items-center justify-center shadow-fun transform hover:scale-105 transition-transform duration-200">
              <Factory className="h-6 w-6 sm:h-7 sm:w-7 text-white" />
            </div>
            <div className="min-w-0 flex-1">
              <h1 className="text-xl sm:text-2xl font-bold text-foreground truncate">Prompt Factory</h1>
              <p className="text-sm sm:text-sm text-muted-foreground flex items-center gap-1 truncate">
                <Zap className="h-3 w-3 flex-shrink-0" />
                <span className="hidden sm:inline">Where Raw Prompts Become Refined Gold</span>
                <span className="sm:hidden">Transform Your Prompts</span>
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-2 flex-shrink-0">
            <div className="px-3 sm:px-4 py-2 sm:py-2 rounded-full bg-gradient-primary border-2 border-primary/20 shadow-glow">
              <span className="text-sm sm:text-sm font-semibold text-white">Beta</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-3 sm:px-4 py-4 sm:py-6">
        <div className="flex flex-col lg:grid lg:grid-cols-2 gap-4 sm:gap-6 min-h-[calc(100vh-7rem)]">
          {/* Form Panel - Full width on mobile */}
          <div className="flex flex-col order-1 lg:order-1">
            <PromptForm onSubmit={handleOptimize} isLoading={isLoading} />
          </div>
          
          {/* Results Panel - Full width on mobile */}
          <div className="flex flex-col order-2 lg:order-2">
            <ResultsPanel response={response} isLoading={isLoading} />
          </div>
        </div>
      </main>
    </div>
  );
};

export default Index;