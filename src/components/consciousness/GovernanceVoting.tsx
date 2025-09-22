import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useGovernance } from '@/hooks/useContracts';
import { useToast } from '@/hooks/use-toast';
import { ProposalCategory, VoteType } from '@/lib/contracts';
import { Vote, Users, TrendingUp, Calendar, CheckCircle, XCircle, Clock } from 'lucide-react';

const CATEGORY_INFO = {
  [ProposalCategory.PLATFORM_DEVELOPMENT]: {
    name: 'Platform Development',
    icon: TrendingUp,
    color: 'bg-blue-500',
    description: 'Improvements to platform features and functionality'
  },
  [ProposalCategory.CONSCIOUSNESS_RESEARCH]: {
    name: 'Consciousness Research',
    icon: Users,
    color: 'bg-purple-500',
    description: 'Research initiatives and consciousness studies'
  },
  [ProposalCategory.AI_MODEL_SELECTION]: {
    name: 'AI Model Selection',
    icon: Vote,
    color: 'bg-green-500',
    description: 'Selection and integration of new AI models'
  },
  [ProposalCategory.TREASURY_ALLOCATION]: {
    name: 'Treasury Allocation',
    icon: TrendingUp,
    color: 'bg-yellow-500',
    description: 'Allocation of platform treasury funds'
  },
  [ProposalCategory.GOVERNANCE_PARAMETER]: {
    name: 'Governance Parameters',
    icon: Vote,
    color: 'bg-red-500',
    description: 'Changes to governance rules and parameters'
  },
  [ProposalCategory.COMMUNITY_INITIATIVE]: {
    name: 'Community Initiative',
    icon: Users,
    color: 'bg-indigo-500',
    description: 'Community-driven projects and initiatives'
  },
  [ProposalCategory.PARTNERSHIP_PROPOSAL]: {
    name: 'Partnership Proposal',
    icon: Users,
    color: 'bg-pink-500',
    description: 'Strategic partnerships and collaborations'
  },
  [ProposalCategory.EMERGENCY_ACTION]: {
    name: 'Emergency Action',
    icon: Clock,
    color: 'bg-orange-500',
    description: 'Urgent actions requiring immediate attention'
  },
};

const VOTE_TYPE_INFO = {
  [VoteType.FOR]: { name: 'For', color: 'text-green-600', bgColor: 'bg-green-100' },
  [VoteType.AGAINST]: { name: 'Against', color: 'text-red-600', bgColor: 'bg-red-100' },
  [VoteType.ABSTAIN]: { name: 'Abstain', color: 'text-gray-600', bgColor: 'bg-gray-100' },
};

const PROPOSAL_STATUS = {
  0: { name: 'Draft', color: 'text-gray-600', bgColor: 'bg-gray-100' },
  1: { name: 'Active', color: 'text-blue-600', bgColor: 'bg-blue-100' },
  2: { name: 'Succeeded', color: 'text-green-600', bgColor: 'bg-green-100' },
  3: { name: 'Defeated', color: 'text-red-600', bgColor: 'bg-red-100' },
  4: { name: 'Executed', color: 'text-purple-600', bgColor: 'bg-purple-100' },
  5: { name: 'Expired', color: 'text-gray-600', bgColor: 'bg-gray-100' },
  6: { name: 'Cancelled', color: 'text-orange-600', bgColor: 'bg-orange-100' },
};

export const GovernanceVoting = () => {
  const { votingPower, createProposal, castVote, getProposal } = useGovernance();
  const { toast } = useToast();
  
  const [proposals, setProposals] = useState<any[]>([]);
  const [selectedProposal, setSelectedProposal] = useState<any>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [isVoting, setIsVoting] = useState(false);
  const [loading, setLoading] = useState(false);
  
  // Create proposal form
  const [newProposal, setNewProposal] = useState({
    category: ProposalCategory.PLATFORM_DEVELOPMENT,
    title: '',
    description: '',
    executionDetails: ''
  });

  // Vote form
  const [voteData, setVoteData] = useState({
    proposalId: 0,
    voteType: VoteType.FOR,
    reason: ''
  });

  useEffect(() => {
    loadProposals();
  }, []);

  const loadProposals = async () => {
    setLoading(true);
    try {
      // In a real implementation, this would fetch from the contract or indexer
      const mockProposals = [
        {
          id: 1,
          proposer: '0x742...abc',
          category: ProposalCategory.PLATFORM_DEVELOPMENT,
          title: 'Implement Advanced Consciousness Analytics',
          description: 'Add new analytics dashboard for tracking consciousness development patterns across users.',
          startTime: Date.now() / 1000 - 86400,
          endTime: Date.now() / 1000 + 86400 * 5,
          forVotes: '150000',
          againstVotes: '25000',
          abstainVotes: '10000',
          status: 1,
          isExecuted: false
        },
        {
          id: 2,
          proposer: '0x123...def',
          category: ProposalCategory.CONSCIOUSNESS_RESEARCH,
          title: 'Fund Meditation Impact Research Study',
          description: 'Allocate 50,000 CONS tokens to fund a 6-month research study on meditation\'s impact on leadership effectiveness.',
          startTime: Date.now() / 1000 - 172800,
          endTime: Date.now() / 1000 + 86400 * 3,
          forVotes: '200000',
          againstVotes: '15000',
          abstainVotes: '5000',
          status: 1,
          isExecuted: false
        }
      ];
      setProposals(mockProposals);
    } catch (error) {
      console.error('Error loading proposals:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateProposal = async () => {
    if (!newProposal.title || !newProposal.description) {
      toast({
        title: 'Missing Information',
        description: 'Please fill in all required fields',
        variant: 'destructive',
      });
      return;
    }

    setIsCreating(true);
    try {
      const tx = await createProposal(
        newProposal.category,
        newProposal.title,
        newProposal.description,
        newProposal.executionDetails
      );
      
      toast({
        title: 'Proposal Submitted',
        description: 'Your proposal has been submitted and is now pending review.',
      });

      await tx.wait();
      
      toast({
        title: 'Proposal Created!',
        description: 'Your proposal is now live and ready for voting.',
      });

      setNewProposal({
        category: ProposalCategory.PLATFORM_DEVELOPMENT,
        title: '',
        description: '',
        executionDetails: ''
      });

      await loadProposals();
    } catch (error: any) {
      console.error('Create proposal error:', error);
      toast({
        title: 'Proposal Creation Failed',
        description: error.message || 'Failed to create proposal',
        variant: 'destructive',
      });
    } finally {
      setIsCreating(false);
    }
  };

  const handleVote = async (proposalId: number, voteType: VoteType, reason: string) => {
    setIsVoting(true);
    try {
      const tx = await castVote(proposalId, voteType, reason);
      
      toast({
        title: 'Vote Submitted',
        description: 'Your vote has been submitted and is being processed.',
      });

      await tx.wait();
      
      toast({
        title: 'Vote Recorded!',
        description: `Your ${VOTE_TYPE_INFO[voteType].name} vote has been recorded.`,
      });

      await loadProposals();
    } catch (error: any) {
      console.error('Vote error:', error);
      toast({
        title: 'Vote Failed',
        description: error.message || 'Failed to cast vote',
        variant: 'destructive',
      });
    } finally {
      setIsVoting(false);
    }
  };

  const renderProposalCard = (proposal: any) => {
    const categoryInfo = CATEGORY_INFO[proposal.category];
    const statusInfo = PROPOSAL_STATUS[proposal.status];
    const Icon = categoryInfo.icon;
    
    const totalVotes = parseFloat(proposal.forVotes) + parseFloat(proposal.againstVotes) + parseFloat(proposal.abstainVotes);
    const forPercentage = totalVotes > 0 ? (parseFloat(proposal.forVotes) / totalVotes) * 100 : 0;
    const againstPercentage = totalVotes > 0 ? (parseFloat(proposal.againstVotes) / totalVotes) * 100 : 0;
    const abstainPercentage = totalVotes > 0 ? (parseFloat(proposal.abstainVotes) / totalVotes) * 100 : 0;
    
    const timeRemaining = Math.max(0, proposal.endTime - Date.now() / 1000);
    const daysRemaining = Math.ceil(timeRemaining / 86400);
    
    return (
      <Card key={proposal.id} className="cursor-pointer hover:shadow-md transition-shadow">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex items-center space-x-3">
              <div className={`p-2 rounded-lg ${categoryInfo.color} text-white`}>
                <Icon className="h-4 w-4" />
              </div>
              <div>
                <CardTitle className="text-lg">{proposal.title}</CardTitle>
                <div className="flex items-center space-x-2 mt-1">
                  <Badge variant="outline" className="text-xs">
                    {categoryInfo.name}
                  </Badge>
                  <Badge 
                    variant="secondary" 
                    className={`${statusInfo.color} ${statusInfo.bgColor} text-xs`}
                  >
                    {statusInfo.name}
                  </Badge>
                </div>
              </div>
            </div>
            <div className="text-right text-sm text-muted-foreground">
              <div>#{proposal.id}</div>
              {daysRemaining > 0 ? (
                <div className="flex items-center mt-1">
                  <Clock className="h-3 w-3 mr-1" />
                  {daysRemaining}d left
                </div>
              ) : (
                <div className="text-red-600">Ended</div>
              )}
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground line-clamp-3">
            {proposal.description}
          </p>
          
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>For ({forPercentage.toFixed(1)}%)</span>
              <span>{parseFloat(proposal.forVotes).toLocaleString()} votes</span>
            </div>
            <Progress value={forPercentage} className="h-2 bg-gray-200">
              <div className="bg-green-500 h-full rounded-full" style={{ width: `${forPercentage}%` }} />
            </Progress>
            
            <div className="flex justify-between text-sm">
              <span>Against ({againstPercentage.toFixed(1)}%)</span>
              <span>{parseFloat(proposal.againstVotes).toLocaleString()} votes</span>
            </div>
            <Progress value={againstPercentage} className="h-2 bg-gray-200">
              <div className="bg-red-500 h-full rounded-full" style={{ width: `${againstPercentage}%` }} />
            </Progress>
            
            {abstainPercentage > 0 && (
              <>
                <div className="flex justify-between text-sm">
                  <span>Abstain ({abstainPercentage.toFixed(1)}%)</span>
                  <span>{parseFloat(proposal.abstainVotes).toLocaleString()} votes</span>
                </div>
                <Progress value={abstainPercentage} className="h-2 bg-gray-200">
                  <div className="bg-gray-400 h-full rounded-full" style={{ width: `${abstainPercentage}%` }} />
                </Progress>
              </>
            )}
          </div>

          {proposal.status === 1 && daysRemaining > 0 && ( // Active proposals
            <div className="flex space-x-2">
              <Button
                size="sm"
                onClick={() => handleVote(proposal.id, VoteType.FOR, '')}
                disabled={isVoting}
                className="flex-1"
                data-testid={`button-vote-for-${proposal.id}`}
              >
                <CheckCircle className="h-4 w-4 mr-1" />
                Vote For
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleVote(proposal.id, VoteType.AGAINST, '')}
                disabled={isVoting}
                className="flex-1"
                data-testid={`button-vote-against-${proposal.id}`}
              >
                <XCircle className="h-4 w-4 mr-1" />
                Vote Against
              </Button>
            </div>
          )}
          
          <div className="flex justify-between text-xs text-muted-foreground pt-2 border-t">
            <span>Proposer: {proposal.proposer}</span>
            <span>Total: {totalVotes.toLocaleString()} votes</span>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="space-y-6" data-testid="governance-voting">
      {/* Voting Power Display */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Vote className="h-5 w-5" />
            <span>Your Voting Power</span>
          </CardTitle>
          <CardDescription>
            Your influence in platform governance decisions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <div className="text-2xl font-bold" data-testid="voting-power">
                {parseFloat(votingPower).toLocaleString()}
              </div>
              <p className="text-sm text-muted-foreground">Total Voting Power</p>
            </div>
            <div>
              <div className="text-2xl font-bold">0</div>
              <p className="text-sm text-muted-foreground">Active Votes</p>
            </div>
            <div>
              <div className="text-2xl font-bold">0</div>
              <p className="text-sm text-muted-foreground">Proposals Created</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Main Content */}
      <Tabs defaultValue="proposals" className="space-y-4">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="proposals">Active Proposals</TabsTrigger>
          <TabsTrigger value="create">Create Proposal</TabsTrigger>
        </TabsList>
        
        <TabsContent value="proposals" className="space-y-4">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                <p className="text-muted-foreground">Loading proposals...</p>
              </div>
            </div>
          ) : proposals.length === 0 ? (
            <div className="text-center py-12">
              <Vote className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">No Active Proposals</h3>
              <p className="text-muted-foreground mb-6">
                Be the first to create a proposal and shape the platform's future.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {proposals.map(renderProposalCard)}
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="create" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Create New Proposal</CardTitle>
              <CardDescription>
                Submit a proposal for the community to vote on
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Category</label>
                <Select 
                  value={newProposal.category.toString()} 
                  onValueChange={(value) => setNewProposal({...newProposal, category: parseInt(value)})}
                >
                  <SelectTrigger data-testid="select-proposal-category">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(CATEGORY_INFO).map(([key, category]) => (
                      <SelectItem key={key} value={key}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Title</label>
                <Input
                  placeholder="Enter proposal title"
                  value={newProposal.title}
                  onChange={(e) => setNewProposal({...newProposal, title: e.target.value})}
                  data-testid="input-proposal-title"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Description</label>
                <Textarea
                  placeholder="Describe your proposal in detail"
                  value={newProposal.description}
                  onChange={(e) => setNewProposal({...newProposal, description: e.target.value})}
                  rows={6}
                  data-testid="textarea-proposal-description"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Execution Details (Optional)</label>
                <Textarea
                  placeholder="Technical implementation details or IPFS hash"
                  value={newProposal.executionDetails}
                  onChange={(e) => setNewProposal({...newProposal, executionDetails: e.target.value})}
                  rows={3}
                  data-testid="textarea-execution-details"
                />
              </div>

              <div className="p-4 bg-muted rounded-lg">
                <h4 className="font-medium mb-2">Requirements</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Minimum staked tokens required to create proposals</li>
                  <li>• Proposals are subject to community voting</li>
                  <li>• Voting period lasts 7 days after creation</li>
                  <li>• Passed proposals require a 2-day execution delay</li>
                </ul>
              </div>

              <Button
                onClick={handleCreateProposal}
                disabled={isCreating || !newProposal.title || !newProposal.description}
                className="w-full"
                size="lg"
                data-testid="button-create-proposal"
              >
                {isCreating ? 'Creating Proposal...' : 'Create Proposal'}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};