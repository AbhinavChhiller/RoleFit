import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import type { ScoreBreakdown } from '@/lib/api';

interface ScoreCardProps {
  score: ScoreBreakdown;
}

export function ScoreCard({ score }: ScoreCardProps) {
  const { overallScore, skillsScore, experienceScore, roleContextScore, explanation } = score;
  
  // Calculate score color
  const scoreColor = useMemo(() => {
    if (overallScore >= 80) return 'text-green-500';
    if (overallScore >= 60) return 'text-yellow-500';
    if (overallScore >= 40) return 'text-orange-500';
    return 'text-red-500';
  }, [overallScore]);

  const strokeColor = useMemo(() => {
    if (overallScore >= 80) return '#22c55e';
    if (overallScore >= 60) return '#eab308';
    if (overallScore >= 40) return '#f97316';
    return '#ef4444';
  }, [overallScore]);
  
  // SVG circle properties
  const radius = 45;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (overallScore / 100) * circumference;

  return (
    <Card className="animate-fade-in-up">
      <CardHeader>
        <CardTitle className="text-xl">Match Score</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Circular Score Display */}
        <div className="flex justify-center">
          <div className="relative w-32 h-32">
            <svg className="w-32 h-32 transform -rotate-90">
              {/* Background circle */}
              <circle
                cx="64"
                cy="64"
                r={radius}
                stroke="currentColor"
                strokeWidth="8"
                fill="none"
                className="text-muted"
              />
              {/* Progress circle */}
              <circle
                cx="64"
                cy="64"
                r={radius}
                stroke={strokeColor}
                strokeWidth="8"
                fill="none"
                strokeLinecap="round"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                className="animate-score-fill transition-all duration-1000"
                style={{
                  '--score-offset': strokeDashoffset,
                } as React.CSSProperties}
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className={`text-3xl font-bold ${scoreColor}`}>
                {overallScore}%
              </span>
            </div>
          </div>
        </div>

        {/* Explanation */}
        <p className="text-sm text-muted-foreground text-center">
          {explanation}
        </p>

        {/* Score Breakdown */}
        <div className="space-y-4">
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Skills Match (50%)</span>
              <span className="font-medium">{skillsScore}%</span>
            </div>
            <Progress value={skillsScore} className="h-2" />
          </div>

          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Experience Alignment (30%)</span>
              <span className="font-medium">{experienceScore}%</span>
            </div>
            <Progress value={experienceScore} className="h-2" />
          </div>

          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Role Context (20%)</span>
              <span className="font-medium">{roleContextScore}%</span>
            </div>
            <Progress value={roleContextScore} className="h-2" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
