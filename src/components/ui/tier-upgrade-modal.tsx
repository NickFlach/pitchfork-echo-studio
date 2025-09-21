import React from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { CheckCircle, ArrowRight, Sparkles, Zap, X, Crown, Target, Brain } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useNavigate } from 'react-router-dom';
import { FeatureComparison } from './feature-comparison';
import { CostBenefitCalculator } from './cost-benefit-calculator';
import { useTier } from '@/contexts/TierContext';

interface TierUpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTab?: 'overview' | 'features' | 'calculator';
  featureId?: string;
  className?: string;
}

export const TierUpgradeModal: React.FC<TierUpgradeModalProps> = ({
  isOpen,
  onClose,
  initialTab = 'overview',
  featureId,
  className
}) => {
  const navigate = useNavigate();
  const { 
    currentTier, 
    features, 
    getFeaturesByCategory, 
    trackUpgradeConversion,
    triggerUpgradePrompt,
    dismissUpgradePrompt 
  } = useTier();
  
  const [selectedTab, setSelectedTab] = React.useState(initialTab);
  const [selectedProvider, setSelectedProvider] = React.useState<string>('claude');

  const consciousnessFeatures = getFeaturesByCategory('consciousness');
  const leadershipFeatures = getFeaturesByCategory('leadership');
  const currentFeature = featureId ? features.find(f => f.id === featureId) : null;

  const handleUpgrade = () => {
    if (featureId) {
      trackUpgradeConversion(featureId, true);
    }
    onClose();
    navigate('/ai-settings');
  };

  const handleProviderSelect = (provider: string) => {
    setSelectedProvider(provider);
    setSelectedTab('overview');
  };

  const tierBenefits = [
    {
      icon: Brain,
      title: 'Enhanced Consciousness Analysis',
      description: 'AI-powered insights into your thought patterns and decision-making',
      value: '10x deeper self-understanding'
    },
    {
      icon: Target,
      title: 'Strategic Campaign Intelligence',
      description: 'AI-generated strategies and opposition analysis for movements',
      value: '300% better campaign success rates'
    },
    {
      icon: Zap,
      title: 'Personalized AI Coaching',
      description: 'Adaptive learning and growth recommendations',
      value: '2x faster skill development'
    }
  ];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent 
        className={cn('sm:max-w-4xl max-h-[90vh] overflow-y-auto', className)} 
        data-testid="modal-tier-upgrade"
      >
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-r from-purple-600 to-blue-600 flex items-center justify-center">
                <Crown className="w-5 h-5 text-white" />
              </div>
              <div>
                <DialogTitle className="text-xl">Unlock AI-Enhanced Experience</DialogTitle>
                <DialogDescription>
                  {currentFeature 
                    ? `Upgrade ${currentFeature.name} with AI capabilities`
                    : 'Transform your consciousness and leadership with AI intelligence'
                  }
                </DialogDescription>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="h-6 w-6 p-0"
              data-testid="button-close-upgrade-modal"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </DialogHeader>

        <Tabs value={selectedTab} onValueChange={setSelectedTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="overview" data-testid="tab-overview">Overview</TabsTrigger>
            <TabsTrigger value="features" data-testid="tab-features">Features</TabsTrigger>
            <TabsTrigger value="calculator" data-testid="tab-calculator">ROI Calculator</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="mt-6 space-y-6">
            {/* Value Proposition Header */}
            <div className="text-center space-y-4">
              <h3 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                Unlock Your Full Potential with AI
              </h3>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Experience the next generation of consciousness development and strategic leadership 
                with AI-powered insights, personalized coaching, and intelligent analysis.
              </p>
            </div>

            {/* Key Benefits */}
            <div className="grid md:grid-cols-3 gap-4">
              {tierBenefits.map((benefit, index) => {
                const Icon = benefit.icon;
                return (
                  <div key={index} className="p-4 rounded-lg border border-purple-200 bg-gradient-to-br from-purple-50 to-blue-50 dark:border-purple-800 dark:from-purple-950/20 dark:to-blue-950/20">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-8 h-8 rounded-full bg-purple-600 flex items-center justify-center">
                        <Icon className="w-4 h-4 text-white" />
                      </div>
                      <h4 className="font-semibold">{benefit.title}</h4>
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">{benefit.description}</p>
                    <Badge variant="secondary" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                      {benefit.value}
                    </Badge>
                  </div>
                );
              })}
            </div>

            {/* Current Feature Focus */}
            {currentFeature && (
              <>
                <Separator />
                <div className="space-y-4">
                  <h4 className="text-lg font-semibold flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-purple-600" />
                    Featured: {currentFeature.name}
                  </h4>
                  <FeatureComparison 
                    feature={currentFeature} 
                    currentTier={currentTier}
                    onUpgrade={handleUpgrade}
                    compact
                  />
                </div>
              </>
            )}

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 pt-4">
              <Button
                onClick={handleUpgrade}
                className="flex-1 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                data-testid="button-upgrade-primary"
              >
                <Sparkles className="w-4 h-4 mr-2" />
                Configure AI Now
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
              <Button 
                variant="outline" 
                onClick={() => setSelectedTab('features')}
                className="flex-1"
                data-testid="button-explore-features"
              >
                Explore All Features
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="features" className="mt-6 space-y-6">
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <Brain className="w-5 h-5 text-purple-600" />
                  Consciousness Features
                </h3>
                <div className="space-y-4">
                  {consciousnessFeatures.map((feature) => (
                    <FeatureComparison
                      key={feature.id}
                      feature={feature}
                      currentTier={currentTier}
                      onUpgrade={handleUpgrade}
                      compact
                    />
                  ))}
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <Target className="w-5 h-5 text-blue-600" />
                  Leadership Features
                </h3>
                <div className="space-y-4">
                  {leadershipFeatures.map((feature) => (
                    <FeatureComparison
                      key={feature.id}
                      feature={feature}
                      currentTier={currentTier}
                      onUpgrade={handleUpgrade}
                      compact
                    />
                  ))}
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="calculator" className="mt-6">
            <CostBenefitCalculator 
              onProviderSelect={handleProviderSelect}
            />
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};