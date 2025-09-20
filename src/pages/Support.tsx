import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Heart, DollarSign, Users, Target, Clock, CheckCircle } from 'lucide-react';
import { useWeb3 } from '@/hooks/useWeb3';
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';

export const Support = () => {
  const { isConnected } = useWeb3();
  const [donationAmount, setDonationAmount] = useState('');
  const [donating, setDonating] = useState(false);
  const { toast } = useToast();

  const activeCampaigns = [
    {
      title: "Gaza Medical Aid",
      description: "Emergency medical supplies for hospitals under attack",
      raised: 45000,
      goal: 100000,
      contributors: 892,
      timeLeft: "12 days",
      category: "Emergency Relief",
      urgent: true
    },
    {
      title: "Legal Defense Fund",
      description: "Supporting activists facing legal persecution",
      raised: 23000,
      goal: 50000,
      contributors: 340,
      timeLeft: "25 days",
      category: "Legal Support",
      urgent: false
    },
    {
      title: "Whistleblower Protection",
      description: "Safe house and legal support for those exposing corruption",
      raised: 67000,
      goal: 80000,
      contributors: 1234,
      timeLeft: "8 days",
      category: "Protection",
      urgent: true
    }
  ];

  const handleDonate = (campaignTitle: string) => {
    if (!donationAmount) {
      toast({
        title: "Please enter an amount",
        description: "Specify how much you'd like to donate",
        variant: "destructive"
      });
      return;
    }

    setDonating(true);
    setTimeout(() => {
      setDonating(false);
      toast({
        title: "Donation Sent",
        description: `Thank you for donating $${donationAmount} to ${campaignTitle}`,
      });
      setDonationAmount('');
    }, 2000);
  };

  if (!isConnected) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-subtle">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <Heart className="w-12 h-12 mx-auto text-primary mb-4" />
            <CardTitle>Connect Your Wallet</CardTitle>
            <CardDescription>
              Connect your wallet to support justice movements
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-subtle p-4">
      <div className="max-w-6xl mx-auto space-y-8">
        <div className="text-center space-y-4 pt-8">
          <h1 className="text-4xl font-bold text-gradient-cosmic">Fund Justice</h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Support movements fighting corruption and injustice. Your contributions are transparent, 
            traceable, and go directly to those who need them most.
          </p>
        </div>

        {/* Quick Donation */}
        <Card className="max-w-2xl mx-auto">
          <CardHeader className="text-center">
            <CardTitle className="flex items-center gap-2 justify-center">
              <DollarSign className="w-5 h-5" />
              Quick Donation
            </CardTitle>
            <CardDescription>
              Support all active campaigns with one donation
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <Input 
                type="number"
                placeholder="Amount in USD"
                value={donationAmount}
                onChange={(e) => setDonationAmount(e.target.value)}
                className="flex-1"
              />
              <Button 
                onClick={() => handleDonate('All Active Campaigns')}
                disabled={donating}
                variant="cosmic"
              >
                {donating ? 'Sending...' : 'Donate'}
              </Button>
            </div>
            <div className="flex justify-center gap-2">
              {['10', '25', '50', '100'].map((amount) => (
                <Button 
                  key={amount}
                  variant="cosmicOutline" 
                  size="sm"
                  onClick={() => setDonationAmount(amount)}
                >
                  ${amount}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Active Campaigns */}
        <div className="space-y-6">
          <h2 className="text-2xl font-semibold text-center">Active Campaigns</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {activeCampaigns.map((campaign, index) => (
              <Card key={index} className={`hover:border-primary/40 transition-colors ${campaign.urgent ? 'border-destructive/30' : ''}`}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <CardTitle className="text-lg">{campaign.title}</CardTitle>
                    {campaign.urgent && (
                      <Badge variant="destructive">Urgent</Badge>
                    )}
                  </div>
                  <CardDescription>{campaign.description}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>${campaign.raised.toLocaleString()} raised</span>
                      <span>${campaign.goal.toLocaleString()} goal</span>
                    </div>
                    <Progress 
                      value={(campaign.raised / campaign.goal) * 100} 
                      className="h-2"
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 text-center">
                    <div>
                      <div className="text-lg font-semibold">{campaign.contributors}</div>
                      <div className="text-xs text-muted-foreground">Contributors</div>
                    </div>
                    <div>
                      <div className="text-lg font-semibold">{campaign.timeLeft}</div>
                      <div className="text-xs text-muted-foreground">Time left</div>
                    </div>
                  </div>
                  
                  <Badge variant="outline" className="w-full justify-center">
                    {campaign.category}
                  </Badge>
                  
                  <div className="flex gap-2">
                    <Input 
                      type="number"
                      placeholder="$"
                      value={donationAmount}
                      onChange={(e) => setDonationAmount(e.target.value)}
                      className="flex-1"
                    />
                    <Button 
                      onClick={() => handleDonate(campaign.title)}
                      disabled={donating}
                      variant="cosmic"
                      size="sm"
                    >
                      Donate
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* How Funding Works */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="w-5 h-5" />
              How Funding Works
            </CardTitle>
            <CardDescription>
              Transparent, secure, and direct support for justice movements
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="text-center space-y-3">
                <div className="w-12 h-12 mx-auto bg-primary/10 rounded-full flex items-center justify-center">
                  <DollarSign className="w-6 h-6 text-primary" />
                </div>
                <h3 className="font-semibold">Direct Transfer</h3>
                <p className="text-sm text-muted-foreground">
                  Funds go directly to verified organizers via smart contracts
                </p>
              </div>
              
              <div className="text-center space-y-3">
                <div className="w-12 h-12 mx-auto bg-primary/10 rounded-full flex items-center justify-center">
                  <CheckCircle className="w-6 h-6 text-primary" />
                </div>
                <h3 className="font-semibold">Full Transparency</h3>
                <p className="text-sm text-muted-foreground">
                  Every transaction is recorded on the blockchain for public verification
                </p>
              </div>
              
              <div className="text-center space-y-3">
                <div className="w-12 h-12 mx-auto bg-primary/10 rounded-full flex items-center justify-center">
                  <Users className="w-6 h-6 text-primary" />
                </div>
                <h3 className="font-semibold">Community Oversight</h3>
                <p className="text-sm text-muted-foreground">
                  DAO governance ensures funds are used for their intended purpose
                </p>
              </div>
              
              <div className="text-center space-y-3">
                <div className="w-12 h-12 mx-auto bg-primary/10 rounded-full flex items-center justify-center">
                  <Clock className="w-6 h-6 text-primary" />
                </div>
                <h3 className="font-semibold">Rapid Deployment</h3>
                <p className="text-sm text-muted-foreground">
                  Emergency funding can be deployed within hours of approval
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Impact Statement */}
        <Card className="text-center">
          <CardHeader>
            <CardTitle>Your Impact</CardTitle>
            <CardDescription>
              Together, we're making a difference in the fight for justice
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div>
                <div className="text-3xl font-bold text-primary">$2.4M</div>
                <div className="text-sm text-muted-foreground">Total funds raised</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-primary">12,567</div>
                <div className="text-sm text-muted-foreground">People supported</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-primary">89</div>
                <div className="text-sm text-muted-foreground">Active campaigns</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};