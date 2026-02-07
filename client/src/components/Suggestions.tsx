import { useMemo } from 'react';
import { Lightbulb, AlertTriangle, ArrowUp, ArrowRight, ArrowDown } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { Suggestion } from '@/lib/api';

interface SuggestionsProps {
  suggestions: Suggestion[];
  roleMismatch: boolean;
  roleMismatchReason?: string;
}

export function Suggestions({ suggestions, roleMismatch, roleMismatchReason }: SuggestionsProps) {
  const sortedSuggestions = useMemo(() => {
    const priorityOrder = { high: 0, medium: 1, low: 2 };
    return [...suggestions].sort(
      (a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]
    );
  }, [suggestions]);

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'high':
        return <ArrowUp className="h-4 w-4 text-red-500" />;
      case 'medium':
        return <ArrowRight className="h-4 w-4 text-yellow-500" />;
      default:
        return <ArrowDown className="h-4 w-4 text-green-500" />;
    }
  };

  const getPriorityStyles = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'border-l-red-500 bg-red-500/5';
      case 'medium':
        return 'border-l-yellow-500 bg-yellow-500/5';
      default:
        return 'border-l-green-500 bg-green-500/5';
    }
  };

  return (
    <Card className="animate-fade-in-up stagger-3">
      <CardHeader>
        <CardTitle className="text-xl flex items-center gap-2">
          <Lightbulb className="h-5 w-5 text-primary" />
          Improvement Suggestions
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Role Mismatch Warning */}
        {roleMismatch && (
          <div className="flex items-start gap-3 p-4 rounded-lg bg-destructive/10 border border-destructive/20">
            <AlertTriangle className="h-5 w-5 text-destructive mt-0.5" />
            <div>
              <p className="font-medium text-destructive">Role Mismatch Detected</p>
              <p className="text-sm text-muted-foreground mt-1">
                {roleMismatchReason || 'Your background may not align well with this role. Consider whether this is the right fit.'}
              </p>
            </div>
          </div>
        )}

        {/* Suggestions List */}
        {sortedSuggestions.length > 0 ? (
          <div className="space-y-3">
            {sortedSuggestions.map((suggestion, index) => (
              <div
                key={index}
                className={`p-4 rounded-lg border-l-4 ${getPriorityStyles(suggestion.priority)}`}
              >
                <div className="flex items-center gap-2 mb-1">
                  {getPriorityIcon(suggestion.priority)}
                  <span className="text-sm font-medium capitalize">
                    {suggestion.section}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    ({suggestion.priority} priority)
                  </span>
                </div>
                <p className="text-sm text-muted-foreground pl-6">
                  {suggestion.suggestion}
                </p>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground text-center py-4">
            No specific suggestions. Your resume looks well-aligned with this role!
          </p>
        )}
      </CardContent>
    </Card>
  );
}
