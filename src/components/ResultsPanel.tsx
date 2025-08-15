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
    <Card className="h-full bg-gradient-surface border border-border/50 sm:border-2 shadow-card">
      <CardHeader className="px-4 py-4 sm:px-6 sm:py-5">
        <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary"></div>
          Optimizing Your Prompt...
        </CardTitle>
      </CardHeader>
      <CardContent className="px-4 py-4 sm:px-6 sm:py-6">
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
    <Card className="h-full bg-gradient-surface border border-border/50 sm:border-2 shadow-card">
      <CardHeader className="px-4 py-4 sm:px-6 sm:py-5">
        <CardTitle className="flex items-center gap-2 text-muted-foreground text-base sm:text-lg">
          <FileText className="h-5 w-5" />
          Optimized Prompt
        </CardTitle>
      </CardHeader>
      <CardContent className="px-4 py-4 sm:px-6 sm:py-6">
        <div className="flex flex-col items-center justify-center h-64 text-center space-y-4">
          <div className="w-16 h-16 rounded-full bg-muted/20 flex items-center justify-center">
            <Lightbulb className="h-8 w-8 text-muted-foreground" />
          </div>
          <div className="space-y-2">
            <h3 className="text-base sm:text-lg font-medium text-foreground">Ready to Optimize</h3>
            <p className="text-sm sm:text-base text-muted-foreground max-w-md">
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
    <Card className="h-full bg-gradient-surface border border-border/50 sm:border-2 shadow-card">
      <CardHeader className="px-4 py-4 sm:px-6 sm:py-5 sticky top-0 z-10 bg-gradient-surface/95 backdrop-blur rounded-t-lg">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
            <CheckCircle className="h-5 w-5 text-success" />
            Optimized Prompt
          </CardTitle>
          <div className="hidden sm:flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => copyToClipboard(response.optimizedPrompt || response.optimized_prompt, "Optimized Prompt")}
              className="border-border/50 h-11"
            >
              {copiedSection === "Optimized Prompt" ? (
                <CheckCircle className="h-4 w-4" />
              ) : (
                <Copy className="h-4 w-4" />
              )}
              <span className="ml-1">Copy</span>
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={downloadPrompt}
              className="border-border/50 h-11"
            >
              <Download className="h-4 w-4" />
              <span className="ml-1">Download</span>
            </Button>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="px-4 py-4 sm:px-6 sm:py-6 space-y-4">
        <div className="relative">
          <Textarea
            value={response.optimizedPrompt || response.optimized_prompt}
            readOnly
            className="min-h-[300px] sm:min-h-[400px] bg-background/50 border-border/50 resize-none text-base leading-relaxed"
          />
          <Button
            variant="ghost"
            size="sm"
            onClick={() => copyToClipboard(response.optimizedPrompt || response.optimized_prompt, "Optimized Prompt")}
            className="absolute top-2 right-2 opacity-70 hover:opacity-100 h-9 w-9"
          >
            {copiedSection === "Optimized Prompt" ? (
              <CheckCircle className="h-4 w-4" />
            ) : (
              <Copy className="h-4 w-4" />
            )}
          </Button>
        </div>

        {/* Copy / Download buttons row on mobile */}
        <div className="sm:hidden grid grid-cols-2 gap-2">
          <Button 
            onClick={() => copyToClipboard(response.optimizedPrompt || response.optimized_prompt, "Optimized Prompt")} 
            className="h-11"
          >
            {copiedSection === "Optimized Prompt" ? (
              <CheckCircle className="h-4 w-4 mr-2" />
            ) : (
              <Copy className="h-4 w-4 mr-2" />
            )}
            Copy
          </Button>
          <Button 
            variant="outline" 
            onClick={downloadPrompt} 
            className="h-11"
          >
            <Download className="h-4 w-4 mr-2" />
            Download
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}