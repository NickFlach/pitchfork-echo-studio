import React from 'react';
import Navigation from '@/components/Navigation';
import { PowerDistributionChart } from '@/components/decentralization/PowerDistributionChart';
import { ConcentrationGauge } from '@/components/decentralization/ConcentrationGauge';
import { DiffusionRateCard } from '@/components/decentralization/DiffusionRateCard';
import { BalanceOfPowerTriangle } from '@/components/decentralization/BalanceOfPowerTriangle';
import { TopHoldersTable } from '@/components/decentralization/TopHoldersTable';
import { DecentralizationScore } from '@/components/decentralization/DecentralizationScore';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Scale, TrendingUp, Shield, Users } from 'lucide-react';

const DecentralizationDashboard: React.FC = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <main className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Scale className="h-8 w-8 text-primary" />
            <h1 className="text-3xl md:text-4xl font-bold text-gradient-cosmic">
              Balance of Power
            </h1>
          </div>
          <p className="text-muted-foreground max-w-2xl">
            Real-time monitoring of power distribution, concentration metrics, and diffusion rates 
            across the Pitchfork Protocol governance ecosystem.
          </p>
        </div>

        {/* Overall Health Score */}
        <div className="grid gap-6 md:grid-cols-4 mb-8">
          <DecentralizationScore />
          
          <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
            <CardHeader className="pb-2">
              <CardDescription className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                Active Participants
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">2,847</div>
              <p className="text-xs text-muted-foreground mt-1">
                <span className="text-green-400">+12.4%</span> vs last epoch
              </p>
            </CardContent>
          </Card>
          
          <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
            <CardHeader className="pb-2">
              <CardDescription className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4" />
                Diffusion Rate
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">73.2%</div>
              <p className="text-xs text-muted-foreground mt-1">
                Target: 80%
              </p>
            </CardContent>
          </Card>
          
          <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
            <CardHeader className="pb-2">
              <CardDescription className="flex items-center gap-2">
                <Shield className="h-4 w-4" />
                Veto Threshold
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">15%</div>
              <p className="text-xs text-muted-foreground mt-1">
                Stakeholder protection active
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="bg-muted/50">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="concentration">Concentration</TabsTrigger>
            <TabsTrigger value="diffusion">Diffusion</TabsTrigger>
            <TabsTrigger value="holders">Top Holders</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid gap-6 lg:grid-cols-2">
              <BalanceOfPowerTriangle />
              <PowerDistributionChart />
            </div>
            <div className="grid gap-6 md:grid-cols-3">
              <DiffusionRateCard 
                title="Governance Power" 
                current={68} 
                target={80} 
                trend="up"
              />
              <DiffusionRateCard 
                title="Token Distribution" 
                current={54} 
                target={75} 
                trend="stable"
              />
              <DiffusionRateCard 
                title="Proposal Participation" 
                current={82} 
                target={70} 
                trend="up"
              />
            </div>
          </TabsContent>

          <TabsContent value="concentration" className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              <ConcentrationGauge 
                label="Nakamoto Coefficient" 
                value={12} 
                maxValue={50}
                description="Minimum entities to control 51%"
                status="healthy"
              />
              <ConcentrationGauge 
                label="Gini Coefficient" 
                value={0.42} 
                maxValue={1}
                description="Lower is more equal (0-1)"
                status="moderate"
              />
              <ConcentrationGauge 
                label="Top 10 Concentration" 
                value={34} 
                maxValue={100}
                description="% held by top 10 holders"
                status="healthy"
              />
            </div>
            
            <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-lg">Concentration Alerts</CardTitle>
                <CardDescription>
                  Automated monitoring for power concentration thresholds
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                    <div className="flex items-center gap-3">
                      <Badge variant="outline" className="bg-green-500/10 text-green-400 border-green-500/30">
                        Healthy
                      </Badge>
                      <span className="text-sm">No single entity exceeds 5% threshold</span>
                    </div>
                    <span className="text-xs text-muted-foreground">Last check: 2 min ago</span>
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                    <div className="flex items-center gap-3">
                      <Badge variant="outline" className="bg-green-500/10 text-green-400 border-green-500/30">
                        Healthy
                      </Badge>
                      <span className="text-sm">Nakamoto coefficient above minimum (12 &gt; 7)</span>
                    </div>
                    <span className="text-xs text-muted-foreground">Last check: 2 min ago</span>
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                    <div className="flex items-center gap-3">
                      <Badge variant="outline" className="bg-yellow-500/10 text-yellow-400 border-yellow-500/30">
                        Warning
                      </Badge>
                      <span className="text-sm">Delegation concentration trending up (+2.1%)</span>
                    </div>
                    <span className="text-xs text-muted-foreground">Last check: 2 min ago</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="diffusion" className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="text-lg">Power Diffusion Mechanisms</CardTitle>
                  <CardDescription>
                    Active mechanisms spreading power across participants
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Quadratic Voting</p>
                      <p className="text-sm text-muted-foreground">Reduces whale dominance</p>
                    </div>
                    <Badge className="bg-primary/20 text-primary">Active</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Conviction Decay</p>
                      <p className="text-sm text-muted-foreground">Time-weighted voting power</p>
                    </div>
                    <Badge className="bg-primary/20 text-primary">Active</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Delegation Caps</p>
                      <p className="text-sm text-muted-foreground">Max 5% per delegate</p>
                    </div>
                    <Badge className="bg-primary/20 text-primary">Active</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Stake Lock Incentives</p>
                      <p className="text-sm text-muted-foreground">Rewards long-term holders</p>
                    </div>
                    <Badge variant="outline" className="text-muted-foreground">Proposed</Badge>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="text-lg">Diffusion Velocity</CardTitle>
                  <CardDescription>
                    Rate of power redistribution over time
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div>
                      <div className="flex justify-between mb-2">
                        <span className="text-sm">Last 24 hours</span>
                        <span className="text-sm font-medium text-green-400">+0.8%</span>
                      </div>
                      <div className="h-2 rounded-full bg-muted overflow-hidden">
                        <div className="h-full w-[72%] bg-gradient-to-r from-primary to-accent rounded-full" />
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between mb-2">
                        <span className="text-sm">Last 7 days</span>
                        <span className="text-sm font-medium text-green-400">+3.2%</span>
                      </div>
                      <div className="h-2 rounded-full bg-muted overflow-hidden">
                        <div className="h-full w-[68%] bg-gradient-to-r from-primary to-accent rounded-full" />
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between mb-2">
                        <span className="text-sm">Last 30 days</span>
                        <span className="text-sm font-medium text-green-400">+8.7%</span>
                      </div>
                      <div className="h-2 rounded-full bg-muted overflow-hidden">
                        <div className="h-full w-[65%] bg-gradient-to-r from-primary to-accent rounded-full" />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="holders">
            <TopHoldersTable />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default DecentralizationDashboard;
