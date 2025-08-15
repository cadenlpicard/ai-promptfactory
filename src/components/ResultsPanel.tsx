import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { OptimizedResponse } from '@/types';
import { Copy, Download, CheckCircle, AlertCircle, Lightbulb, FileText } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface ResultsPanelProps {
  response: OptimizedResponse | null;
  isLoading?: boolean;
}

export function ResultsPanel({ response, isLoading }: ResultsPanelProps) {
  const [copiedSection, setCopiedSection] = useState<string | null>(null);
  const { toast } = useToast();

  const copyToClipboard = async (text: string, section: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedSection(section);
      toast({
        title: "Copied!",
        description: `${section} copied to clipboard`,
      });
      setTimeout(() => setCopiedSection(null), 2000);
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to copy to clipboard",
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
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-success" />
            Optimized Prompt
          </CardTitle>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => copyToClipboard(response.optimizedPrompt || response.optimized_prompt, "Optimized Prompt")}
              className="border-border/50"
            >
              {copiedSection === "Optimized Prompt" ? (
                <CheckCircle className="h-4 w-4" />
              ) : (
                <Copy className="h-4 w-4" />
              )}
              Copy
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={downloadPrompt}
              className="border-border/50"
            >
              <Download className="h-4 w-4" />
              Download
            </Button>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="max-h-[calc(100vh-8rem)] overflow-y-auto">
        <div className="mt-4 space-y-4">
          <div className="relative">
            <Textarea
              value={response.optimizedPrompt || response.optimized_prompt}
              readOnly
              className="min-h-[400px] bg-background/50 border-border/50 resize-none text-sm leading-relaxed"
            />
            <Button
              variant="ghost"
              size="sm"
              onClick={() => copyToClipboard(response.optimizedPrompt || response.optimized_prompt, "Optimized Prompt")}
              className="absolute top-2 right-2 opacity-70 hover:opacity-100"
            >
              {copiedSection === "Optimized Prompt" ? (
                <CheckCircle className="h-4 w-4" />
              ) : (
                <Copy className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}