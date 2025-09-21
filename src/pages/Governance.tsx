import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Vote as VoteIcon, 
  Users, 
  Clock, 
  CheckCircle, 
  XCircle, 
  AlertCircle,
  Plus,
  Scale,
  Target,
  Calendar
} from 'lucide-react';
import { useWeb3 } from '@/hooks/useWeb3';
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { governanceApi, identityApi } from '@/lib/api';
import { Proposal, Vote } from '../../shared/schema';

const Governance = () => {
  const { isConnected, account } = useWeb3();
  const [activeTab, setActiveTab] = useState('proposals');
  const [showCreateProposal, setShowCreateProposal] = useState(false);
  const [newProposal, setNewProposal] = useState({
    title: '',
    description: '',
    proposalType: 'policy' as 'policy' | 'funding' | 'platform' | 'movement' | 'emergency',
    votingPeriodDays: 7,
    quorumRequired: 10,
    passingThreshold: 60,
  });
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch user identity for verification
  const { data: identity } = useQuery({
    queryKey: ['identity', account],
    queryFn: async () => {
      if (!account) return null;
      return await identityApi.getByWallet(account);
    },
    enabled: !!account,
  });

  // Fetch all proposals
  const { data: proposals = [], isLoading: proposalsLoading } = useQuery({
    queryKey: ['proposals'],
    queryFn: async () => await governanceApi.getProposals(),
  });

  // Fetch user's draft proposals separately for privacy
  const { data: userDrafts = [] } = useQuery({
    queryKey: ['user-drafts', account],
    queryFn: async () => {
      if (!account) return [];
      return await governanceApi.getDraftProposals(account);
    },
    enabled: !!account,
  });

  // Get active proposals (currently voting) and completed proposals
  const activeProposals = proposals.filter(p => p.status === 'active');
  const completedProposals = proposals.filter(p => ['passed', 'rejected'].includes(p.status));

  // Create proposal mutation
  const createProposalMutation = useMutation({
    mutationFn: async () => {
      if (!account) throw new Error('No account connected');
      if (!identity || identity.verificationLevel === 'none') {
        throw new Error('Basic verification required to create proposals');
      }

      const votingStartsAt = new Date().toISOString();
      const votingEndsAt = new Date(
        Date.now() + newProposal.votingPeriodDays * 24 * 60 * 60 * 1000
      ).toISOString();

      return await governanceApi.createProposal({
        title: newProposal.title,
        description: newProposal.description,
        proposalType: newProposal.proposalType,
        proposer: account,
        votingStartsAt,
        votingEndsAt,
        quorumRequired: newProposal.quorumRequired,
        passingThreshold: newProposal.passingThreshold,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['proposals'] });
      setShowCreateProposal(false);
      setNewProposal({
        title: '',
        description: '',
        proposalType: 'policy',
        votingPeriodDays: 7,
        quorumRequired: 10,
        passingThreshold: 60,
      });
      toast({
        title: "Proposal Created",
        description: "Your proposal is ready for community voting",
      });
    },
    onError: (error) => {
      toast({
        title: "Failed to Create Proposal",
        description: error.message,
        variant: "destructive"
      });
    },
  });

  // Vote on proposal mutation
  const voteMutation = useMutation({
    mutationFn: async ({ proposalId, voteChoice, reason }: { 
      proposalId: string; 
      voteChoice: 'yes' | 'no' | 'abstain';
      reason?: string;
    }) => {
      if (!account) throw new Error('No account connected');
      
      return await governanceApi.submitVote({
        proposalId,
        voterAddress: account,
        voteChoice,
        votingPower: 1,
        reason,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['proposals'] });
      toast({
        title: "Vote Submitted",
        description: "Your voice has been counted in the democratic process",
      });
    },
    onError: (error) => {
      toast({
        title: "Voting Failed",
        description: error.message,
        variant: "destructive"
      });
    },
  });

  // Activate proposal mutation (draft -> active)
  const activateProposalMutation = useMutation({
    mutationFn: async (proposalId: string) => {
      return await governanceApi.activateProposal(proposalId, account);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['proposals'] });
      queryClient.invalidateQueries({ queryKey: ['user-drafts'] });
      toast({
        title: "Proposal Activated",
        description: "Voting is now open for this proposal",
      });
    },
  });

  if (!isConnected) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-subtle">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <Scale className="w-12 h-12 mx-auto text-primary mb-4" />
            <CardTitle>Connect Your Wallet</CardTitle>
            <CardDescription>
              Connect your wallet to participate in governance
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-subtle p-4">
      <div className="max-w-6xl mx-auto">
        <div className="text-center space-y-4 pt-8 pb-8">
          <h1 className="text-4xl font-bold text-gradient-cosmic">DAO Governance</h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Democratic decision-making for the future of activism. 
            Every verified member has a voice in shaping our movement.
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="proposals">Active Proposals</TabsTrigger>
            <TabsTrigger value="history">Voting History</TabsTrigger>
            <TabsTrigger value="create">Create Proposal</TabsTrigger>
          </TabsList>

          {/* Active Proposals */}
          <TabsContent value="proposals" className="space-y-4">
            {proposalsLoading ? (
              <div className="text-center py-8">
                <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
              </div>
            ) : (
              <>
                {/* Draft Proposals (for proposer only) */}
                {userDrafts.length > 0 && (
                  <div className="space-y-4">
                    <h2 className="text-lg font-semibold text-muted-foreground">Your Draft Proposals</h2>
                    {userDrafts.map((proposal) => (
                      <DraftProposalCard 
                        key={proposal.id} 
                        proposal={proposal} 
                        onActivate={activateProposalMutation.mutate}
                        canActivate={true}
                      />
                    ))}
                  </div>
                )}

                {/* Active Proposals */}
                {activeProposals.length === 0 && userDrafts.length === 0 ? (
                  <Card>
                    <CardContent className="text-center py-12">
                      <VoteIcon className="w-16 h-16 mx-auto text-muted-foreground/50 mb-4" />
                      <h3 className="text-lg font-semibold mb-2">No Active Proposals</h3>
                      <p className="text-muted-foreground mb-4">
                        There are currently no proposals open for voting
                      </p>
                      <Button 
                        onClick={() => setActiveTab('create')}
                        variant="cosmic"
                      >
                        Create First Proposal
                      </Button>
                    </CardContent>
                  </Card>
                ) : (
                  <>
                    {activeProposals.length > 0 && (
                      <div className="space-y-4">
                        <h2 className="text-lg font-semibold text-muted-foreground">Active Voting</h2>
                        {activeProposals.map((proposal) => (
                          <ProposalCard 
                            key={proposal.id} 
                            proposal={proposal} 
                            onVote={voteMutation.mutate}
                            userAccount={account}
                            canVote={!!identity && identity.verificationLevel !== 'none'}
                          />
                        ))}
                      </div>
                    )}
                  </>
                )}
              </>
            )}
          </TabsContent>

          {/* Voting History */}
          <TabsContent value="history" className="space-y-4">
            {completedProposals.length === 0 ? (
              <Card>
                <CardContent className="text-center py-12">
                  <Clock className="w-16 h-16 mx-auto text-muted-foreground/50 mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No Completed Proposals</h3>
                  <p className="text-muted-foreground">
                    Completed proposals will appear here
                  </p>
                </CardContent>
              </Card>
            ) : (
              completedProposals.map((proposal) => (
                <ProposalHistoryCard key={proposal.id} proposal={proposal} />
              ))
            )}
          </TabsContent>

          {/* Create Proposal */}
          <TabsContent value="create">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Plus className="w-5 h-5" />
                  Create New Proposal
                </CardTitle>
                <CardDescription>
                  Propose changes, initiatives, or funding requests to the community
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {!identity || identity.verificationLevel === 'none' ? (
                  <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-4">
                    <div className="flex items-center gap-2 text-yellow-600 dark:text-yellow-400">
                      <AlertCircle className="w-5 h-5" />
                      <p className="font-medium">Verification Required</p>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">
                      You need at least basic verification to create proposals. 
                      Visit the Identity page to get verified.
                    </p>
                  </div>
                ) : (
                  <>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Proposal Title</label>
                      <Input
                        value={newProposal.title}
                        onChange={(e) => setNewProposal({ ...newProposal, title: e.target.value })}
                        placeholder="e.g., Implement Emergency Response Protocol"
                        data-testid="input-proposal-title"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium">Description</label>
                      <Textarea
                        value={newProposal.description}
                        onChange={(e) => setNewProposal({ ...newProposal, description: e.target.value })}
                        placeholder="Describe the proposal, its benefits, and implementation details..."
                        className="min-h-[100px]"
                        data-testid="textarea-proposal-description"
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Proposal Type</label>
                        <Select
                          value={newProposal.proposalType}
                          onValueChange={(value: any) => setNewProposal({ ...newProposal, proposalType: value })}
                        >
                          <SelectTrigger data-testid="select-proposal-type">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="policy">Policy Change</SelectItem>
                            <SelectItem value="funding">Funding Request</SelectItem>
                            <SelectItem value="platform">Platform Improvement</SelectItem>
                            <SelectItem value="movement">Movement Initiative</SelectItem>
                            <SelectItem value="emergency">Emergency Action</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm font-medium">Voting Period (Days)</label>
                        <Input
                          type="number"
                          value={newProposal.votingPeriodDays}
                          onChange={(e) => setNewProposal({ ...newProposal, votingPeriodDays: parseInt(e.target.value) })}
                          min={1}
                          max={30}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Minimum Votes (Quorum)</label>
                        <Input
                          type="number"
                          value={newProposal.quorumRequired}
                          onChange={(e) => setNewProposal({ ...newProposal, quorumRequired: parseInt(e.target.value) })}
                          min={1}
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm font-medium">Passing Threshold (%)</label>
                        <Input
                          type="number"
                          value={newProposal.passingThreshold}
                          onChange={(e) => setNewProposal({ ...newProposal, passingThreshold: parseInt(e.target.value) })}
                          min={50}
                          max={100}
                        />
                      </div>
                    </div>

                    <Button 
                      onClick={() => createProposalMutation.mutate()}
                      disabled={!newProposal.title.trim() || !newProposal.description.trim() || createProposalMutation.isPending}
                      variant="cosmic"
                      className="w-full"
                      data-testid="button-create-proposal"
                    >
                      {createProposalMutation.isPending ? 'Creating...' : 'Create Proposal'}
                    </Button>
                  </>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Governance Stats */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="w-5 h-5" />
              Governance Overview
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="text-center space-y-2">
                <div className="text-2xl font-bold text-primary">{proposals.length}</div>
                <p className="text-sm text-muted-foreground">Total Proposals</p>
              </div>
              
              <div className="text-center space-y-2">
                <div className="text-2xl font-bold text-primary">{activeProposals.length}</div>
                <p className="text-sm text-muted-foreground">Active Votes</p>
              </div>
              
              <div className="text-center space-y-2">
                <div className="text-2xl font-bold text-primary">
                  {proposals.filter(p => p.status === 'passed').length}
                </div>
                <p className="text-sm text-muted-foreground">Passed Proposals</p>
              </div>
              
              <div className="text-center space-y-2">
                <div className="text-2xl font-bold text-primary">
                  {identity?.verificationLevel !== 'none' ? '✓' : '✗'}
                </div>
                <p className="text-sm text-muted-foreground">Can Vote</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

// Individual proposal card for voting
const ProposalCard = ({ 
  proposal, 
  onVote, 
  userAccount, 
  canVote 
}: { 
  proposal: Proposal; 
  onVote: (data: { proposalId: string; voteChoice: 'yes' | 'no' | 'abstain'; reason?: string }) => void;
  userAccount?: string;
  canVote: boolean;
}) => {
  const [selectedVote, setSelectedVote] = useState<'yes' | 'no' | 'abstain' | null>(null);
  const [voteReason, setVoteReason] = useState('');

  // Check if user already voted
  const { data: userVote } = useQuery({
    queryKey: ['user-vote', proposal.id, userAccount],
    queryFn: async () => {
      if (!userAccount) return null;
      return await governanceApi.getUserVote(proposal.id, userAccount);
    },
    enabled: !!userAccount,
  });

  const totalVotes = proposal.totalVotes;
  const yesPercentage = totalVotes > 0 ? (proposal.yesVotes / totalVotes) * 100 : 0;
  const noPercentage = totalVotes > 0 ? (proposal.noVotes / totalVotes) * 100 : 0;

  const votingEndsAt = new Date(proposal.votingEndsAt);
  const timeLeft = votingEndsAt.getTime() - Date.now();
  const daysLeft = Math.max(0, Math.ceil(timeLeft / (1000 * 60 * 60 * 24)));

  const getProposalTypeColor = (type: string) => {
    switch (type) {
      case 'emergency': return 'destructive';
      case 'funding': return 'secondary';
      case 'policy': return 'default';
      default: return 'outline';
    }
  };

  return (
    <Card data-testid={`proposal-${proposal.id}`}>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Badge variant={getProposalTypeColor(proposal.proposalType)}>
                {proposal.proposalType}
              </Badge>
              <Badge variant="outline" className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {daysLeft} days left
              </Badge>
            </div>
            <CardTitle className="text-xl">{proposal.title}</CardTitle>
          </div>
        </div>
        <CardDescription>{proposal.description}</CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Voting Results */}
        <div className="space-y-3">
          <div className="flex justify-between text-sm">
            <span>Yes ({proposal.yesVotes})</span>
            <span>{yesPercentage.toFixed(1)}%</span>
          </div>
          <Progress value={yesPercentage} className="h-2" />
          
          <div className="flex justify-between text-sm">
            <span>No ({proposal.noVotes})</span>
            <span>{noPercentage.toFixed(1)}%</span>
          </div>
          <Progress value={noPercentage} className="h-2" />
          
          <div className="text-xs text-muted-foreground">
            {totalVotes} / {proposal.quorumRequired} votes (quorum: {proposal.passingThreshold}% to pass)
          </div>
        </div>

        {/* Voting Interface */}
        {canVote && !userVote && daysLeft > 0 && (
          <div className="space-y-3 pt-4 border-t">
            <div className="flex gap-2">
              <Button
                variant={selectedVote === 'yes' ? 'cosmic' : 'cosmicOutline'}
                size="sm"
                onClick={() => setSelectedVote('yes')}
                data-testid="button-vote-yes"
              >
                <CheckCircle className="w-4 h-4 mr-1" />
                Yes
              </Button>
              <Button
                variant={selectedVote === 'no' ? 'cosmic' : 'cosmicOutline'}
                size="sm"
                onClick={() => setSelectedVote('no')}
                data-testid="button-vote-no"
              >
                <XCircle className="w-4 h-4 mr-1" />
                No
              </Button>
              <Button
                variant={selectedVote === 'abstain' ? 'cosmic' : 'cosmicOutline'}
                size="sm"
                onClick={() => setSelectedVote('abstain')}
              >
                Abstain
              </Button>
            </div>
            
            {selectedVote && (
              <div className="space-y-2">
                <Textarea
                  value={voteReason}
                  onChange={(e) => setVoteReason(e.target.value)}
                  placeholder="Optional: Explain your reasoning..."
                  className="text-sm"
                  rows={2}
                />
                <Button
                  onClick={() => onVote({ 
                    proposalId: proposal.id, 
                    voteChoice: selectedVote,
                    reason: voteReason.trim() || undefined
                  })}
                  variant="cosmic"
                  size="sm"
                  data-testid="button-submit-vote"
                >
                  Submit Vote
                </Button>
              </div>
            )}
          </div>
        )}

        {/* Vote Status */}
        {userVote && (
          <div className="bg-primary/10 rounded-lg p-3">
            <div className="flex items-center gap-2 text-sm">
              <VoteIcon className="w-4 h-4" />
              <span>You voted: <strong>{userVote.voteChoice.toUpperCase()}</strong></span>
            </div>
            {userVote.reason && (
              <p className="text-xs text-muted-foreground mt-1">"{userVote.reason}"</p>
            )}
          </div>
        )}

        {!canVote && (
          <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-3">
            <div className="flex items-center gap-2 text-yellow-600 dark:text-yellow-400 text-sm">
              <AlertCircle className="w-4 h-4" />
              <span>Verification required to vote</span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

// Proposal history card
const ProposalHistoryCard = ({ proposal }: { proposal: Proposal }) => {
  const totalVotes = proposal.totalVotes;
  const yesPercentage = totalVotes > 0 ? (proposal.yesVotes / totalVotes) * 100 : 0;
  
  const statusIcon = proposal.status === 'passed' ? 
    <CheckCircle className="w-5 h-5 text-green-500" /> : 
    <XCircle className="w-5 h-5 text-red-500" />;

  return (
    <Card data-testid={`proposal-history-${proposal.id}`}>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              {statusIcon}
              <Badge variant={proposal.status === 'passed' ? 'default' : 'secondary'}>
                {proposal.status}
              </Badge>
              <Badge variant="outline">{proposal.proposalType}</Badge>
            </div>
            <CardTitle className="text-lg">{proposal.title}</CardTitle>
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        <div className="flex justify-between text-sm mb-2">
          <span>Final Result</span>
          <span>{yesPercentage.toFixed(1)}% Yes | {totalVotes} total votes</span>
        </div>
        <Progress value={yesPercentage} className="h-2" />
        
        <div className="text-xs text-muted-foreground mt-2">
          Completed: {new Date(proposal.updatedAt).toLocaleDateString()}
        </div>
      </CardContent>
    </Card>
  );
};

// Draft proposal card with activation option
const DraftProposalCard = ({ 
  proposal, 
  onActivate, 
  canActivate 
}: { 
  proposal: Proposal; 
  onActivate: (id: string) => void;
  canActivate: boolean;
}) => {
  const votingStartsAt = new Date(proposal.votingStartsAt);
  const canActivateNow = votingStartsAt <= new Date();

  return (
    <Card data-testid={`draft-proposal-${proposal.id}`} className="border-dashed">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Badge variant="outline">Draft</Badge>
              <Badge variant="outline">{proposal.proposalType}</Badge>
            </div>
            <CardTitle className="text-lg">{proposal.title}</CardTitle>
          </div>
        </div>
        <CardDescription>{proposal.description}</CardDescription>
      </CardHeader>
      
      <CardContent>
        <div className="flex items-center justify-between">
          <div className="text-sm text-muted-foreground">
            Voting starts: {votingStartsAt.toLocaleDateString()} at {votingStartsAt.toLocaleTimeString()}
          </div>
          
          {canActivate && canActivateNow && (
            <Button
              onClick={() => onActivate(proposal.id)}
              variant="cosmic"
              size="sm"
              data-testid="button-activate-proposal"
            >
              Activate Voting
            </Button>
          )}
          
          {canActivate && !canActivateNow && (
            <Badge variant="secondary">
              Scheduled for {votingStartsAt.toLocaleDateString()}
            </Badge>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default Governance;