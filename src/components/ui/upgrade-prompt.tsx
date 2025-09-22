import React from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { CheckCircle, ArrowRight, Sparkles, Zap, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useNavigate } from 'react-router-dom';
import type { TierUpgradePrompt } from '@/contexts/TierContext';

interface UpgradePromptModalProps {
  prompt: TierUpgradePrompt | null;
  onDismiss: () => void;
  onUpgrade: () => void;
  className?: string;
}

export const UpgradePromptModal: React.FC<UpgradePromptModalProps> = ({
  prompt,
  onDismiss,
  onUpgrade,
  className
}) => {
  const navigate = useNavigate();

  if (!prompt) return null;

  const handleUpgrade = () => {
    onUpgrade();
    navigate('/ai-settings');
  };

  const getUrgencyColor = (urgency?: 'low' | 'medium' | 'high') => {
    switch (urgency) {
      case 'high':
        return 'border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950/20';
      case 'medium':
        return 'border-yellow-200 bg-yellow-50 dark:border-yellow-800 dark:bg-yellow-950/20';
      default:
        return 'border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-950/20';
    }
  };

  return (
    <Dialog open={!!prompt} onOpenChange={onDismiss}>
      <DialogContent className={cn('sm:max-w-md', className)} data-testid="modal-upgrade-prompt">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-purple-600" />
              <DialogTitle className="text-lg">{prompt.title}</DialogTitle>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={onDismiss}
              className="h-6 w-6 p-0"
              data-testid="button-dismiss-upgrade"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
          <DialogDescription className="text-base">
            {prompt.description}
          </DialogDescription>
        </DialogHeader>

        <div className={cn('p-4 rounded-lg border', getUrgencyColor(prompt.urgency))}>
          <div className="flex items-center gap-2 mb-3">
            <Zap className="w-4 h-4 text-yellow-600" />
            <span className="font-semibold text-sm">AI-Enhanced Capabilities</span>
          </div>
          <ul className="space-y-2">
            {prompt.benefits.slice(0, 4).map((benefit, index) => (
              <li key={index} className="flex items-start gap-2 text-sm">
                <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                <span>{benefit}</span>
              </li>
            ))}
          </ul>
        </div>

        <Separator />

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200">
              {prompt.trigger === 'high_intent' ? 'Recommended' : 'Available'}
            </Badge>
            {prompt.urgency === 'high' && (
              <Badge variant="destructive" className="bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200">
                Limited Time
              </Badge>
            )}
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={onDismiss}
              data-testid="button-maybe-later"
            >
              Maybe Later
            </Button>
            <Button
              onClick={handleUpgrade}
              className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
              data-testid="button-upgrade-now"
            >
              {prompt.ctaText}
              <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};