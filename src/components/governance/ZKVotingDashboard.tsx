import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Shield, 
  Vote, 
  Clock, 
  Users, 
  CheckCircle2, 
  AlertTriangle,
  Eye,
  EyeOff,
  ArrowRight,
} from 'lucide-react';
import { PrivateVotingCard } from './PrivateVotingCard';
import { VitalikDAOPrinciples, PrivateVotingExplainer } from './PrivacyIndicators';
import { VotingPhase, VoteChoice, type CommitmentStatus } from '@/lib/zkVoting';

// Mock data for demonstration
const mockProposals = [
  {
    id: BigInt(1),
    title: 'Upgrade AI Model Selection Process',
    description: 'Implement quadratic voting for AI model selection to prevent whale capture and ensure community voice.',
    category: 'AI_MODEL_SELECTION',
    status: {
      totalCommitments: BigInt(47),
      totalRevealed: BigInt(0),
      phase: VotingPhase.COMMIT,
      timeRemaining: BigInt(172800), // 2 days
    } as CommitmentStatus,
  },
  {
    id: BigInt(2),
    title: 'Treasury Allocation for Privacy Research',
    description: 'Allocate 50,000 PFORK for research into advanced ZK voting mechanisms.',
    category: 'TREASURY_ALLOCATION',
    status: {
      totalCommitments: BigInt(89),
      totalRevealed: BigInt(34),
      phase: VotingPhase.REVEAL,
      timeRemaining: BigInt(86400), // 1 day
    } as CommitmentStatus,
  },
  {
    id: BigInt(3),
    title: 'Governance Parameter Update',
    description: 'Reduce voting period from 7 days to 5 days with increased quorum.',
    category: 'GOVERNANCE_PARAMETER',
    status: {
      totalCommitments: BigInt(156),
      totalRevealed: BigInt(142),
      phase: VotingPhase.FINALIZED,
      timeRemaining: BigInt(0),
    } as CommitmentStatus,
    results: {
      forVotes: BigInt(89000),
      againstVotes: BigInt(45000),
      abstainVotes: BigInt(12000),
      totalCommitments: BigInt(156),
      totalRevealed: BigInt(142),
      finalized: true,
    },
  },
];

export const ZKVotingDashboard: React.FC = () => {
  const [selectedProposal, setSelectedProposal] = useState<typeof mockProposals[0] | null>(null);
  const [showExplainer, setShowExplainer] = useState(false);

  // Mock voting power and address
  const mockVotingPower = BigInt(5000);
  const mockVoterAddress = '0x1234...5678';

  const handleCommit = async (commitment: string) => {
    console.log('Committing vote with hash:', commitment);
    // In production, call contract.commitVote(proposalId, commitment)
    await new Promise(resolve => setTimeout(resolve, 2000));
  };

  const handleReveal = async (voteChoice: VoteChoice, salt: string, votingPower: bigint) => {
    console.log('Revealing vote:', { voteChoice, salt, votingPower });
    // In production, call contract.revealVote(proposalId, voteChoice, salt, votingPower)
    await new Promise(resolve => setTimeout(resolve, 2000));
  };

  const getPhaseStats = () => {
    const commit = mockProposals.filter(p => p.status.phase === VotingPhase.COMMIT).length;
    const reveal = mockProposals.filter(p => p.status.phase === VotingPhase.REVEAL).length;
    const finalized = mockProposals.filter(p => p.status.phase === VotingPhase.FINALIZED).length;
    return { commit, reveal, finalized };
  };

  const stats = getPhaseStats();

  return (
    <div className="container mx-auto py-8 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <Shield className="h-8 w-8 text-primary" />
            Private Governance
          </h1>
          <p className="text-muted-foreground mt-1">
            Zero-knowledge voting aligned with Vitalik's DAO vision
          </p>
        </div>
        <Button variant="outline" onClick={() => setShowExplainer(!showExplainer)}>
          {showExplainer ? 'Hide' : 'How It Works'}
        </Button>
      </div>

      {/* Stats Overview */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-full bg-primary/20">
                <Vote className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{mockProposals.length}</p>
                <p className="text-sm text-muted-foreground">Active Proposals</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-full bg-primary/20">
                <EyeOff className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.commit}</p>
                <p className="text-sm text-muted-foreground">In Commit Phase</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-full bg-amber-500/20">
                <Eye className="h-6 w-6 text-amber-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.reveal}</p>
                <p className="text-sm text-muted-foreground">In Reveal Phase</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-full bg-emerald-500/20">
                <CheckCircle2 className="h-6 w-6 text-emerald-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.finalized}</p>
                <p className="text-sm text-muted-foreground">Finalized</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Explainer Section */}
      {showExplainer && (
        <div className="grid gap-6 lg:grid-cols-2">
          <VitalikDAOPrinciples />
          <PrivateVotingExplainer />
        </div>
      )}

      {/* Proposals List */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Proposal Cards */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <Vote className="h-5 w-5" />
            Proposals
          </h2>
          {mockProposals.map((proposal) => (
            <Card 
              key={proposal.id.toString()} 
              className={`cursor-pointer transition-all hover:border-primary/50 ${
                selectedProposal?.id === proposal.id ? 'border-primary' : ''
              }`}
              onClick={() => setSelectedProposal(proposal)}
            >
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <Badge variant="outline" className="text-xs">
                    {proposal.category.replace(/_/g, ' ')}
                  </Badge>
                  <Badge 
                    className={
                      proposal.status.phase === VotingPhase.COMMIT 
                        ? 'bg-primary/20 text-primary' 
                        : proposal.status.phase === VotingPhase.REVEAL 
                          ? 'bg-amber-500/20 text-amber-500' 
                          : 'bg-emerald-500/20 text-emerald-500'
                    }
                  >
                    {proposal.status.phase === VotingPhase.COMMIT && <EyeOff className="h-3 w-3 mr-1" />}
                    {proposal.status.phase === VotingPhase.REVEAL && <Eye className="h-3 w-3 mr-1" />}
                    {proposal.status.phase === VotingPhase.FINALIZED && <CheckCircle2 className="h-3 w-3 mr-1" />}
                    {VotingPhase[proposal.status.phase]}
                  </Badge>
                </div>
                <CardTitle className="text-lg mt-2">{proposal.title}</CardTitle>
                <CardDescription className="line-clamp-2">
                  {proposal.description}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between text-sm text-muted-foreground">
                  <div className="flex items-center gap-4">
                    <span className="flex items-center gap-1">
                      <Users className="h-4 w-4" />
                      {proposal.status.totalCommitments.toString()} votes
                    </span>
                    {proposal.status.phase !== VotingPhase.FINALIZED && (
                      <span className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        {Math.floor(Number(proposal.status.timeRemaining) / 86400)}d left
                      </span>
                    )}
                  </div>
                  <ArrowRight className="h-4 w-4" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Selected Proposal Voting */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Cast Your Vote
          </h2>
          {selectedProposal ? (
            <PrivateVotingCard
              proposalId={selectedProposal.id}
              proposalTitle={selectedProposal.title}
              proposalDescription={selectedProposal.description}
              commitmentStatus={selectedProposal.status}
              results={selectedProposal.results}
              votingPower={mockVotingPower}
              voterAddress={mockVoterAddress}
              onCommit={handleCommit}
              onReveal={handleReveal}
            />
          ) : (
            <Card className="border-dashed">
              <CardContent className="py-12 text-center">
                <Vote className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">
                  Select a proposal to cast your private vote
                </p>
              </CardContent>
            </Card>
          )}

          {/* Privacy Warning */}
          <Alert className="border-primary/30 bg-primary/5">
            <Shield className="h-4 w-4" />
            <AlertDescription>
              <strong>Your vote is private.</strong> During the commit phase, your vote choice is cryptographically 
              hidden. Remember to reveal your vote during the reveal phase, or it won't be counted.
            </AlertDescription>
          </Alert>
        </div>
      </div>
    </div>
  );
};

export default ZKVotingDashboard;
