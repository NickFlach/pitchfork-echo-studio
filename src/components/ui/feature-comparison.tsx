import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { CheckCircle, X, Sparkles, Zap, ArrowRight, Lock } from 'lucide-react';
import { cn } from '@/lib/utils';
import { TierBadge } from './tier-badge';
import type { TierFeature, TierLevel } from '@/contexts/TierContext';

interface FeatureComparisonProps {
  feature: TierFeature;
  currentTier: TierLevel;
  onUpgrade?: () => void;
  className?: string;
  compact?: boolean;
}

export const FeatureComparison: React.FC<FeatureComparisonProps> = ({
  feature,
  currentTier,
  onUpgrade,
  className,
  compact = false
}) => {
  const isAIEnhanced = currentTier === 'ai_enhanced';

  return (
    <Card className={cn('w-full', className)} data-testid={`card-feature-comparison-${feature.id}`}>
      <CardHeader className={cn('pb-4', compact && 'pb-2')}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CardTitle className={cn('text-lg', compact && 'text-base')}>{feature.name}</CardTitle>
            <TierBadge
              tier={currentTier}
              feature={feature.id}
              variant={isAIEnhanced ? 'enhanced' : 'default'}
              size="sm"
            />
          </div>
          {!isAIEnhanced && onUpgrade && (
            <Button
              variant="outline"
              size="sm"
              onClick={onUpgrade}
              className="ml-2"
              data-testid={`button-upgrade-${feature.id}`}
            >
              <Sparkles className="w-4 h-4 mr-1" />
              Upgrade
            </Button>
          )}
        </div>
        <CardDescription>{feature.description}</CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Current Tier Experience */}
        <div className={cn(
          'p-4 rounded-lg border',
          isAIEnhanced 
            ? 'border-purple-200 bg-purple-50 dark:border-purple-800 dark:bg-purple-950/20'
            : 'border-gray-200 bg-gray-50 dark:border-gray-800 dark:bg-gray-900'
        )}>
          <div className="flex items-center gap-2 mb-3">
            {isAIEnhanced ? (
              <Sparkles className="w-4 h-4 text-purple-600" />
            ) : (
              <Zap className="w-4 h-4 text-gray-600" />
            )}
            <span className="font-semibold text-sm">
              Your Current Experience
            </span>
            <TierBadge
              tier={currentTier}
              variant={isAIEnhanced ? 'enhanced' : 'default'}
              size="sm"
            />
          </div>
          
          <p className="text-sm text-muted-foreground mb-3">
            {isAIEnhanced ? feature.aiEnhancedDescription : feature.standardDescription}
          </p>

          <ul className="space-y-2">
            {(isAIEnhanced ? feature.aiEnhancedCapabilities : feature.standardCapabilities)
              .slice(0, compact ? 3 : undefined)
              .map((capability, index) => (
              <li key={index} className="flex items-start gap-2 text-sm">
                <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                <span>{capability}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* AI Enhancement Preview (for standard users) */}
        {!isAIEnhanced && !compact && (
          <>
            <Separator />
            <div className="p-4 rounded-lg border border-purple-200 bg-gradient-to-r from-purple-50 to-blue-50 dark:border-purple-800 dark:from-purple-950/20 dark:to-blue-950/20">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Lock className="w-4 h-4 text-purple-600" />
                  <span className="font-semibold text-sm">AI-Enhanced Experience</span>
                  <TierBadge tier="ai_enhanced" variant="locked" size="sm" />
                </div>
                {onUpgrade && (
                  <Button
                    size="sm"
                    onClick={onUpgrade}
                    className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                    data-testid={`button-unlock-${feature.id}`}
                  >
                    Unlock
                    <ArrowRight className="w-4 h-4 ml-1" />
                  </Button>
                )}
              </div>

              <p className="text-sm text-muted-foreground mb-3">
                {feature.aiEnhancedDescription}
              </p>

              <ul className="space-y-2 mb-4">
                {feature.aiEnhancedCapabilities.slice(0, 4).map((capability, index) => (
                  <li key={index} className="flex items-start gap-2 text-sm opacity-75">
                    <Sparkles className="w-4 h-4 text-purple-600 mt-0.5 flex-shrink-0" />
                    <span>{capability}</span>
                  </li>
                ))}
              </ul>

              {feature.valueProposition && (
                <div className="bg-white/50 dark:bg-black/20 p-3 rounded border border-purple-200/50 dark:border-purple-800/50">
                  <p className="text-sm font-medium text-purple-800 dark:text-purple-200">
                    💡 {feature.valueProposition}
                  </p>
                  {feature.roi && (
                    <p className="text-xs text-purple-600 dark:text-purple-400 mt-1">
                      📈 {feature.roi}
                    </p>
                  )}
                </div>
              )}
            </div>
          </>
        )}

        {/* Upgrade CTA for standard users */}
        {!isAIEnhanced && onUpgrade && (
          <div className="pt-2">
            <Button
              onClick={onUpgrade}
              className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
              data-testid={`button-upgrade-full-${feature.id}`}
            >
              <Sparkles className="w-4 h-4 mr-2" />
              {feature.upgradePrompt || 'Upgrade to AI Enhanced'}
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};