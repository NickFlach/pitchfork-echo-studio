import React from 'react';
import { Card, CardContent, CardDescription, CardHeader } from '@/components/ui/card';
import { Scale } from 'lucide-react';

export const DecentralizationScore: React.FC = () => {
  const score = 76;
  
  const getScoreColor = (s: number) => {
    if (s >= 80) return 'text-green-400';
    if (s >= 60) return 'text-yellow-400';
    return 'text-red-400';
  };
  
  const getScoreLabel = (s: number) => {
    if (s >= 80) return 'Excellent';
    if (s >= 60) return 'Good';
    if (s >= 40) return 'Moderate';
    return 'Concerning';
  };

  return (
    <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
      <CardHeader className="pb-2">
        <CardDescription className="flex items-center gap-2">
          <Scale className="h-4 w-4" />
          Decentralization Score
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-baseline gap-2">
          <span className={`text-3xl font-bold ${getScoreColor(score)}`}>
            {score}
          </span>
          <span className="text-muted-foreground">/100</span>
        </div>
        <p className="text-xs text-muted-foreground mt-1">
          {getScoreLabel(score)} - Healthy distribution
        </p>
      </CardContent>
    </Card>
  );
};
