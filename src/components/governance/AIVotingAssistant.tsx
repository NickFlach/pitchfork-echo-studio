import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Brain, 
  Sparkles, 
  Shield, 
  AlertTriangle,
  CheckCircle2,
  XCircle,
  HelpCircle,
  Loader2,
  MessageSquare,
  Target,
  Scale,
  TrendingUp,
  Users,
  Zap,
  Settings2
} from 'lucide-react';
import { toast } from 'sonner';

interface ProposalAnalysis {
  id: string;
  title: string;
  summary: string;
  recommendation: 'for' | 'against' | 'abstain';
  confidence: number;
  reasoning: string[];
  risks: string[];
  benefits: string[];
  alignmentScore: number;
  impactAssessment: {
    governance: number;
    treasury: number;
    community: number;
    technical: number;
  };
  delegateConsensus?: {
    for: number;
    against: number;
    abstain: number;
  };
}

interface VotingPreferences {
  prioritizeDecentralization: boolean;
  prioritizeTreasury: boolean;
  prioritizeCommunity: boolean;
  riskTolerance: 'low' | 'medium' | 'high';
  delegateWeight: number;
}

// Mock proposals for demonstration
const mockProposals = [
  {
    id: '1',
    title: 'Increase Staking Rewards by 2%',
    description: 'Proposal to increase staking rewards from 5% to 7% APY to incentivize long-term holding and network security.',
    status: 'active',
  },
  {
    id: '2', 
    title: 'Fund Community Developer Grants',
    description: 'Allocate 500,000 tokens from treasury for developer grants over 12 months to accelerate ecosystem growth.',
    status: 'active',
  },
  {
    id: '3',
    title: 'Implement Quadratic Voting',
    description: 'Transition from 1-token-1-vote to quadratic voting to reduce whale influence in governance decisions.',
    status: 'active',
  },
];

export const AIVotingAssistant: React.FC = () => {
  const [selectedProposal, setSelectedProposal] = useState<string | null>(null);
  const [analysis, setAnalysis] = useState<ProposalAnalysis | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [customContext, setCustomContext] = useState('');
  const [autoVoteEnabled, setAutoVoteEnabled] = useState(false);
  const [preferences, setPreferences] = useState<VotingPreferences>({
    prioritizeDecentralization: true,
    prioritizeTreasury: false,
    prioritizeCommunity: true,
    riskTolerance: 'medium',
    delegateWeight: 30,
  });

  const analyzeProposal = async (proposalId: string) => {
    setIsAnalyzing(true);
    setSelectedProposal(proposalId);

    // Simulate AI analysis (in production, this would call the Lovable AI edge function)
    await new Promise(resolve => setTimeout(resolve, 2000));

    const proposal = mockProposals.find(p => p.id === proposalId);
    
    // Generate mock analysis based on proposal
    const mockAnalysis: ProposalAnalysis = {
      id: proposalId,
      title: proposal?.title || 'Unknown Proposal',
      summary: `This proposal ${proposal?.description?.toLowerCase() || 'aims to make changes to the protocol'}. Based on your preferences and historical voting patterns, I've analyzed the potential impact.`,
      recommendation: proposalId === '1' ? 'for' : proposalId === '2' ? 'for' : 'abstain',
      confidence: proposalId === '1' ? 85 : proposalId === '2' ? 72 : 45,
      reasoning: [
        'Aligns with your stated priority for community growth',
        'Historical precedent shows similar proposals succeed 78% of the time',
        'Economic modeling suggests positive long-term impact',
        preferences.prioritizeDecentralization ? 'Supports decentralization goals' : 'May concentrate power slightly',
      ],
      risks: [
        'Short-term treasury impact of approximately 3%',
        'Requires coordination across multiple stakeholders',
        'Implementation timeline may face delays',
      ],
      benefits: [
        'Increased community engagement expected',
        'Strengthens protocol security model',
        'Attracts new participants to the ecosystem',
        'Sets positive precedent for future governance',
      ],
      alignmentScore: preferences.prioritizeCommunity ? 82 : 65,
      impactAssessment: {
        governance: 75,
        treasury: proposalId === '2' ? 45 : 80,
        community: 90,
        technical: 60,
      },
      delegateConsensus: {
        for: 62,
        against: 28,
        abstain: 10,
      },
    };

    setAnalysis(mockAnalysis);
    setIsAnalyzing(false);
    toast.success('Analysis complete', {
      description: `AI recommends voting ${mockAnalysis.recommendation.toUpperCase()} with ${mockAnalysis.confidence}% confidence`,
    });
  };

  const executeVote = (vote: 'for' | 'against' | 'abstain') => {
    toast.success('Vote submitted privately', {
      description: `Your ${vote.toUpperCase()} vote has been encrypted and submitted using ZK proofs.`,
    });
    setAnalysis(null);
    setSelectedProposal(null);
  };

  const getRecommendationColor = (rec: string) => {
    switch (rec) {
      case 'for': return 'text-green-500';
      case 'against': return 'text-red-500';
      default: return 'text-yellow-500';
    }
  };

  const getRecommendationIcon = (rec: string) => {
    switch (rec) {
      case 'for': return <CheckCircle2 className="h-5 w-5 text-green-500" />;
      case 'against': return <XCircle className="h-5 w-5 text-red-500" />;
      default: return <HelpCircle className="h-5 w-5 text-yellow-500" />;
    }
  };

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      {/* Preferences Panel */}
      <Card className="lg:col-span-1">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings2 className="h-5 w-5" />
            Voting Preferences
          </CardTitle>
          <CardDescription>
            Configure how the AI should weigh different factors
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="decentralization" className="flex items-center gap-2">
                <Shield className="h-4 w-4 text-primary" />
                Prioritize Decentralization
              </Label>
              <Switch
                id="decentralization"
                checked={preferences.prioritizeDecentralization}
                onCheckedChange={(checked) => 
                  setPreferences(p => ({ ...p, prioritizeDecentralization: checked }))
                }
              />
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="treasury" className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-primary" />
                Prioritize Treasury Health
              </Label>
              <Switch
                id="treasury"
                checked={preferences.prioritizeTreasury}
                onCheckedChange={(checked) => 
                  setPreferences(p => ({ ...p, prioritizeTreasury: checked }))
                }
              />
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="community" className="flex items-center gap-2">
                <Users className="h-4 w-4 text-primary" />
                Prioritize Community
              </Label>
              <Switch
                id="community"
                checked={preferences.prioritizeCommunity}
                onCheckedChange={(checked) => 
                  setPreferences(p => ({ ...p, prioritizeCommunity: checked }))
                }
              />
            </div>
          </div>

          <Separator />

          <div className="space-y-3">
            <Label className="text-sm">Risk Tolerance</Label>
            <div className="flex gap-2">
              {(['low', 'medium', 'high'] as const).map((level) => (
                <Button
                  key={level}
                  variant={preferences.riskTolerance === level ? 'default' : 'outline'}
                  size="sm"
                  className="flex-1 capitalize"
                  onClick={() => setPreferences(p => ({ ...p, riskTolerance: level }))}
                >
                  {level}
                </Button>
              ))}
            </div>
          </div>

          <Separator />

          <div className="space-y-3">
            <Label className="text-sm">Delegate Consensus Weight: {preferences.delegateWeight}%</Label>
            <input
              type="range"
              min="0"
              max="100"
              value={preferences.delegateWeight}
              onChange={(e) => setPreferences(p => ({ ...p, delegateWeight: parseInt(e.target.value) }))}
              className="w-full"
            />
            <p className="text-xs text-muted-foreground">
              How much to consider how trusted delegates are voting
            </p>
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="auto-vote" className="flex items-center gap-2">
                <Zap className="h-4 w-4 text-yellow-500" />
                Auto-Vote Mode
              </Label>
              <p className="text-xs text-muted-foreground mt-1">
                AI votes automatically when confidence {'>'} 80%
              </p>
            </div>
            <Switch
              id="auto-vote"
              checked={autoVoteEnabled}
              onCheckedChange={setAutoVoteEnabled}
            />
          </div>

          {autoVoteEnabled && (
            <div className="p-3 rounded-lg bg-yellow-500/10 border border-yellow-500/20">
              <p className="text-xs text-yellow-600 dark:text-yellow-400">
                ⚠️ Auto-voting is enabled. AI will submit ZK-private votes on your behalf for high-confidence recommendations.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Main Analysis Panel */}
      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5" />
            AI Voting Assistant
          </CardTitle>
          <CardDescription>
            Get AI-powered analysis and recommendations for governance proposals
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Proposal Selection */}
          <div className="space-y-3">
            <Label>Select a Proposal to Analyze</Label>
            <div className="grid gap-3">
              {mockProposals.map((proposal) => (
                <button
                  key={proposal.id}
                  onClick={() => analyzeProposal(proposal.id)}
                  disabled={isAnalyzing}
                  className={`p-4 rounded-lg border text-left transition-all hover:border-primary/50 ${
                    selectedProposal === proposal.id 
                      ? 'border-primary bg-primary/5' 
                      : 'border-border'
                  }`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h4 className="font-medium">{proposal.title}</h4>
                      <p className="text-sm text-muted-foreground mt-1">
                        {proposal.description}
                      </p>
                    </div>
                    <Badge variant="outline">{proposal.status}</Badge>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Custom Context */}
          <div className="space-y-2">
            <Label htmlFor="context">Additional Context (Optional)</Label>
            <Textarea
              id="context"
              placeholder="Add any personal values, concerns, or context you'd like the AI to consider..."
              value={customContext}
              onChange={(e) => setCustomContext(e.target.value)}
              className="min-h-[80px]"
            />
          </div>

          {/* Loading State */}
          {isAnalyzing && (
            <div className="flex flex-col items-center justify-center py-12 space-y-4">
              <div className="relative">
                <Loader2 className="h-12 w-12 animate-spin text-primary" />
                <Sparkles className="h-6 w-6 text-primary absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
              </div>
              <div className="text-center">
                <p className="font-medium">Analyzing proposal...</p>
                <p className="text-sm text-muted-foreground">
                  Evaluating against your preferences and historical data
                </p>
              </div>
            </div>
          )}

          {/* Analysis Results */}
          {analysis && !isAnalyzing && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
              {/* Recommendation Header */}
              <div className="p-4 rounded-xl bg-gradient-to-r from-primary/10 to-primary/5 border border-primary/20">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {getRecommendationIcon(analysis.recommendation)}
                    <div>
                      <p className="text-sm text-muted-foreground">AI Recommendation</p>
                      <p className={`text-xl font-bold uppercase ${getRecommendationColor(analysis.recommendation)}`}>
                        Vote {analysis.recommendation}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-muted-foreground">Confidence</p>
                    <p className="text-2xl font-bold">{analysis.confidence}%</p>
                  </div>
                </div>
                <Progress value={analysis.confidence} className="mt-3" />
              </div>

              {/* Summary */}
              <div className="space-y-2">
                <h4 className="font-medium flex items-center gap-2">
                  <MessageSquare className="h-4 w-4" />
                  Analysis Summary
                </h4>
                <p className="text-sm text-muted-foreground">{analysis.summary}</p>
              </div>

              {/* Impact Assessment */}
              <div className="space-y-3">
                <h4 className="font-medium flex items-center gap-2">
                  <Target className="h-4 w-4" />
                  Impact Assessment
                </h4>
                <div className="grid grid-cols-2 gap-4">
                  {Object.entries(analysis.impactAssessment).map(([key, value]) => (
                    <div key={key} className="space-y-1">
                      <div className="flex justify-between text-sm">
                        <span className="capitalize">{key}</span>
                        <span className="text-muted-foreground">{value}%</span>
                      </div>
                      <Progress value={value} className="h-2" />
                    </div>
                  ))}
                </div>
              </div>

              {/* Reasoning */}
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <h4 className="font-medium text-green-600 flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4" />
                    Benefits
                  </h4>
                  <ScrollArea className="h-[120px]">
                    <ul className="space-y-2">
                      {analysis.benefits.map((benefit, i) => (
                        <li key={i} className="text-sm flex items-start gap-2">
                          <span className="text-green-500 mt-1">•</span>
                          {benefit}
                        </li>
                      ))}
                    </ul>
                  </ScrollArea>
                </div>
                <div className="space-y-2">
                  <h4 className="font-medium text-red-600 flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4" />
                    Risks
                  </h4>
                  <ScrollArea className="h-[120px]">
                    <ul className="space-y-2">
                      {analysis.risks.map((risk, i) => (
                        <li key={i} className="text-sm flex items-start gap-2">
                          <span className="text-red-500 mt-1">•</span>
                          {risk}
                        </li>
                      ))}
                    </ul>
                  </ScrollArea>
                </div>
              </div>

              {/* Delegate Consensus */}
              {analysis.delegateConsensus && (
                <div className="space-y-3">
                  <h4 className="font-medium flex items-center gap-2">
                    <Scale className="h-4 w-4" />
                    Delegate Consensus
                  </h4>
                  <div className="flex gap-2">
                    <div className="flex-1 p-3 rounded-lg bg-green-500/10 text-center">
                      <p className="text-2xl font-bold text-green-600">{analysis.delegateConsensus.for}%</p>
                      <p className="text-xs text-muted-foreground">For</p>
                    </div>
                    <div className="flex-1 p-3 rounded-lg bg-red-500/10 text-center">
                      <p className="text-2xl font-bold text-red-600">{analysis.delegateConsensus.against}%</p>
                      <p className="text-xs text-muted-foreground">Against</p>
                    </div>
                    <div className="flex-1 p-3 rounded-lg bg-yellow-500/10 text-center">
                      <p className="text-2xl font-bold text-yellow-600">{analysis.delegateConsensus.abstain}%</p>
                      <p className="text-xs text-muted-foreground">Abstain</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Alignment Score */}
              <div className="p-4 rounded-lg border border-primary/20 bg-primary/5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Preference Alignment</p>
                    <p className="text-sm text-muted-foreground">
                      How well this vote aligns with your configured preferences
                    </p>
                  </div>
                  <div className="text-3xl font-bold text-primary">
                    {analysis.alignmentScore}%
                  </div>
                </div>
              </div>

              {/* Vote Actions */}
              <div className="flex gap-3 pt-4">
                <Button 
                  className="flex-1 bg-green-600 hover:bg-green-700"
                  onClick={() => executeVote('for')}
                >
                  <CheckCircle2 className="h-4 w-4 mr-2" />
                  Vote For (Private)
                </Button>
                <Button 
                  className="flex-1 bg-red-600 hover:bg-red-700"
                  onClick={() => executeVote('against')}
                >
                  <XCircle className="h-4 w-4 mr-2" />
                  Vote Against (Private)
                </Button>
                <Button 
                  variant="outline"
                  className="flex-1"
                  onClick={() => executeVote('abstain')}
                >
                  <HelpCircle className="h-4 w-4 mr-2" />
                  Abstain
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
