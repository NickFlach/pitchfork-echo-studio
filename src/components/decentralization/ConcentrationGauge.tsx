import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface ConcentrationGaugeProps {
  label: string;
  value: number;
  maxValue: number;
  description: string;
  status: 'healthy' | 'moderate' | 'concerning';
}

export const ConcentrationGauge: React.FC<ConcentrationGaugeProps> = ({
  label,
  value,
  maxValue,
  description,
  status,
}) => {
  const percentage = (value / maxValue) * 100;
  
  const statusColors = {
    healthy: 'from-green-500 to-green-400',
    moderate: 'from-yellow-500 to-yellow-400',
    concerning: 'from-red-500 to-red-400',
  };
  
  const statusBg = {
    healthy: 'bg-green-500/10 border-green-500/30',
    moderate: 'bg-yellow-500/10 border-yellow-500/30',
    concerning: 'bg-red-500/10 border-red-500/30',
  };
  
  const statusText = {
    healthy: 'text-green-400',
    moderate: 'text-yellow-400',
    concerning: 'text-red-400',
  };

  return (
    <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
      <CardHeader className="pb-3">
        <CardTitle className="text-base">{label}</CardTitle>
        <CardDescription className="text-xs">{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="relative pt-4">
          {/* Gauge background */}
          <div className="h-4 rounded-full bg-muted overflow-hidden">
            <div 
              className={`h-full rounded-full bg-gradient-to-r ${statusColors[status]} transition-all duration-500`}
              style={{ width: `${Math.min(percentage, 100)}%` }}
            />
          </div>
          
          {/* Value display */}
          <div className="mt-4 flex items-center justify-between">
            <div className={`text-2xl font-bold ${statusText[status]}`}>
              {typeof value === 'number' && value < 1 ? value.toFixed(2) : value}
            </div>
            <div className={`px-2 py-1 rounded text-xs font-medium border ${statusBg[status]} ${statusText[status]}`}>
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </div>
          </div>
          
          {/* Scale markers */}
          <div className="flex justify-between mt-2 text-xs text-muted-foreground">
            <span>0</span>
            <span>{maxValue}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
