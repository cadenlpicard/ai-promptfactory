import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Button } from '@/components/ui/button';
import { ChevronDown, ChevronUp, Eye, Copy } from 'lucide-react';
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';

interface MetaPromptPreviewProps {
  metaPrompt?: string;
  isVisible?: boolean;
}

export function MetaPromptPreview({ metaPrompt, isVisible = true }: MetaPromptPreviewProps) {
  const [isOpen, setIsOpen] = useState(false);
  const { toast } = useToast();
  
  if (!metaPrompt || !isVisible) {
    return null;
  }

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(metaPrompt);
      toast({
        title: "Copied to clipboard",
        description: "Meta-prompt has been copied to your clipboard",
      });
    } catch (error) {
      toast({
        title: "Copy failed", 
        description: "Could not copy to clipboard",
        variant: "destructive",
      });
    }
  };

  return (
    <Card className="border-2 border-accent/20 shadow-card">
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CollapsibleTrigger asChild>
          <CardHeader className="pb-3 cursor-pointer hover:bg-accent/5 transition-colors">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-accent/10 flex items-center justify-center">
                  <Eye className="h-4 w-4 text-accent" />
                </div>
                <div>
                  <CardTitle className="text-lg">🔍 Meta-Prompt Preview</CardTitle>
                  <p className="text-sm text-muted-foreground">
                    See how your inputs were composed into the final prompt
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {isOpen && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleCopy();
                    }}
                    className="h-8 w-8 p-0"
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                )}
                {isOpen ? (
                  <ChevronUp className="h-5 w-5 text-muted-foreground" />
                ) : (
                  <ChevronDown className="h-5 w-5 text-muted-foreground" />
                )}
              </div>
            </div>
          </CardHeader>
        </CollapsibleTrigger>
        
        <CollapsibleContent>
          <CardContent className="pt-0">
            <div className="bg-muted/50 rounded-lg p-4 space-y-2">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-medium text-muted-foreground">
                  Composed Meta-Prompt
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleCopy}
                  className="h-7 text-xs"
                >
                  <Copy className="h-3 w-3 mr-1" />
                  Copy
                </Button>
              </div>
              <pre className="text-xs whitespace-pre-wrap font-mono text-foreground bg-background rounded border p-3">
                {metaPrompt}
              </pre>
            </div>
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
}