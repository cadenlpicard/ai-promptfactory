import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { OptimizedResponse } from '@/types';
import { Copy, Download, CheckCircle, AlertCircle, Lightbulb, FileText } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useIsMobile } from '@/hooks/use-mobile';

interface ResultsPanelProps {
  response: OptimizedResponse | null;
  isLoading?: boolean;
}

export function ResultsPanel({ response, isLoading }: ResultsPanelProps) {
  const [copiedSection, setCopiedSection] = useState<string | null>(null);
  const { toast } = useToast();
  const isMobile = useIsMobile();

  const copyToClipboard = async (text: string, section: string) => {
    console.log('Attempting to copy:', { text: text?.substring(0, 50), section, hasText: !!text });
    
    if (!text || text.trim() === '') {
      toast({
        title: "Error",
        description: "No content to copy",
        variant: "destructive",
      });
      return;
    }

    // Always use the fallback method for better compatibility
    try {
      const textArea = document.createElement('textarea');
      textArea.value = text;
      textArea.style.position = 'fixed';
      textArea.style.left = '-999999px';
      textArea.style.top = '-999999px';
      textArea.style.opacity = '0';
      textArea.style.pointerEvents = 'none';
      textArea.setAttribute('readonly', '');
      document.body.appendChild(textArea);
      
      // Focus and select the text
      textArea.focus();
      textArea.select();
      textArea.setSelectionRange(0, text.length);
      
      // Try to copy
      const successful = document.execCommand('copy');
      document.body.removeChild(textArea);
      
      if (successful) {
        console.log('Copy successful using fallback method');
        setCopiedSection(section);
        toast({
          title: "Copied!",
          description: `${section} copied to clipboard`,
        });
        setTimeout(() => setCopiedSection(null), 2000);
      } else {
        throw new Error('execCommand copy failed');
      }
    } catch (err) {
      console.error('Copy failed:', err);
      // Show a modal with the text to copy manually
      const copyText = `Please copy this text manually:\n\n${text}`;
      if (window.confirm('Automatic copy failed. Click OK to see the text in an alert where you can copy it manually.')) {
        prompt('Copy this text:', text);
      }
      toast({
        title: "Copy Failed", 
        description: "Please copy the text manually from the dialog",
        variant: "destructive",
      });
    }
  };

  const downloadPrompt = () => {
    if (!response) return;
    
    const content = response.optimizedPrompt || response.optimized_prompt;
    const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
    
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `optimized-prompt-${timestamp}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast({
      title: "Downloaded!",
      description: "Optimized prompt saved as text file",
    });
  };

  if (isLoading) {
    return (
      <Card className="h-full bg-gradient-surface border-border/50 shadow-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary"></div>
            Optimizing Your Prompt...
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="h-4 bg-muted/30 rounded animate-pulse" />
            <div className="h-4 bg-muted/30 rounded animate-pulse w-3/4" />
            <div className="h-4 bg-muted/30 rounded animate-pulse w-1/2" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!response) {
    return (
      <Card className="h-full bg-gradient-surface border-border/50 shadow-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-muted-foreground">
            <FileText className="h-5 w-5" />
            Optimized Prompt
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center h-64 text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-muted/20 flex items-center justify-center">
              <Lightbulb className="h-8 w-8 text-muted-foreground" />
            </div>
            <div className="space-y-2">
              <h3 className="text-lg font-medium text-foreground">Ready to Optimize</h3>
              <p className="text-muted-foreground max-w-md">
                Configure your prompt settings and click "Optimize Prompt" to get an enhanced version
                tailored for your chosen AI model.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="h-full bg-gradient-surface border-border/50 shadow-card">
      <CardHeader className="pb-3 sm:pb-4 px-4 py-4 sm:px-6 sm:py-6">
        <div className="flex items-center justify-between gap-2 sm:gap-4">
          <CardTitle className="flex items-center gap-2 sm:gap-3 text-lg sm:text-xl">
            <CheckCircle className="h-5 w-5 sm:h-6 sm:w-6 text-success flex-shrink-0" />
            <span className="truncate">{isMobile ? 'Results' : 'Optimized Prompt'}</span>
          </CardTitle>
          <div className="flex gap-1 sm:gap-2 flex-shrink-0">
            <Button
              variant="outline"
              size="sm"
              onClick={() => copyToClipboard(response.optimizedPrompt || response.optimized_prompt, "Optimized Prompt")}
              className="border-border/50 text-xs sm:text-sm h-9 sm:h-12 px-3 sm:px-4 touch-target"
            >
              {copiedSection === "Optimized Prompt" ? (
                <CheckCircle className="h-4 w-4 sm:h-5 sm:w-5" />
              ) : (
                <Copy className="h-4 w-4 sm:h-5 sm:w-5" />
              )}
              {!isMobile && <span className="ml-1 sm:ml-2">Copy</span>}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={downloadPrompt}
              className="border-border/50 text-xs sm:text-sm h-9 sm:h-12 px-3 sm:px-4 touch-target"
            >
              <Download className="h-4 w-4 sm:h-5 sm:w-5" />
              {!isMobile && <span className="ml-1 sm:ml-2">Download</span>}
            </Button>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="max-h-[calc(100vh-8rem)] sm:max-h-[calc(100vh-10rem)] overflow-y-auto p-4 sm:p-6 mobile-scroll">
        <Tabs defaultValue="optimized" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-4">
            <TabsTrigger value="optimized" className="text-xs sm:text-sm">Optimized Prompt</TabsTrigger>
            <TabsTrigger value="meta" className="text-xs sm:text-sm">Meta Prompt</TabsTrigger>
          </TabsList>
          
          <TabsContent value="optimized" className="mt-4">
            <div className="relative">
              <Textarea
                value={response.optimizedPrompt || response.optimized_prompt}
                readOnly
                className="min-h-[300px] sm:min-h-[500px] bg-background/50 border-border/50 resize-none text-sm sm:text-base leading-relaxed p-3 sm:p-4"
              />
              <Button
                variant="ghost"
                size="sm"
                onClick={() => copyToClipboard(response.optimizedPrompt || response.optimized_prompt, "Optimized Prompt")}
                className="absolute top-2 right-2 sm:top-3 sm:right-3 opacity-70 hover:opacity-100 h-8 w-8 sm:h-10 sm:w-10 touch-target"
              >
                {copiedSection === "Optimized Prompt" ? (
                  <CheckCircle className="h-4 w-4 sm:h-5 sm:w-5" />
                ) : (
                  <Copy className="h-4 w-4 sm:h-5 sm:w-5" />
                )}
              </Button>
            </div>
          </TabsContent>
          
          <TabsContent value="meta" className="mt-4">
            <div className="relative">
              <Textarea
                value={response.meta_prompt || "No meta prompt available"}
                readOnly
                className="min-h-[300px] sm:min-h-[500px] bg-background/50 border-border/50 resize-none text-sm sm:text-base leading-relaxed p-3 sm:p-4 font-mono"
              />
              <Button
                variant="ghost"
                size="sm"
                onClick={() => copyToClipboard(response.meta_prompt || "", "Meta Prompt")}
                className="absolute top-2 right-2 sm:top-3 sm:right-3 opacity-70 hover:opacity-100 h-8 w-8 sm:h-10 sm:w-10 touch-target"
              >
                {copiedSection === "Meta Prompt" ? (
                  <CheckCircle className="h-4 w-4 sm:h-5 sm:w-5" />
                ) : (
                  <Copy className="h-4 w-4 sm:h-5 sm:w-5" />
                )}
              </Button>
            </div>
            <div className="mt-3 p-3 bg-muted/30 rounded-lg">
              <p className="text-xs sm:text-sm text-muted-foreground">
                💡 This meta prompt contains the role, specifications, and context. Copy this to use as a system message or initial prompt in other AI tools.
              </p>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}