import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { usePforkToken } from '@/hooks/useContracts';
import { useToast } from '@/hooks/use-toast';
import { Coins, TrendingUp, Clock, Zap } from 'lucide-react';

const LOCK_PERIODS = [
  { value: 0, label: 'Flexible (No Lock)', multiplier: 1 },
  { value: 30 * 24 * 60 * 60, label: '30 Days', multiplier: 1.1 },
  { value: 90 * 24 * 60 * 60, label: '90 Days', multiplier: 1.25 },
  { value: 365 * 24 * 60 * 60, label: '365 Days', multiplier: 1.5 },
];

export const TokenDashboard = () => {
  const { balance, stakedBalance, pendingRewards, votes, loading, stake, claimRewards, refetch } = usePforkToken();
  const { toast } = useToast();
  
  const [stakeAmount, setStakeAmount] = useState('');
  const [selectedLockPeriod, setSelectedLockPeriod] = useState('0');
  const [isStaking, setIsStaking] = useState(false);
  const [isClaiming, setIsClaiming] = useState(false);

  const selectedPeriod = LOCK_PERIODS.find(p => p.value.toString() === selectedLockPeriod);
  const estimatedReward = selectedPeriod && stakeAmount ? 
    (parseFloat(stakeAmount) * 0.05 * selectedPeriod.multiplier).toFixed(4) : '0';

  const handleStake = async () => {
    if (!stakeAmount || parseFloat(stakeAmount) <= 0) {
      toast({
        title: 'Invalid Amount',
        description: 'Please enter a valid staking amount',
        variant: 'destructive',
      });
      return;
    }

    setIsStaking(true);
    try {
      const tx = await stake(stakeAmount);
      
      toast({
        title: 'Staking Transaction Submitted',
        description: 'Your tokens are being staked. Please wait for confirmation.',
      });

      await tx.wait();
      
      toast({
        title: 'Staking Successful',
        description: `Successfully staked ${stakeAmount} PFORK → gPFORK`,
      });

      setStakeAmount('');
      await refetch();
    } catch (error: any) {
      console.error('Staking error:', error);
      toast({
        title: 'Staking Failed',
        description: error.message || 'Failed to stake tokens',
        variant: 'destructive',
      });
    } finally {
      setIsStaking(false);
    }
  };

  const handleClaimRewards = async () => {
    if (parseFloat(pendingRewards) <= 0) {
      toast({
        title: 'No Rewards',
        description: 'You have no pending rewards to claim',
        variant: 'destructive',
      });
      return;
    }

    setIsClaiming(true);
    try {
      const tx = await claimRewards();
      
      toast({
        title: 'Claim Transaction Submitted',
        description: 'Your rewards are being claimed. Please wait for confirmation.',
      });

      await tx.wait();
      
      toast({
        title: 'Rewards Claimed',
        description: `Successfully claimed ${pendingRewards} PFORK rewards`,
      });

      await refetch();
    } catch (error: any) {
      console.error('Claim error:', error);
      toast({
        title: 'Claim Failed',
        description: error.message || 'Failed to claim rewards',
        variant: 'destructive',
      });
    } finally {
      setIsClaiming(false);
    }
  };

  const totalBalance = parseFloat(balance) + parseFloat(stakedBalance);
  const stakingRatio = totalBalance > 0 ? (parseFloat(stakedBalance) / totalBalance) * 100 : 0;

  return (
    <div className="space-y-6" data-testid="token-dashboard">
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Available Balance</CardTitle>
            <Coins className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="available-balance">
              {parseFloat(balance).toFixed(4)} PFORK
            </div>
            <p className="text-xs text-muted-foreground">Ready to stake or use</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Staked Balance</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="staked-balance">
              {parseFloat(stakedBalance).toFixed(4)} gPFORK
            </div>
            <p className="text-xs text-muted-foreground">Earning rewards</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Rewards</CardTitle>
            <Zap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600" data-testid="pending-rewards">
              {parseFloat(pendingRewards).toFixed(4)} PFORK
            </div>
            <p className="text-xs text-muted-foreground">Ready to claim</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Staking Ratio</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="staking-ratio">
              {stakingRatio.toFixed(1)}%
            </div>
            <Progress value={stakingRatio} className="mt-2" />
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Staking Interface */}
        <Card>
          <CardHeader>
            <CardTitle>Stake PFORK → gPFORK</CardTitle>
            <CardDescription>
              Stake PFORK to receive gPFORK, earn rewards, and gain governance voting power
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="stake-amount">Amount to Stake</Label>
              <Input
                id="stake-amount"
                type="number"
                placeholder="Enter amount"
                value={stakeAmount}
                onChange={(e) => setStakeAmount(e.target.value)}
                disabled={isStaking}
                data-testid="input-stake-amount"
              />
              <p className="text-sm text-muted-foreground">
                PFORK Rewards Available: {parseFloat(balance).toFixed(4)} PFORK
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="lock-period">Lock Period</Label>
              <Select value={selectedLockPeriod} onValueChange={setSelectedLockPeriod}>
                <SelectTrigger data-testid="select-lock-period">
                  <SelectValue placeholder="Select lock period" />
                </SelectTrigger>
                <SelectContent>
                  {LOCK_PERIODS.map((period) => (
                    <SelectItem key={period.value} value={period.value.toString()}>
                      <div className="flex justify-between items-center w-full">
                        <span>{period.label}</span>
                        <Badge variant="secondary" className="ml-2">
                          {period.multiplier}x
                        </Badge>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {stakeAmount && (
              <div className="p-3 bg-muted rounded-lg">
                <p className="text-sm">
                  <strong>Estimated Annual Reward:</strong> {estimatedReward} PFORK
                </p>
                <p className="text-xs text-muted-foreground">
                  Based on 5% base APY with {selectedPeriod?.multiplier}x multiplier
                </p>
              </div>
            )}

            <Button
              onClick={handleStake}
              disabled={isStaking || !stakeAmount || parseFloat(stakeAmount) <= 0}
              className="w-full"
              data-testid="button-stake"
            >
              {isStaking ? 'Staking...' : 'Stake Tokens'}
            </Button>
          </CardContent>
        </Card>

        {/* Rewards Interface */}
        <Card>
          <CardHeader>
            <CardTitle>Rewards & Earnings</CardTitle>
            <CardDescription>
              Claim your staking rewards and track your earnings
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-center p-6 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-lg">
              <div className="text-3xl font-bold text-green-600 mb-2">
                {parseFloat(pendingRewards).toFixed(4)}
              </div>
              <p className="text-sm text-muted-foreground mb-4">PFORK Rewards Available</p>
              <Button
                onClick={handleClaimRewards}
                disabled={isClaiming || parseFloat(pendingRewards) <= 0}
                size="lg"
                data-testid="button-claim-rewards"
              >
                {isClaiming ? 'Claiming...' : 'Claim Rewards'}
              </Button>
            </div>

            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Current APY</span>
                <span className="text-sm font-medium">5.0%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Total Staked</span>
                <span className="text-sm font-medium">{parseFloat(stakedBalance).toFixed(4)} gPFORK</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Rewards Multiplier</span>
                <span className="text-sm font-medium">{selectedPeriod?.multiplier || 1}x</span>
              </div>
            </div>

            <div className="pt-4 border-t">
              <h4 className="font-medium mb-2">Benefits of Staking</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Earn 5% base APY on staked tokens</li>
                <li>• Gain governance voting power</li>
                <li>• Access premium platform features</li>
                <li>• Unlock enhanced AI services</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};