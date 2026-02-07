import { useMemo } from 'react';
import { CheckCircle2, XCircle, AlertCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { SkillMatch } from '@/lib/api';

interface SkillGapProps {
  skills: SkillMatch[];
}

export function SkillGap({ skills }: SkillGapProps) {
  const { matched, partial, missing } = useMemo(() => {
    const matched: SkillMatch[] = [];
    const partial: SkillMatch[] = [];
    const missing: SkillMatch[] = [];

    for (const skill of skills) {
      if (skill.status === 'matched') matched.push(skill);
      else if (skill.status === 'partial') partial.push(skill);
      else missing.push(skill);
    }

    // Sort by relevance within each category
    const sortByRelevance = (a: SkillMatch, b: SkillMatch) => {
      const order = { high: 0, medium: 1, low: 2 };
      return order[a.relevance] - order[b.relevance];
    };

    return {
      matched: matched.sort(sortByRelevance),
      partial: partial.sort(sortByRelevance),
      missing: missing.sort(sortByRelevance),
    };
  }, [skills]);

  const getRelevanceLabel = (relevance: string) => {
    if (relevance === 'high') return '★';
    if (relevance === 'medium') return '☆';
    return '';
  };

  return (
    <Card className="animate-fade-in-up stagger-2">
      <CardHeader>
        <CardTitle className="text-xl">Skill Analysis</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Matched Skills */}
        {matched.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-sm font-medium text-green-600 dark:text-green-400">
              <CheckCircle2 className="h-4 w-4" />
              <span>Matched Skills ({matched.length})</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {matched.map((skill) => (
                <Badge key={skill.skill} variant="success" className="gap-1">
                  {skill.skill}
                  {getRelevanceLabel(skill.relevance)}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Partial Matches */}
        {partial.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-sm font-medium text-yellow-600 dark:text-yellow-400">
              <AlertCircle className="h-4 w-4" />
              <span>Partial Matches ({partial.length})</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {partial.map((skill) => (
                <Badge key={skill.skill} variant="warning" className="gap-1">
                  {skill.skill}
                  {getRelevanceLabel(skill.relevance)}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Missing Skills */}
        {missing.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-sm font-medium text-red-600 dark:text-red-400">
              <XCircle className="h-4 w-4" />
              <span>Missing Skills ({missing.length})</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {missing.map((skill) => (
                <Badge key={skill.skill} variant="destructive" className="gap-1">
                  {skill.skill}
                  {getRelevanceLabel(skill.relevance)}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Legend */}
        <div className="pt-4 border-t text-xs text-muted-foreground">
          <span className="mr-4">★ High priority</span>
          <span>☆ Medium priority</span>
        </div>
      </CardContent>
    </Card>
  );
}
