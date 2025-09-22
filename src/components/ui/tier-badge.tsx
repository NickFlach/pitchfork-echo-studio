import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Sparkles, Lock, Zap, Crown } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { TierLevel } from '@/contexts/TierContext';

interface TierBadgeProps {
  tier: TierLevel;
  feature?: string;
  tooltip?: string;
  className?: string;
  variant?: 'default' | 'enhanced' | 'locked' | 'premium';
  size?: 'sm' | 'md' | 'lg';
}

export const TierBadge: React.FC<TierBadgeProps> = ({
  tier,
  feature,
  tooltip,
  className,
  variant = 'default',
  size = 'md'
}) => {
  const getVariantStyles = () => {
    switch (variant) {
      case 'enhanced':
        return 'bg-gradient-to-r from-purple-500/20 to-blue-500/20 text-purple-700 dark:text-purple-300 border-purple-300/50 hover:from-purple-500/30 hover:to-blue-500/30';
      case 'locked':
        return 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 border-gray-300 dark:border-gray-600';
      case 'premium':
        return 'bg-gradient-to-r from-yellow-500/20 to-orange-500/20 text-yellow-700 dark:text-yellow-300 border-yellow-300/50 hover:from-yellow-500/30 hover:to-orange-500/30';
      default:
        return 'bg-gray-50 dark:bg-gray-900 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-700';
    }
  };

  const getIcon = () => {
    switch (variant) {
      case 'enhanced':
        return <Sparkles className={cn('w-3 h-3', size === 'lg' && 'w-4 h-4')} />;
      case 'locked':
        return <Lock className={cn('w-3 h-3', size === 'lg' && 'w-4 h-4')} />;
      case 'premium':
        return <Crown className={cn('w-3 h-3', size === 'lg' && 'w-4 h-4')} />;
      default:
        return <Zap className={cn('w-3 h-3', size === 'lg' && 'w-4 h-4')} />;
    }
  };

  const getText = () => {
    switch (variant) {
      case 'enhanced':
        return tier === 'ai_enhanced' ? 'AI Enhanced' : 'AI Available';
      case 'locked':
        return 'AI Locked';
      case 'premium':
        return 'Premium';
      default:
        return tier === 'ai_enhanced' ? 'Enhanced' : 'Standard';
    }
  };

  const badge = (
    <Badge
      variant="secondary"
      className={cn(
        'flex items-center gap-1 transition-all duration-200',
        getVariantStyles(),
        size === 'sm' && 'text-xs px-2 py-0.5',
        size === 'lg' && 'text-sm px-3 py-1',
        className
      )}
      data-testid={`badge-tier-${variant}-${feature || 'general'}`}
    >
      {getIcon()}
      {getText()}
    </Badge>
  );

  if (tooltip) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            {badge}
          </TooltipTrigger>
          <TooltipContent>
            <p className="max-w-xs">{tooltip}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  return badge;
};