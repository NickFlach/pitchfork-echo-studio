import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Calculator, 
  DollarSign, 
  TrendingUp, 
  Clock, 
  Zap, 
  CheckCircle,
  AlertCircle,
  ArrowRight
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface ProviderPricing {
  name: string;
  inputPrice: number;
  outputPrice: number;
  currency: string;
  strengths: string[];
}

interface CostBenefitResult {
  monthlyCost: number;
  annualCost: number;
  timeValue: number;
  efficiencyGains: number;
  roi: number;
  paybackPeriod: number;
  recommendation: 'high' | 'medium' | 'low';
}

const AI_PROVIDERS: Record<string, ProviderPricing> = {
  openai: {
    name: 'OpenAI GPT-4',
    inputPrice: 0.03,
    outputPrice: 0.06,
    currency: 'USD per 1K tokens',
    strengths: ['Creative insights', 'Code generation', 'Conversational AI']
  },
  claude: {
    name: 'Anthropic Claude',
    inputPrice: 0.003,
    outputPrice: 0.015,
    currency: 'USD per 1K tokens',
    strengths: ['Logical reasoning', 'Ethical analysis', 'Long-form analysis']
  },
  gemini: {
    name: 'Google Gemini',
    inputPrice: 0.001,
    outputPrice: 0.002,
    currency: 'USD per 1K tokens',
    strengths: ['Data analysis', 'Research synthesis', 'Factual accuracy']
  },
  xai: {
    name: 'X.AI Grok',
    inputPrice: 0.01,
    outputPrice: 0.03,
    currency: 'USD per 1K tokens',
    strengths: ['Real-time data', 'Creative thinking', 'Unconventional insights']
  }
};

interface CostBenefitCalculatorProps {
  className?: string;
  onProviderSelect?: (provider: string) => void;
  showOnlyROI?: boolean;
}

export const CostBenefitCalculator: React.FC<CostBenefitCalculatorProps> = ({
  className,
  onProviderSelect,
  showOnlyROI = false
}) => {
  const [selectedProvider, setSelectedProvider] = useState<string>('claude');
  const [monthlyUsage, setMonthlyUsage] = useState<number>(20); // sessions per month
  const [avgSessionLength, setAvgSessionLength] = useState<number>(5); // minutes
  const [hourlyValue, setHourlyValue] = useState<number>(50); // dollars per hour
  const [efficiencyMultiplier, setEfficiencyMultiplier] = useState<number>(2.5);
  const [result, setResult] = useState<CostBenefitResult | null>(null);

  useEffect(() => {
    calculateROI();
  }, [selectedProvider, monthlyUsage, avgSessionLength, hourlyValue, efficiencyMultiplier]);

  const calculateROI = () => {
    const provider = AI_PROVIDERS[selectedProvider];
    if (!provider) return;

    // Estimate token usage (rough calculation)
    const avgTokensPerSession = avgSessionLength * 200; // ~200 tokens per minute
    const inputTokens = avgTokensPerSession * 0.7; // 70% input
    const outputTokens = avgTokensPerSession * 0.3; // 30% output

    const costPerSession = 
      (inputTokens / 1000) * provider.inputPrice + 
      (outputTokens / 1000) * provider.outputPrice;

    const monthlyCost = costPerSession * monthlyUsage;
    const annualCost = monthlyCost * 12;

    // Time value calculation
    const timeValuePerSession = (avgSessionLength / 60) * hourlyValue;
    const monthlyTimeValue = timeValuePerSession * monthlyUsage;

    // Efficiency gains (user gets X times more value with AI)
    const efficiencyGains = monthlyTimeValue * (efficiencyMultiplier - 1);
    const roi = ((efficiencyGains - monthlyCost) / monthlyCost) * 100;
    const paybackPeriod = monthlyCost / (efficiencyGains / 30); // days

    setResult({
      monthlyCost,
      annualCost,
      timeValue: monthlyTimeValue,
      efficiencyGains,
      roi,
      paybackPeriod,
      recommendation: roi > 300 ? 'high' : roi > 100 ? 'medium' : 'low'
    });
  };

  const getRecommendationColor = (recommendation: string) => {
    switch (recommendation) {
      case 'high':
        return 'text-green-600 bg-green-50 border-green-200 dark:text-green-400 dark:bg-green-950/20 dark:border-green-800';
      case 'medium':
        return 'text-yellow-600 bg-yellow-50 border-yellow-200 dark:text-yellow-400 dark:bg-yellow-950/20 dark:border-yellow-800';
      default:
        return 'text-red-600 bg-red-50 border-red-200 dark:text-red-400 dark:bg-red-950/20 dark:border-red-800';
    }
  };

  if (showOnlyROI && result) {
    return (
      <div className={cn('p-4 rounded-lg border', getRecommendationColor(result.recommendation), className)}>
        <div className="flex items-center gap-2 mb-2">
          <TrendingUp className="w-4 h-4" />
          <span className="font-semibold text-sm">ROI Analysis</span>
        </div>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-lg font-bold">{result.roi.toFixed(0)}% ROI</p>
            <p className="text-xs opacity-75">${result.monthlyCost.toFixed(2)}/month</p>
          </div>
          <Badge variant="secondary" className={getRecommendationColor(result.recommendation)}>
            {result.recommendation.toUpperCase()}
          </Badge>
        </div>
      </div>
    );
  }

  return (
    <Card className={cn('w-full', className)} data-testid="card-cost-benefit-calculator">
      <CardHeader>
        <div className="flex items-center gap-2">
          <Calculator className="w-5 h-5 text-purple-600" />
          <CardTitle>AI Cost-Benefit Calculator</CardTitle>
        </div>
        <CardDescription>
          Calculate the ROI of AI enhancement for your workflow
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Provider Selection */}
        <div className="space-y-2">
          <Label htmlFor="provider">AI Provider</Label>
          <Select value={selectedProvider} onValueChange={setSelectedProvider}>
            <SelectTrigger data-testid="select-ai-provider">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(AI_PROVIDERS).map(([key, provider]) => (
                <SelectItem key={key} value={key}>
                  <div className="flex items-center justify-between w-full">
                    <span>{provider.name}</span>
                    <Badge variant="outline" className="ml-2">
                      ${provider.inputPrice}/{provider.currency}
                    </Badge>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <div className="text-xs text-muted-foreground">
            Strengths: {AI_PROVIDERS[selectedProvider]?.strengths.join(', ')}
          </div>
        </div>

        {/* Usage Inputs */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="monthly-usage">Sessions per Month</Label>
            <Input
              id="monthly-usage"
              type="number"
              value={monthlyUsage}
              onChange={(e) => setMonthlyUsage(Number(e.target.value))}
              min="1"
              max="1000"
              data-testid="input-monthly-usage"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="session-length">Avg Session (minutes)</Label>
            <Input
              id="session-length"
              type="number"
              value={avgSessionLength}
              onChange={(e) => setAvgSessionLength(Number(e.target.value))}
              min="1"
              max="120"
              data-testid="input-session-length"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="hourly-value">Your Time Value ($/hour)</Label>
            <Input
              id="hourly-value"
              type="number"
              value={hourlyValue}
              onChange={(e) => setHourlyValue(Number(e.target.value))}
              min="10"
              max="500"
              data-testid="input-hourly-value"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="efficiency">Efficiency Multiplier</Label>
            <Select value={efficiencyMultiplier.toString()} onValueChange={(v) => setEfficiencyMultiplier(Number(v))}>
              <SelectTrigger data-testid="select-efficiency">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1.5">1.5x (Basic improvement)</SelectItem>
                <SelectItem value="2">2x (Good improvement)</SelectItem>
                <SelectItem value="2.5">2.5x (Great improvement)</SelectItem>
                <SelectItem value="3">3x (Excellent improvement)</SelectItem>
                <SelectItem value="4">4x (Exceptional improvement)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {result && (
          <>
            <Separator />
            
            {/* Results */}
            <div className="space-y-4">
              <h4 className="font-semibold flex items-center gap-2">
                <TrendingUp className="w-4 h-4" />
                Cost-Benefit Analysis
              </h4>

              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 rounded-lg bg-muted">
                  <div className="flex items-center gap-2 mb-1">
                    <DollarSign className="w-4 h-4 text-red-600" />
                    <span className="text-sm font-medium">Monthly Cost</span>
                  </div>
                  <p className="text-lg font-bold">${result.monthlyCost.toFixed(2)}</p>
                  <p className="text-xs text-muted-foreground">${result.annualCost.toFixed(0)} annually</p>
                </div>

                <div className="p-3 rounded-lg bg-muted">
                  <div className="flex items-center gap-2 mb-1">
                    <Zap className="w-4 h-4 text-green-600" />
                    <span className="text-sm font-medium">Monthly Value</span>
                  </div>
                  <p className="text-lg font-bold">${result.efficiencyGains.toFixed(2)}</p>
                  <p className="text-xs text-muted-foreground">From efficiency gains</p>
                </div>
              </div>

              <div className={cn('p-4 rounded-lg border', getRecommendationColor(result.recommendation))}>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    {result.recommendation === 'high' ? (
                      <CheckCircle className="w-5 h-5" />
                    ) : (
                      <AlertCircle className="w-5 h-5" />
                    )}
                    <span className="font-semibold">ROI Analysis</span>
                  </div>
                  <Badge variant="secondary" className="bg-white/50">
                    {result.recommendation.toUpperCase()} VALUE
                  </Badge>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-3">
                  <div>
                    <p className="text-sm font-medium">Return on Investment</p>
                    <p className="text-2xl font-bold">{result.roi.toFixed(0)}%</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium">Payback Period</p>
                    <p className="text-2xl font-bold">{result.paybackPeriod.toFixed(1)} days</p>
                  </div>
                </div>

                <Progress value={Math.min(result.roi / 5, 100)} className="mb-2" />
                
                <p className="text-sm">
                  {result.recommendation === 'high' && 
                    "Excellent ROI! AI enhancement will provide significant value for your workflow."}
                  {result.recommendation === 'medium' && 
                    "Good ROI. AI enhancement should provide solid value for your use case."}
                  {result.recommendation === 'low' && 
                    "Consider starting with lighter usage or optimizing your workflow first."}
                </p>
              </div>

              {onProviderSelect && (
                <Button 
                  onClick={() => onProviderSelect(selectedProvider)}
                  className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                  data-testid="button-select-provider"
                >
                  Configure {AI_PROVIDERS[selectedProvider]?.name}
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              )}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
};