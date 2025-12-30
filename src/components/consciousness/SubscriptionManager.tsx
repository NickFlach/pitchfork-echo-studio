import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { useSubscription } from '@/hooks/useContracts';
import { useToast } from '@/hooks/use-toast';
import { SubscriptionTier } from '@/lib/contracts';
import { Crown, Zap, Building, Check, X } from 'lucide-react';

const TIER_INFO = {
  [SubscriptionTier.BASIC]: {
    name: 'Basic',
    icon: Zap,
    color: 'bg-blue-500',
    monthlyPrice: '50',
    annualPrice: '500',
    features: [
      '100 AI queries per month',
      '5 consciousness assessments',
      'Basic governance voting (1 vote)',
      'Community access',
      'Email support'
    ],
    maxAIQueries: 100,
    maxAssessments: 5,
    votingPower: 1
  },
  [SubscriptionTier.PREMIUM]: {
    name: 'Premium',
    icon: Crown,
    color: 'bg-purple-500',
    monthlyPrice: '150',
    annualPrice: '1500',
    features: [
      '500 AI queries per month',
      '20 consciousness assessments',
      'Enhanced governance voting (5 votes)',
      'Advanced analytics',
      'Personal AI coaching',
      'Priority support'
    ],
    maxAIQueries: 500,
    maxAssessments: 20,
    votingPower: 5
  },
  [SubscriptionTier.ENTERPRISE]: {
    name: 'Enterprise',
    icon: Building,
    color: 'bg-gold-500',
    monthlyPrice: '500',
    annualPrice: '5000',
    features: [
      '2000 AI queries per month',
      '100 consciousness assessments',
      'Maximum governance voting (20 votes)',
      'Advanced analytics',
      'Personal AI coaching',
      'API access',
      'White-label solutions',
      'Dedicated support'
    ],
    maxAIQueries: 2000,
    maxAssessments: 100,
    votingPower: 20
  }
};

export const SubscriptionManager = () => {
  const { subscription, loading, subscribe, hasFeatureAccess, refetch } = useSubscription();
  const { toast } = useToast();
  
  const [selectedTier, setSelectedTier] = useState<SubscriptionTier>(SubscriptionTier.BASIC);
  const [isAnnual, setIsAnnual] = useState(false);
  const [paymentToken, setPaymentToken] = useState('PFORK');
  const [isSubscribing, setIsSubscribing] = useState(false);
  const [featureAccess, setFeatureAccess] = useState<Record<string, boolean>>({});

  useEffect(() => {
    checkFeatureAccess();
  }, [subscription]);

  const checkFeatureAccess = async () => {
    if (!subscription || !subscription.isActive) return;
    
    const features = [
      'advanced_analytics',
      'personal_coaching', 
      'api_access',
      'white_label'
    ];
    
    const accessMap: Record<string, boolean> = {};
    for (const feature of features) {
      try {
        accessMap[feature] = await hasFeatureAccess(feature);
      } catch (error) {
        accessMap[feature] = false;
      }
    }
    setFeatureAccess(accessMap);
  };

  const handleSubscribe = async () => {
    setIsSubscribing(true);
    
    try {
      const tokenAddress = paymentToken === 'CONS' ? 
        process.env.VITE_CONSCIOUSNESS_TOKEN_ADDRESS || '' : 
        '0x0000000000000000000000000000000000000000'; // ETH
      
      const tx = await subscribe(selectedTier, isAnnual, tokenAddress);
      
      toast({
        title: 'Subscription Transaction Submitted',
        description: 'Your subscription is being processed. Please wait for confirmation.',
      });

      await tx.wait();
      
      toast({
        title: 'Subscription Successful!',
        description: `Welcome to ${TIER_INFO[selectedTier].name} tier!`,
      });

      await refetch();
    } catch (error: any) {
      console.error('Subscription error:', error);
      toast({
        title: 'Subscription Failed',
        description: error.message || 'Failed to subscribe',
        variant: 'destructive',
      });
    } finally {
      setIsSubscribing(false);
    }
  };

  const renderTierCard = (tier: SubscriptionTier) => {
    const tierInfo = TIER_INFO[tier];
    const Icon = tierInfo.icon;
    const isCurrentTier = subscription?.tier === tier && subscription?.isActive;
    const price = isAnnual ? tierInfo.annualPrice : tierInfo.monthlyPrice;
    const savings = isAnnual ? ((parseFloat(tierInfo.monthlyPrice) * 12) - parseFloat(tierInfo.annualPrice)).toFixed(0) : '0';

    return (
      <Card 
        key={tier} 
        className={`relative cursor-pointer transition-all ${
          selectedTier === tier ? 'ring-2 ring-primary' : ''
        } ${isCurrentTier ? 'bg-primary/5 border-primary' : ''}`}
        onClick={() => setSelectedTier(tier)}
        data-testid={`tier-card-${tier}`}
      >
        {isCurrentTier && (
          <div className="absolute top-0 right-0 bg-primary text-primary-foreground text-xs px-2 py-1 rounded-bl">
            Current Plan
          </div>
        )}
        
        <CardHeader className="pb-2">
          <div className="flex items-center space-x-2">
            <div className={`p-2 rounded-lg ${tierInfo.color} text-white`}>
              <Icon className="h-4 w-4" />
            </div>
            <div>
              <CardTitle className="text-lg">{tierInfo.name}</CardTitle>
              <div className="flex items-center space-x-2">
                <span className="text-2xl font-bold">{price} CONS</span>
                <span className="text-sm text-muted-foreground">
                  /{isAnnual ? 'year' : 'month'}
                </span>
              </div>
            </div>
          </div>
          
          {isAnnual && parseFloat(savings) > 0 && (
            <Badge variant="secondary" className="w-fit">
              Save {savings} CONS/year
            </Badge>
          )}
        </CardHeader>

        <CardContent className="space-y-4">
          <ul className="space-y-2">
            {tierInfo.features.map((feature, index) => (
              <li key={index} className="flex items-center space-x-2 text-sm">
                <Check className="h-4 w-4 text-green-500" />
                <span>{feature}</span>
              </li>
            ))}
          </ul>
          
          <div className="pt-2 border-t space-y-2">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-muted-foreground">AI Queries</span>
                <div className="font-medium">{tierInfo.maxAIQueries}/month</div>
              </div>
              <div>
                <span className="text-muted-foreground">Assessments</span>
                <div className="font-medium">{tierInfo.maxAssessments}/month</div>
              </div>
            </div>
            
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Voting Power</span>
              <Badge variant="outline">{tierInfo.votingPower} votes</Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  const currentTierInfo = subscription?.tier ? TIER_INFO[subscription.tier] : null;
  const daysRemaining = subscription?.endTime ? 
    Math.max(0, Math.ceil((subscription.endTime * 1000 - Date.now()) / (1000 * 60 * 60 * 24))) : 0;

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12" data-testid="subscription-loading">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading subscription details...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6" data-testid="subscription-manager">
      {/* Current Subscription Status */}
      {subscription?.isActive && currentTierInfo && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center space-x-2">
                  <currentTierInfo.icon className="h-5 w-5" />
                  <span>{currentTierInfo.name} Subscription</span>
                </CardTitle>
                <CardDescription>
                  {subscription.isAnnual ? 'Annual' : 'Monthly'} plan • 
                  {daysRemaining > 0 ? ` ${daysRemaining} days remaining` : ' Expired'}
                </CardDescription>
              </div>
              <Badge variant={daysRemaining > 7 ? 'default' : 'destructive'}>
                {subscription.isActive ? 'Active' : 'Inactive'}
              </Badge>
            </div>
          </CardHeader>

          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <span className="text-sm text-muted-foreground">Total Paid</span>
                <div className="font-medium">{subscription.totalPaid} CONS</div>
              </div>
              <div>
                <span className="text-sm text-muted-foreground">Voting Power</span>
                <div className="font-medium">{subscription.votingPower} votes</div>
              </div>
              <div>
                <span className="text-sm text-muted-foreground">Auto-Renewal</span>
                <div className="font-medium">{subscription.autoRenewal ? 'On' : 'Off'}</div>
              </div>
              <div>
                <span className="text-sm text-muted-foreground">End Date</span>
                <div className="font-medium">
                  {new Date(subscription.endTime * 1000).toLocaleDateString()}
                </div>
              </div>
            </div>

            <div>
              <h4 className="font-medium mb-2">Feature Access</h4>
              <div className="grid grid-cols-2 gap-2">
                <div className="flex items-center space-x-2">
                  {featureAccess.advanced_analytics ? 
                    <Check className="h-4 w-4 text-green-500" /> : 
                    <X className="h-4 w-4 text-red-500" />
                  }
                  <span className="text-sm">Advanced Analytics</span>
                </div>
                <div className="flex items-center space-x-2">
                  {featureAccess.personal_coaching ? 
                    <Check className="h-4 w-4 text-green-500" /> : 
                    <X className="h-4 w-4 text-red-500" />
                  }
                  <span className="text-sm">Personal Coaching</span>
                </div>
                <div className="flex items-center space-x-2">
                  {featureAccess.api_access ? 
                    <Check className="h-4 w-4 text-green-500" /> : 
                    <X className="h-4 w-4 text-red-500" />
                  }
                  <span className="text-sm">API Access</span>
                </div>
                <div className="flex items-center space-x-2">
                  {featureAccess.white_label ? 
                    <Check className="h-4 w-4 text-green-500" /> : 
                    <X className="h-4 w-4 text-red-500" />
                  }
                  <span className="text-sm">White Label</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Subscription Plans */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">Choose Your Plan</h2>
          <div className="flex items-center space-x-2">
            <span className={`text-sm ${!isAnnual ? 'font-medium' : 'text-muted-foreground'}`}>
              Monthly
            </span>
            <Switch
              checked={isAnnual}
              onCheckedChange={setIsAnnual}
              data-testid="switch-billing-period"
            />
            <span className={`text-sm ${isAnnual ? 'font-medium' : 'text-muted-foreground'}`}>
              Annual
            </span>
            <Badge variant="secondary" className="ml-2">Save up to 17%</Badge>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {Object.entries(TIER_INFO).map(([tier, _]) => 
            renderTierCard(parseInt(tier) as SubscriptionTier)
          )}
        </div>

        {/* Payment Options */}
        <Card>
          <CardHeader>
            <CardTitle>Payment & Subscription</CardTitle>
            <CardDescription>
              Complete your subscription to unlock premium features
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Payment Token</label>
              <Select value={paymentToken} onValueChange={setPaymentToken}>
                <SelectTrigger data-testid="select-payment-token">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="CONS">CONS Token</SelectItem>
                  <SelectItem value="ETH">Ethereum (ETH)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="p-4 bg-muted rounded-lg">
              <h4 className="font-medium mb-2">Subscription Summary</h4>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span>Plan:</span>
                  <span>{TIER_INFO[selectedTier].name}</span>
                </div>
                <div className="flex justify-between">
                  <span>Billing:</span>
                  <span>{isAnnual ? 'Annual' : 'Monthly'}</span>
                </div>
                <div className="flex justify-between">
                  <span>Price:</span>
                  <span>
                    {isAnnual ? TIER_INFO[selectedTier].annualPrice : TIER_INFO[selectedTier].monthlyPrice} {paymentToken}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Voting Power:</span>
                  <span>{TIER_INFO[selectedTier].votingPower} votes</span>
                </div>
              </div>
            </div>

            <Button
              onClick={handleSubscribe}
              disabled={isSubscribing || (subscription?.isActive && subscription.tier >= selectedTier)}
              className="w-full"
              size="lg"
              data-testid="button-subscribe"
            >
              {isSubscribing ? 'Processing...' : 
               subscription?.isActive && subscription.tier >= selectedTier ? 'Current Plan' :
               subscription?.isActive ? 'Upgrade Subscription' : 'Subscribe Now'}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};