import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface DiffusionRateCardProps {
  title: string;
  current: number;
  target: number;
  trend: 'up' | 'down' | 'stable';
}

export const DiffusionRateCard: React.FC<DiffusionRateCardProps> = ({
  title,
  current,
  target,
  trend,
}) => {
  const progress = (current / target) * 100;
  const isAboveTarget = current >= target;
  
  const TrendIcon = trend === 'up' ? TrendingUp : trend === 'down' ? TrendingDown : Minus;
  const trendColor = trend === 'up' ? 'text-green-400' : trend === 'down' ? 'text-red-400' : 'text-yellow-400';

  return (
    <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
      <CardHeader className="pb-2">
        <CardTitle className="text-base flex items-center justify-between">
          {title}
          <TrendIcon className={`h-4 w-4 ${trendColor}`} />
        </CardTitle>
        <CardDescription className="text-xs">
          Target: {target}%
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div className="flex items-baseline gap-2">
            <span className={`text-2xl font-bold ${isAboveTarget ? 'text-green-400' : 'text-foreground'}`}>
              {current}%
            </span>
            {isAboveTarget && (
              <span className="text-xs text-green-400">✓ Target met</span>
            )}
          </div>
          
          <div className="relative">
            <div className="h-2 rounded-full bg-muted overflow-hidden">
              <div 
                className={`h-full rounded-full transition-all duration-500 ${
                  isAboveTarget 
                    ? 'bg-gradient-to-r from-green-500 to-green-400' 
                    : 'bg-gradient-to-r from-primary to-accent'
                }`}
                style={{ width: `${Math.min(progress, 100)}%` }}
              />
            </div>
            {/* Target marker */}
            <div 
              className="absolute top-0 w-0.5 h-2 bg-foreground/50"
              style={{ left: '100%', transform: 'translateX(-100%)' }}
            />
          </div>
          
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>0%</span>
            <span>{target}% target</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
