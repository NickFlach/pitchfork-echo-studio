import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';
import { CheckCircle, ArrowRight, Sparkles, Brain, Target, Crown, X, ArrowLeft } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useNavigate } from 'react-router-dom';
import { FeatureComparison } from './feature-comparison';
import { CostBenefitCalculator } from './cost-benefit-calculator';
import { useTier } from '@/contexts/TierContext';

interface TierOnboardingProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: () => void;
  className?: string;
}

const onboardingSteps = [
  {
    id: 'welcome',
    title: 'Welcome to Pitchfork Protocol',
    description: 'Discover how AI can enhance your consciousness and leadership capabilities',
    icon: Crown
  },
  {
    id: 'consciousness',
    title: 'Consciousness Features',
    description: 'Experience AI-powered reflection, decision analysis, and learning optimization',
    icon: Brain
  },
  {
    id: 'leadership',
    title: 'Leadership Features', 
    description: 'Generate strategic campaigns, optimize resources, and analyze opposition',
    icon: Target
  },
  {
    id: 'calculator',
    title: 'ROI Calculator',
    description: 'Calculate the return on investment for your AI enhancement',
    icon: Sparkles
  },
  {
    id: 'setup',
    title: 'Get Started',
    description: 'Configure your AI provider and unlock enhanced capabilities',
    icon: CheckCircle
  }
];

export const TierOnboarding: React.FC<TierOnboardingProps> = ({
  isOpen,
  onClose,
  onComplete,
  className
}) => {
  const navigate = useNavigate();
  const { 
    currentTier, 
    features, 
    getFeaturesByCategory, 
    trackFeatureUsage,
    trackTierAdoption 
  } = useTier();
  
  const [currentStep, setCurrentStep] = useState(0);
  const [selectedProvider, setSelectedProvider] = useState<string>('claude');
  const currentStepData = onboardingSteps[currentStep];

  const consciousnessFeatures = getFeaturesByCategory('consciousness');
  const leadershipFeatures = getFeaturesByCategory('leadership');

  const handleNext = () => {
    if (currentStep < onboardingSteps.length - 1) {
      setCurrentStep(currentStep + 1);
      trackFeatureUsage(`onboarding_step_${currentStepData.id}`, 'general');
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSkip = () => {
    trackFeatureUsage('onboarding_skipped', 'general');
    onClose();
  };

  const handleComplete = () => {
    trackFeatureUsage('onboarding_completed', 'general');
    onComplete();
    navigate('/ai-settings');
  };

  const handleProviderSelect = (provider: string) => {
    setSelectedProvider(provider);
    setCurrentStep(onboardingSteps.length - 1); // Go to final step
  };

  const progressPercentage = ((currentStep + 1) / onboardingSteps.length) * 100;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent 
        className={cn('sm:max-w-4xl max-h-[90vh] overflow-y-auto', className)} 
        data-testid="modal-tier-onboarding"
      >
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-r from-purple-600 to-blue-600 flex items-center justify-center">
                <currentStepData.icon className="w-5 h-5 text-white" />
              </div>
              <div>
                <DialogTitle className="text-xl">{currentStepData.title}</DialogTitle>
                <DialogDescription>
                  {currentStepData.description}
                </DialogDescription>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-sm">
                {currentStep + 1} of {onboardingSteps.length}
              </Badge>
              <Button
                variant="ghost"
                size="sm"
                onClick={onClose}
                className="h-6 w-6 p-0"
                data-testid="button-close-onboarding"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>
          
          <Progress value={progressPercentage} className="w-full" />
        </DialogHeader>

        <div className="mt-6 space-y-6">
          {/* Welcome Step */}
          {currentStep === 0 && (
            <div className="text-center space-y-6">
              <div className="w-24 h-24 mx-auto rounded-full bg-gradient-to-r from-purple-600 to-blue-600 flex items-center justify-center">
                <Crown className="w-12 h-12 text-white" />
              </div>
              <div>
                <h3 className="text-2xl font-bold mb-2">Transform Your Potential</h3>
                <p className="text-muted-foreground max-w-2xl mx-auto">
                  Pitchfork Protocol offers two tiers of experience. Start with standard features 
                  or unlock AI-enhanced capabilities for deeper insights and strategic intelligence.
                </p>
              </div>
              
              <div className="grid md:grid-cols-2 gap-4 max-w-4xl mx-auto">
                <div className="p-6 rounded-lg border border-gray-200 bg-gray-50 dark:border-gray-800 dark:bg-gray-900">
                  <h4 className="font-semibold mb-2 flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-gray-600" />
                    Standard Tier
                  </h4>
                  <ul className="text-sm space-y-1 text-muted-foreground">
                    <li>• Basic reflection forms</li>
                    <li>• Simple decision frameworks</li>
                    <li>• Manual pattern recognition</li>
                    <li>• Static campaign templates</li>
                  </ul>
                </div>
                
                <div className="p-6 rounded-lg border border-purple-200 bg-gradient-to-br from-purple-50 to-blue-50 dark:border-purple-800 dark:from-purple-950/20 dark:to-blue-950/20">
                  <h4 className="font-semibold mb-2 flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-purple-600" />
                    AI-Enhanced Tier
                  </h4>
                  <ul className="text-sm space-y-1 text-purple-700 dark:text-purple-300">
                    <li>• AI-powered deep insights</li>
                    <li>• Multi-perspective analysis</li>
                    <li>• Automated pattern detection</li>
                    <li>• Strategic campaign generation</li>
                  </ul>
                </div>
              </div>
            </div>
          )}

          {/* Consciousness Features Step */}
          {currentStep === 1 && (
            <div className="space-y-4">
              <div className="text-center mb-6">
                <h3 className="text-xl font-bold mb-2 flex items-center justify-center gap-2">
                  <Brain className="w-6 h-6 text-purple-600" />
                  Consciousness Features
                </h3>
                <p className="text-muted-foreground">
                  Enhance your self-awareness and decision-making with AI-powered insights
                </p>
              </div>
              
              <div className="space-y-4">
                {consciousnessFeatures.slice(0, 2).map((feature) => (
                  <FeatureComparison
                    key={feature.id}
                    feature={feature}
                    currentTier={currentTier}
                    compact
                  />
                ))}
              </div>
            </div>
          )}

          {/* Leadership Features Step */}
          {currentStep === 2 && (
            <div className="space-y-4">
              <div className="text-center mb-6">
                <h3 className="text-xl font-bold mb-2 flex items-center justify-center gap-2">
                  <Target className="w-6 h-6 text-blue-600" />
                  Leadership Features
                </h3>
                <p className="text-muted-foreground">
                  Build effective movements with AI-generated strategies and intelligent analysis
                </p>
              </div>
              
              <div className="space-y-4">
                {leadershipFeatures.slice(0, 2).map((feature) => (
                  <FeatureComparison
                    key={feature.id}
                    feature={feature}
                    currentTier={currentTier}
                    compact
                  />
                ))}
              </div>
            </div>
          )}

          {/* ROI Calculator Step */}
          {currentStep === 3 && (
            <div className="space-y-4">
              <div className="text-center mb-6">
                <h3 className="text-xl font-bold mb-2 flex items-center justify-center gap-2">
                  <Sparkles className="w-6 h-6 text-green-600" />
                  Calculate Your ROI
                </h3>
                <p className="text-muted-foreground">
                  See the potential return on investment for AI enhancement
                </p>
              </div>
              
              <CostBenefitCalculator 
                showOnlyROI
                onProviderSelect={handleProviderSelect}
              />
            </div>
          )}

          {/* Setup Step */}
          {currentStep === 4 && (
            <div className="space-y-6">
              <div className="text-center">
                <h3 className="text-xl font-bold mb-2 flex items-center justify-center gap-2">
                  <CheckCircle className="w-6 h-6 text-green-600" />
                  Ready to Get Started?
                </h3>
                <p className="text-muted-foreground">
                  Configure your AI provider to unlock enhanced capabilities
                </p>
              </div>
              
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h4 className="font-semibold">What you'll get:</h4>
                  <ul className="space-y-2">
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                      <span className="text-sm">AI-powered consciousness insights</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                      <span className="text-sm">Strategic campaign generation</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                      <span className="text-sm">Intelligent resource optimization</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                      <span className="text-sm">Opposition pattern analysis</span>
                    </li>
                  </ul>
                </div>
                
                <div className="p-4 rounded-lg border border-purple-200 bg-gradient-to-br from-purple-50 to-blue-50 dark:border-purple-800 dark:from-purple-950/20 dark:to-blue-950/20">
                  <h4 className="font-semibold mb-2">Next Steps:</h4>
                  <ol className="space-y-2 text-sm">
                    <li className="flex items-center gap-2">
                      <span className="w-5 h-5 rounded-full bg-purple-600 text-white text-xs flex items-center justify-center">1</span>
                      Choose your AI provider
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="w-5 h-5 rounded-full bg-purple-600 text-white text-xs flex items-center justify-center">2</span>
                      Configure API credentials
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="w-5 h-5 rounded-full bg-purple-600 text-white text-xs flex items-center justify-center">3</span>
                      Start exploring AI features
                    </li>
                  </ol>
                </div>
              </div>
            </div>
          )}
        </div>

        <Separator />

        {/* Navigation Footer */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {currentStep > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={handlePrevious}
                data-testid="button-onboarding-previous"
              >
                <ArrowLeft className="w-4 h-4 mr-1" />
                Previous
              </Button>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={handleSkip}
              data-testid="button-onboarding-skip"
            >
              Skip Tour
            </Button>
          </div>
          
          <div className="flex gap-2">
            {currentStep < onboardingSteps.length - 1 ? (
              <Button
                onClick={handleNext}
                className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                data-testid="button-onboarding-next"
              >
                Next
                <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            ) : (
              <Button
                onClick={handleComplete}
                className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                data-testid="button-onboarding-complete"
              >
                <Sparkles className="w-4 h-4 mr-1" />
                Configure AI Now
                <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};