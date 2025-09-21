import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Users, MapPin, Calendar, Lock, Plus, MessageCircle, Vote } from 'lucide-react';
import { useWeb3 } from '@/hooks/useWeb3';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { Navigation } from '@/components/Navigation';

const Organize = () => {
  const { isConnected } = useWeb3();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [isCreating, setIsCreating] = useState(false);

  const handleCreateMovement = () => {
    setIsCreating(true);
    toast({
      title: "Creating Movement",
      description: "This feature will be available soon. Currently implementing decentralized movement creation on blockchain.",
    });
    setTimeout(() => setIsCreating(false), 2000);
  };

  const handleJoinMovement = (movementTitle: string) => {
    toast({
      title: "Joining Movement",
      description: `Joining "${movementTitle}". This will be implemented with smart contracts for secure, anonymous participation.`,
    });
  };

  const handleSecureMessaging = () => {
    navigate('/messages');
  };

  const handleGovernance = () => {
    navigate('/governance');
  };

  const activeMovements = [
    {
      title: "Housing Justice Coalition",
      description: "Fighting against unfair evictions and housing discrimination",
      members: 1247,
      location: "Global",
      nextEvent: "2025-01-25",
      status: "active"
    },
    {
      title: "Climate Emergency Response",
      description: "Organizing peaceful protests against fossil fuel companies",
      members: 892,
      location: "North America",
      nextEvent: "2025-01-20",
      status: "urgent"
    },
    {
      title: "Anti-War Movement",
      description: "Demanding end to conflicts causing civilian casualties",
      members: 2156,
      location: "Global",
      nextEvent: "2025-01-22",
      status: "active"
    }
  ];

  if (!isConnected) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-subtle">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <Users className="w-12 h-12 mx-auto text-primary mb-4" />
            <CardTitle>Connect Your Wallet</CardTitle>
            <CardDescription>
              Connect your wallet to join organizing efforts
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-subtle">
      <Navigation />
      <div className="max-w-6xl mx-auto space-y-8 p-4">
        <div className="text-center space-y-4 pt-8">
          <h1 className="text-4xl font-bold text-gradient-cosmic">Organize Resistance</h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Join movements, coordinate actions, and build the collective power needed 
            to challenge corruption and injustice safely and effectively.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-4 justify-center">
          <Button 
            variant="cosmic" 
            className="flex items-center gap-2"
            onClick={handleCreateMovement}
            disabled={isCreating}
          >
            <Plus className="w-4 h-4" />
            {isCreating ? 'Creating...' : 'Create Movement'}
          </Button>
          <Button 
            variant="cosmicOutline" 
            className="flex items-center gap-2"
            onClick={handleSecureMessaging}
          >
            <MessageCircle className="w-4 h-4" />
            Secure Messaging
          </Button>
          <Button 
            variant="cosmicOutline" 
            className="flex items-center gap-2"
            onClick={handleGovernance}
          >
            <Vote className="w-4 h-4" />
            Governance
          </Button>
        </div>

        {/* Active Movements */}
        <div className="space-y-6">
          <h2 className="text-2xl font-semibold text-center">Active Movements</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {activeMovements.map((movement, index) => (
              <Card key={index} className="hover:border-primary/40 transition-colors">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <CardTitle className="text-lg">{movement.title}</CardTitle>
                    <Badge variant={movement.status === 'urgent' ? 'destructive' : 'secondary'}>
                      {movement.status}
                    </Badge>
                  </div>
                  <CardDescription>{movement.description}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Users className="w-4 h-4" />
                      {movement.members.toLocaleString()} members
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <MapPin className="w-4 h-4" />
                      {movement.location}
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Calendar className="w-4 h-4" />
                      Next action: {movement.nextEvent}
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    <Button 
                      variant="cosmic" 
                      size="sm" 
                      className="flex-1"
                      onClick={() => handleJoinMovement(movement.title)}
                    >
                      Join Movement
                    </Button>
                    <Button variant="cosmicOutline" size="sm">
                      <Lock className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Security Features */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lock className="w-5 h-5" />
              Security Features
            </CardTitle>
            <CardDescription>
              How we keep activists safe while organizing
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center space-y-3">
                <div className="w-12 h-12 mx-auto bg-primary/10 rounded-full flex items-center justify-center">
                  <MessageCircle className="w-6 h-6 text-primary" />
                </div>
                <h3 className="font-semibold">Encrypted Communication</h3>
                <p className="text-sm text-muted-foreground">
                  End-to-end encrypted messaging that can't be intercepted
                </p>
              </div>
              
              <div className="text-center space-y-3">
                <div className="w-12 h-12 mx-auto bg-primary/10 rounded-full flex items-center justify-center">
                  <Users className="w-6 h-6 text-primary" />
                </div>
                <h3 className="font-semibold">Anonymous Coordination</h3>
                <p className="text-sm text-muted-foreground">
                  Organize without revealing personal identities to authorities
                </p>
              </div>
              
              <div className="text-center space-y-3">
                <div className="w-12 h-12 mx-auto bg-primary/10 rounded-full flex items-center justify-center">
                  <Vote className="w-6 h-6 text-primary" />
                </div>
                <h3 className="font-semibold">Decentralized Decisions</h3>
                <p className="text-sm text-muted-foreground">
                  Democratic governance that can't be compromised by infiltration
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Organize;