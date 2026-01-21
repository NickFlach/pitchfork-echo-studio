import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Shield, 
  Eye, 
  EyeOff, 
  Lock, 
  Unlock, 
  Clock, 
  CheckCircle2, 
  AlertTriangle,
  Vote,
  Users,
  Fingerprint
} from 'lucide-react';
import {
  VoteChoice,
  VotingPhase,
  createVoteCommitment,
  storeCommitment,
  getStoredCommitment,
  clearStoredCommitment,
  formatVotingPhase,
  formatVoteChoice,
  formatTimeRemaining,
  verifyStoredCommitment,
  type VoteCommitmentData,
  type CommitmentStatus,
  type ProposalResults,
} from '@/lib/zkVoting';

interface PrivateVotingCardProps {
  proposalId: bigint;
  proposalTitle: string;
  proposalDescription: string;
  commitmentStatus: CommitmentStatus;
  results?: ProposalResults;
  votingPower: bigint;
  voterAddress: string;
  onCommit: (commitment: string) => Promise<void>;
  onReveal: (voteChoice: VoteChoice, salt: string, votingPower: bigint) => Promise<void>;
  isLoading?: boolean;
}

export const PrivateVotingCard: React.FC<PrivateVotingCardProps> = ({
  proposalId,
  proposalTitle,
  proposalDescription,
  commitmentStatus,
  results,
  votingPower,
  voterAddress,
  onCommit,
  onReveal,
  isLoading = false,
}) => {
  const [selectedVote, setSelectedVote] = useState<VoteChoice | null>(null);
  const [storedCommitment, setStoredCommitment] = useState<VoteCommitmentData | null>(null);
  const [hasCommitted, setHasCommitted] = useState(false);
  const [hasRevealed, setHasRevealed] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Load stored commitment on mount
  useEffect(() => {
    const stored = getStoredCommitment(proposalId);
    if (stored) {
      setStoredCommitment(stored);
      setHasCommitted(true);
      setSelectedVote(stored.voteChoice);
    }
  }, [proposalId]);

  const handleCommit = async () => {
    if (selectedVote === null || selectedVote === VoteChoice.NONE) {
      setError('Please select a vote');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      // Create commitment
      const commitmentData = createVoteCommitment(
        proposalId,
        selectedVote,
        votingPower,
        voterAddress
      );

      // Store locally first (critical for reveal later)
      storeCommitment(commitmentData);

      // Submit to contract
      await onCommit(commitmentData.commitment);

      setStoredCommitment(commitmentData);
      setHasCommitted(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to commit vote');
      // Don't clear stored commitment on error - user might retry
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReveal = async () => {
    if (!storedCommitment) {
      setError('No stored commitment found. Cannot reveal vote.');
      return;
    }

    // Verify stored commitment is valid
    if (!verifyStoredCommitment(storedCommitment)) {
      setError('Stored commitment data is corrupted. Cannot reveal vote.');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      await onReveal(
        storedCommitment.voteChoice,
        storedCommitment.salt,
        storedCommitment.votingPower
      );

      setHasRevealed(true);
      clearStoredCommitment(proposalId);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to reveal vote');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getPhaseIcon = () => {
    switch (commitmentStatus.phase) {
      case VotingPhase.COMMIT:
        return <EyeOff className="h-5 w-5" />;
      case VotingPhase.REVEAL:
        return <Eye className="h-5 w-5" />;
      case VotingPhase.FINALIZED:
        return <CheckCircle2 className="h-5 w-5" />;
      default:
        return <Clock className="h-5 w-5" />;
    }
  };

  const getPhaseColor = () => {
    switch (commitmentStatus.phase) {
      case VotingPhase.COMMIT:
        return 'bg-primary/20 text-primary';
      case VotingPhase.REVEAL:
        return 'bg-amber-500/20 text-amber-500';
      case VotingPhase.FINALIZED:
        return 'bg-emerald-500/20 text-emerald-500';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  const renderVoteOptions = () => (
    <RadioGroup
      value={selectedVote?.toString()}
      onValueChange={(value) => setSelectedVote(parseInt(value) as VoteChoice)}
      disabled={hasCommitted || commitmentStatus.phase !== VotingPhase.COMMIT}
    >
      <div className="flex items-center space-x-2 p-3 rounded-lg border border-emerald-500/30 hover:border-emerald-500/60 transition-colors">
        <RadioGroupItem value={VoteChoice.FOR.toString()} id="vote-for" />
        <Label htmlFor="vote-for" className="flex-1 cursor-pointer">
          <span className="font-medium text-emerald-500">For</span>
          <p className="text-sm text-muted-foreground">Support this proposal</p>
        </Label>
      </div>
      <div className="flex items-center space-x-2 p-3 rounded-lg border border-destructive/30 hover:border-destructive/60 transition-colors">
        <RadioGroupItem value={VoteChoice.AGAINST.toString()} id="vote-against" />
        <Label htmlFor="vote-against" className="flex-1 cursor-pointer">
          <span className="font-medium text-destructive">Against</span>
          <p className="text-sm text-muted-foreground">Oppose this proposal</p>
        </Label>
      </div>
      <div className="flex items-center space-x-2 p-3 rounded-lg border border-muted-foreground/30 hover:border-muted-foreground/60 transition-colors">
        <RadioGroupItem value={VoteChoice.ABSTAIN.toString()} id="vote-abstain" />
        <Label htmlFor="vote-abstain" className="flex-1 cursor-pointer">
          <span className="font-medium">Abstain</span>
          <p className="text-sm text-muted-foreground">Neither support nor oppose</p>
        </Label>
      </div>
    </RadioGroup>
  );

  return (
    <Card className="border-primary/20">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-primary" />
            <CardTitle className="text-lg">Private Voting</CardTitle>
          </div>
          <Badge className={getPhaseColor()}>
            {getPhaseIcon()}
            <span className="ml-1">{formatVotingPhase(commitmentStatus.phase)}</span>
          </Badge>
        </div>
        <CardDescription>
          Your vote is hidden until the reveal phase, preventing social pressure and vote buying.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Phase Progress */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Time Remaining</span>
            <span className="font-medium">{formatTimeRemaining(commitmentStatus.timeRemaining)}</span>
          </div>
          <div className="flex gap-1">
            <div className={`flex-1 h-2 rounded-l-full ${commitmentStatus.phase >= VotingPhase.COMMIT ? 'bg-primary' : 'bg-muted'}`} />
            <div className={`flex-1 h-2 ${commitmentStatus.phase >= VotingPhase.REVEAL ? 'bg-amber-500' : 'bg-muted'}`} />
            <div className={`flex-1 h-2 rounded-r-full ${commitmentStatus.phase >= VotingPhase.FINALIZED ? 'bg-emerald-500' : 'bg-muted'}`} />
          </div>
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>Commit</span>
            <span>Reveal</span>
            <span>Final</span>
          </div>
        </div>

        {/* Participation Stats */}
        <div className="grid grid-cols-2 gap-4">
          <div className="p-3 rounded-lg bg-muted/50">
            <div className="flex items-center gap-2 text-muted-foreground mb-1">
              <Lock className="h-4 w-4" />
              <span className="text-xs">Commitments</span>
            </div>
            <p className="text-2xl font-bold">{commitmentStatus.totalCommitments.toString()}</p>
          </div>
          <div className="p-3 rounded-lg bg-muted/50">
            <div className="flex items-center gap-2 text-muted-foreground mb-1">
              <Unlock className="h-4 w-4" />
              <span className="text-xs">Revealed</span>
            </div>
            <p className="text-2xl font-bold">{commitmentStatus.totalRevealed.toString()}</p>
          </div>
        </div>

        {/* Privacy Notice */}
        <Alert className="border-primary/30 bg-primary/5">
          <Fingerprint className="h-4 w-4" />
          <AlertDescription className="text-sm">
            <strong>Privacy Protected:</strong> Your vote choice is cryptographically hidden. 
            Only you can reveal it during the reveal phase.
          </AlertDescription>
        </Alert>

        {/* Voting Section */}
        <Tabs defaultValue={commitmentStatus.phase === VotingPhase.REVEAL ? 'reveal' : 'commit'}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="commit" disabled={commitmentStatus.phase !== VotingPhase.COMMIT}>
              <EyeOff className="h-4 w-4 mr-2" />
              Commit Vote
            </TabsTrigger>
            <TabsTrigger value="reveal" disabled={commitmentStatus.phase !== VotingPhase.REVEAL}>
              <Eye className="h-4 w-4 mr-2" />
              Reveal Vote
            </TabsTrigger>
          </TabsList>

          <TabsContent value="commit" className="space-y-4 mt-4">
            {hasCommitted ? (
              <div className="text-center p-6 rounded-lg bg-emerald-500/10 border border-emerald-500/30">
                <CheckCircle2 className="h-12 w-12 text-emerald-500 mx-auto mb-3" />
                <p className="font-medium text-emerald-500">Vote Committed</p>
                <p className="text-sm text-muted-foreground mt-1">
                  You voted <strong>{formatVoteChoice(storedCommitment?.voteChoice || VoteChoice.NONE)}</strong> (hidden until reveal)
                </p>
                <p className="text-xs text-muted-foreground mt-2">
                  Remember to reveal your vote during the reveal phase!
                </p>
              </div>
            ) : (
              <>
                <div className="space-y-3">
                  {renderVoteOptions()}
                </div>
                <div className="text-sm text-muted-foreground">
                  <p>Your voting power: <strong>{votingPower.toString()} gPFORK</strong></p>
                </div>
                <Button 
                  onClick={handleCommit} 
                  disabled={isSubmitting || isLoading || selectedVote === null}
                  className="w-full"
                >
                  {isSubmitting ? (
                    <>Committing Vote...</>
                  ) : (
                    <>
                      <Lock className="h-4 w-4 mr-2" />
                      Commit Vote (Hidden)
                    </>
                  )}
                </Button>
              </>
            )}
          </TabsContent>

          <TabsContent value="reveal" className="space-y-4 mt-4">
            {!hasCommitted ? (
              <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  You did not commit a vote during the commit phase.
                </AlertDescription>
              </Alert>
            ) : hasRevealed ? (
              <div className="text-center p-6 rounded-lg bg-emerald-500/10 border border-emerald-500/30">
                <CheckCircle2 className="h-12 w-12 text-emerald-500 mx-auto mb-3" />
                <p className="font-medium text-emerald-500">Vote Revealed</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Your vote has been counted.
                </p>
              </div>
            ) : (
              <>
                <div className="p-4 rounded-lg bg-muted/50">
                  <p className="text-sm text-muted-foreground mb-2">Your committed vote:</p>
                  <p className="text-lg font-bold">
                    {formatVoteChoice(storedCommitment?.voteChoice || VoteChoice.NONE)}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    with {storedCommitment?.votingPower.toString() || '0'} gPFORK voting power
                  </p>
                </div>
                <Alert className="border-amber-500/30 bg-amber-500/5">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription className="text-sm">
                    <strong>Important:</strong> You must reveal your vote before the reveal phase ends, 
                    or your vote won't be counted.
                  </AlertDescription>
                </Alert>
                <Button 
                  onClick={handleReveal} 
                  disabled={isSubmitting || isLoading}
                  className="w-full"
                >
                  {isSubmitting ? (
                    <>Revealing Vote...</>
                  ) : (
                    <>
                      <Unlock className="h-4 w-4 mr-2" />
                      Reveal My Vote
                    </>
                  )}
                </Button>
              </>
            )}
          </TabsContent>
        </Tabs>

        {/* Results (only after finalization) */}
        {results && commitmentStatus.phase === VotingPhase.FINALIZED && (
          <div className="space-y-4 pt-4 border-t">
            <h4 className="font-medium flex items-center gap-2">
              <Vote className="h-4 w-4" />
              Final Results
            </h4>
            <div className="space-y-3">
              <div className="space-y-1">
                <div className="flex justify-between text-sm">
                  <span className="text-emerald-500">For</span>
                  <span>{results.forVotes.toString()}</span>
                </div>
                <Progress 
                  value={Number(results.forVotes) / Number(results.forVotes + results.againstVotes + results.abstainVotes) * 100} 
                  className="h-2 bg-muted [&>div]:bg-emerald-500"
                />
              </div>
              <div className="space-y-1">
                <div className="flex justify-between text-sm">
                  <span className="text-destructive">Against</span>
                  <span>{results.againstVotes.toString()}</span>
                </div>
                <Progress 
                  value={Number(results.againstVotes) / Number(results.forVotes + results.againstVotes + results.abstainVotes) * 100} 
                  className="h-2 bg-muted [&>div]:bg-destructive"
                />
              </div>
              <div className="space-y-1">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Abstain</span>
                  <span>{results.abstainVotes.toString()}</span>
                </div>
                <Progress 
                  value={Number(results.abstainVotes) / Number(results.forVotes + results.againstVotes + results.abstainVotes) * 100} 
                  className="h-2"
                />
              </div>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Users className="h-4 w-4" />
              <span>
                {results.totalRevealed.toString()} of {results.totalCommitments.toString()} votes revealed
              </span>
            </div>
          </div>
        )}

        {/* Error Display */}
        {error && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
};

export default PrivateVotingCard;
