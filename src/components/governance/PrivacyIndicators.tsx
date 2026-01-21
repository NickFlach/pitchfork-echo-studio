import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Shield, Eye, EyeOff, Users, Vote, Lock, AlertCircle, CheckCircle } from 'lucide-react';

interface PrivacyIndicatorProps {
  isPrivate: boolean;
  phase: 'commit' | 'reveal' | 'finalized';
  hasVoted?: boolean;
  hasRevealed?: boolean;
}

export const PrivacyIndicator: React.FC<PrivacyIndicatorProps> = ({
  isPrivate,
  phase,
  hasVoted = false,
  hasRevealed = false,
}) => {
  if (!isPrivate) {
    return (
      <Badge variant="outline" className="text-muted-foreground">
        <Eye className="h-3 w-3 mr-1" />
        Public Vote
      </Badge>
    );
  }

  if (phase === 'commit') {
    return (
      <Badge className="bg-primary/20 text-primary border-primary/30">
        <EyeOff className="h-3 w-3 mr-1" />
        {hasVoted ? 'Vote Hidden' : 'Private Voting'}
      </Badge>
    );
  }

  if (phase === 'reveal') {
    return (
      <Badge className="bg-amber-500/20 text-amber-500 border-amber-500/30">
        {hasRevealed ? (
          <>
            <CheckCircle className="h-3 w-3 mr-1" />
            Revealed
          </>
        ) : hasVoted ? (
          <>
            <AlertCircle className="h-3 w-3 mr-1" />
            Reveal Required
          </>
        ) : (
          <>
            <Eye className="h-3 w-3 mr-1" />
            Reveal Phase
          </>
        )}
      </Badge>
    );
  }

  return (
    <Badge className="bg-emerald-500/20 text-emerald-500 border-emerald-500/30">
      <CheckCircle className="h-3 w-3 mr-1" />
      Finalized
    </Badge>
  );
};

interface VitalikDAOPrinciplesProps {}

export const VitalikDAOPrinciples: React.FC<VitalikDAOPrinciplesProps> = () => {
  const principles = [
    {
      icon: Shield,
      title: 'Privacy-First Voting',
      description: 'Without privacy, governance becomes a social game. Votes are hidden until reveal.',
      color: 'text-primary',
    },
    {
      icon: Lock,
      title: 'Commit-Reveal Scheme',
      description: 'Vote commitments prevent social pressure, vote buying, and strategic voting.',
      color: 'text-amber-500',
    },
    {
      icon: Users,
      title: 'Capture Resistance',
      description: 'ZK proofs ensure vote validity without revealing how you voted during commit phase.',
      color: 'text-emerald-500',
    },
    {
      icon: Vote,
      title: 'Convex/Concave Awareness',
      description: 'Different problems need different governance modes - robust averaging vs decisive action.',
      color: 'text-purple-500',
    },
  ];

  return (
    <Card className="border-primary/20">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-5 w-5 text-primary" />
          Vitalik's DAO Vision
        </CardTitle>
        <CardDescription>
          "We need DAOs - but different and better DAOs"
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 md:grid-cols-2">
          {principles.map((principle, index) => (
            <div key={index} className="p-4 rounded-lg bg-muted/30 border border-muted">
              <div className="flex items-center gap-2 mb-2">
                <principle.icon className={`h-5 w-5 ${principle.color}`} />
                <h4 className="font-medium">{principle.title}</h4>
              </div>
              <p className="text-sm text-muted-foreground">{principle.description}</p>
            </div>
          ))}
        </div>
        <div className="mt-4 p-4 rounded-lg bg-primary/5 border border-primary/20">
          <p className="text-sm text-muted-foreground italic">
            "AI must be put in thoughtfully, as something that scales and enhances human intention and judgement, 
            rather than replacing it... The DAO stack also includes the communication layer."
          </p>
          <p className="text-xs text-muted-foreground mt-2">— Vitalik Buterin</p>
        </div>
      </CardContent>
    </Card>
  );
};

interface PrivateVotingExplainerProps {}

export const PrivateVotingExplainer: React.FC<PrivateVotingExplainerProps> = () => {
  const phases = [
    {
      phase: 'Commit',
      icon: Lock,
      description: 'Vote is cryptographically hidden',
      details: [
        'Choose your vote (For/Against/Abstain)',
        'System generates random salt',
        'Commitment = hash(vote + salt + power + address)',
        'Only the hash is stored on-chain',
        'Your actual vote is completely hidden',
      ],
    },
    {
      phase: 'Reveal',
      icon: Eye,
      description: 'Reveal your vote to be counted',
      details: [
        'Submit your original vote + salt',
        'Contract verifies hash matches commitment',
        'Vote is added to final tally',
        'Must reveal before deadline',
        'Unrevealed votes are not counted',
      ],
    },
    {
      phase: 'Finalized',
      icon: CheckCircle,
      description: 'Results become public',
      details: [
        'All revealed votes are tallied',
        'Final results are transparent',
        'Quorum and threshold checked',
        'Proposal outcome determined',
        'Execution can proceed if passed',
      ],
    },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <EyeOff className="h-5 w-5" />
          How Private Voting Works
        </CardTitle>
        <CardDescription>
          Commit-reveal voting prevents social pressure and vote manipulation
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="relative">
          {/* Timeline line */}
          <div className="absolute left-6 top-8 bottom-8 w-0.5 bg-muted" />
          
          <div className="space-y-8">
            {phases.map((phase, index) => (
              <div key={index} className="relative pl-14">
                <div className="absolute left-0 w-12 h-12 rounded-full bg-muted flex items-center justify-center">
                  <phase.icon className="h-5 w-5 text-foreground" />
                </div>
                <div>
                  <h4 className="font-medium text-lg">{phase.phase} Phase</h4>
                  <p className="text-muted-foreground mb-3">{phase.description}</p>
                  <ul className="space-y-1">
                    {phase.details.map((detail, i) => (
                      <li key={i} className="text-sm text-muted-foreground flex items-center gap-2">
                        <div className="w-1 h-1 rounded-full bg-primary" />
                        {detail}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default {
  PrivacyIndicator,
  VitalikDAOPrinciples,
  PrivateVotingExplainer,
};
