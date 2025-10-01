import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Sparkles, Plus } from 'lucide-react';
import { toast } from 'sonner';

interface Suggestion {
  title: string;
  priority: 'low' | 'medium' | 'high';
  category: string;
}

interface AISuggestionsProps {
  onAddTask: (task: { title: string; priority: string; category: string }) => void;
}

export const AISuggestions = ({ onAddTask }: AISuggestionsProps) => {
  const [context, setContext] = useState('');
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [loading, setLoading] = useState(false);

  const handleGetSuggestions = async () => {
    if (!context.trim()) {
      toast.error('Please provide some context');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/ai-suggest-tasks`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
          },
          body: JSON.stringify({ context }),
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to get suggestions');
      }

      const data = await response.json();
      setSuggestions(data.suggestions);
      toast.success('AI suggestions generated!');
    } catch (error) {
      console.error('Error:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to get suggestions');
    } finally {
      setLoading(false);
    }
  };

  const handleAddSuggestion = (suggestion: Suggestion) => {
    onAddTask(suggestion);
    toast.success('Task added!');
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-accent" />
          AI Task Suggestions
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Textarea
            placeholder="Describe what you need to do... (e.g., 'I have a project deadline next week and need to prepare a presentation')"
            value={context}
            onChange={(e) => setContext(e.target.value)}
            rows={3}
          />
          <Button
            onClick={handleGetSuggestions}
            disabled={loading}
            className="w-full gap-2"
          >
            <Sparkles className="h-4 w-4" />
            {loading ? 'Generating...' : 'Get AI Suggestions'}
          </Button>
        </div>

        {suggestions.length > 0 && (
          <div className="space-y-2">
            <p className="text-sm font-medium">Suggested Tasks:</p>
            {suggestions.map((suggestion, index) => (
              <div
                key={index}
                className="p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1">
                    <p className="font-medium text-sm">{suggestion.title}</p>
                    <div className="flex gap-2 mt-1">
                      <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary">
                        {suggestion.priority}
                      </span>
                      <span className="text-xs px-2 py-0.5 rounded-full bg-secondary/50">
                        {suggestion.category}
                      </span>
                    </div>
                  </div>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleAddSuggestion(suggestion)}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
