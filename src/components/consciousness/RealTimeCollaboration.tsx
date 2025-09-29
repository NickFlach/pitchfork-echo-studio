import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { 
  Users, 
  MessageCircle, 
  Brain, 
  Zap, 
  Share, 
  Eye,
  Mic,
  MicOff,
  Video,
  VideoOff,
  Settings,
  UserPlus,
  Crown,
  Sparkles
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useGameification } from '@/hooks/useGameification';

interface CollaborationParticipant {
  id: string;
  name: string;
  avatar?: string;
  consciousnessScore: number;
  currentState: 'active' | 'reflecting' | 'sharing' | 'listening';
  joinedAt: Date;
  role: 'facilitator' | 'participant' | 'observer';
  isOnline: boolean;
}

interface ConsciousnessShare {
  id: string;
  participantId: string;
  type: 'insight' | 'reflection' | 'question' | 'pattern' | 'breakthrough';
  content: string;
  consciousnessLevel: number;
  emotionalState: string;
  timestamp: Date;
  reactions: Array<{
    participantId: string;
    type: 'resonance' | 'support' | 'curiosity' | 'gratitude';
  }>;
}

interface CollaborationSession {
  id: string;
  title: string;
  type: 'group-reflection' | 'consciousness-circle' | 'guided-session' | 'open-exploration';
  facilitatorId: string;
  participants: CollaborationParticipant[];
  maxParticipants: number;
  isPrivate: boolean;
  startedAt: Date;
  estimatedDuration: number; // minutes
  currentPhase: 'gathering' | 'centering' | 'sharing' | 'integration' | 'closing';
  sharedConsciousness: {
    averageLevel: number;
    collectiveInsights: string[];
    emergentPatterns: string[];
    groupResonance: number;
  };
}

// Mock WebSocket for real-time features
class MockWebSocket {
  private listeners: { [key: string]: Function[] } = {};
  private isConnected = false;

  constructor(private url: string) {
    // Simulate connection delay
    setTimeout(() => {
      this.isConnected = true;
      this.emit('open', {});
    }, 1000);
  }

  on(event: string, callback: Function) {
    if (!this.listeners[event]) {
      this.listeners[event] = [];
    }
    this.listeners[event].push(callback);
  }

  emit(event: string, data: any) {
    if (this.listeners[event]) {
      this.listeners[event].forEach(callback => callback(data));
    }
  }

  send(data: any) {
    if (this.isConnected) {
      // Simulate server response
      setTimeout(() => {
        this.emit('message', { 
          type: 'broadcast',
          data: JSON.parse(data),
          timestamp: new Date()
        });
      }, 100);
    }
  }

  close() {
    this.isConnected = false;
    this.emit('close', {});
  }
}

export function RealTimeCollaboration() {
  const { toast } = useToast();
  const { userStats, addActivity } = useGameification();
  const [isConnected, setIsConnected] = useState(false);
  const [currentSession, setCurrentSession] = useState<CollaborationSession | null>(null);
  const [messageInput, setMessageInput] = useState('');
  const [shares, setShares] = useState<ConsciousnessShare[]>([]);
  const [myParticipantId] = useState(`participant-${Date.now()}`);
  const [audioEnabled, setAudioEnabled] = useState(false);
  const [videoEnabled, setVideoEnabled] = useState(false);
  const wsRef = useRef<MockWebSocket | null>(null);

  // Initialize WebSocket connection
  useEffect(() => {
    wsRef.current = new MockWebSocket('ws://localhost:3001/consciousness-collaboration');
    
    wsRef.current.on('open', () => {
      setIsConnected(true);
      toast({
        title: "Connected to Consciousness Network",
        description: "You can now join collaborative consciousness sessions",
      });
    });

    wsRef.current.on('message', (event: any) => {
      handleIncomingMessage(event.data);
    });

    wsRef.current.on('close', () => {
      setIsConnected(false);
      toast({
        title: "Disconnected",
        description: "Connection to consciousness network lost",
        variant: "destructive",
      });
    });

    return () => {
      wsRef.current?.close();
    };
  }, [toast]);

  const handleIncomingMessage = (data: any) => {
    switch (data.type) {
      case 'session-update':
        setCurrentSession(data.session);
        break;
      case 'new-share':
        setShares(prev => [data.share, ...prev].slice(0, 50));
        break;
      case 'participant-joined':
        toast({
          title: "New Participant Joined",
          description: `${data.participant.name} joined the consciousness circle`,
        });
        break;
      case 'participant-left':
        toast({
          title: "Participant Left",
          description: `${data.participant.name} left the session`,
        });
        break;
      case 'collective-insight':
        toast({
          title: "Collective Insight Emerged",
          description: data.insight,
        });
        addActivity({
          type: 'collaboration',
          title: 'Collective Insight',
          description: data.insight,
          priority: 'high',
        });
        break;
    }
  };

  const createSession = (type: CollaborationSession['type']) => {
    const session: CollaborationSession = {
      id: `session-${Date.now()}`,
      title: `${type.replace('-', ' ')} Session`,
      type,
      facilitatorId: myParticipantId,
      participants: [{
        id: myParticipantId,
        name: 'You',
        consciousnessScore: userStats.consciousnessScore,
        currentState: 'active',
        joinedAt: new Date(),
        role: 'facilitator',
        isOnline: true,
      }],
      maxParticipants: type === 'consciousness-circle' ? 8 : 12,
      isPrivate: false,
      startedAt: new Date(),
      estimatedDuration: 45,
      currentPhase: 'gathering',
      sharedConsciousness: {
        averageLevel: userStats.consciousnessScore,
        collectiveInsights: [],
        emergentPatterns: [],
        groupResonance: 0.5,
      },
    };

    setCurrentSession(session);
    
    // Simulate other participants joining
    setTimeout(() => {
      const mockParticipants: CollaborationParticipant[] = [
        {
          id: 'p1',
          name: 'Sarah Chen',
          consciousnessScore: 78,
          currentState: 'reflecting',
          joinedAt: new Date(),
          role: 'participant',
          isOnline: true,
        },
        {
          id: 'p2',
          name: 'Michael Torres',
          consciousnessScore: 85,
          currentState: 'active',
          joinedAt: new Date(),
          role: 'participant',
          isOnline: true,
        },
      ];

      setCurrentSession(prev => prev ? {
        ...prev,
        participants: [...prev.participants, ...mockParticipants],
        sharedConsciousness: {
          ...prev.sharedConsciousness,
          averageLevel: Math.round((prev.sharedConsciousness.averageLevel + 78 + 85) / 3),
          groupResonance: 0.7,
        },
      } : null);
    }, 3000);

    toast({
      title: "Session Created",
      description: `Created ${type.replace('-', ' ')} session. Waiting for participants...`,
    });
  };

  const shareConsciousness = (type: ConsciousnessShare['type']) => {
    if (!messageInput.trim() || !currentSession) return;

    const share: ConsciousnessShare = {
      id: `share-${Date.now()}`,
      participantId: myParticipantId,
      type,
      content: messageInput,
      consciousnessLevel: userStats.consciousnessScore,
      emotionalState: 'centered',
      timestamp: new Date(),
      reactions: [],
    };

    setShares(prev => [share, ...prev]);
    setMessageInput('');

    // Simulate AI analysis of collective consciousness
    setTimeout(() => {
      if (shares.length > 2) {
        const insight = `The group is showing high resonance around themes of ${type} and collective growth`;
        toast({
          title: "Collective Pattern Detected",
          description: insight,
        });
      }
    }, 2000);

    addActivity({
      type: 'collaboration',
      title: `Shared ${type}`,
      description: `Contributed to collective consciousness exploration`,
      priority: 'medium',
    });
  };

  const addReaction = (shareId: string, reactionType: 'resonance' | 'support' | 'curiosity' | 'gratitude') => {
    setShares(prev => prev.map(share => 
      share.id === shareId
        ? {
            ...share,
            reactions: [
              ...share.reactions.filter(r => r.participantId !== myParticipantId),
              { participantId: myParticipantId, type: reactionType }
            ]
          }
        : share
    ));
  };

  const getStateIcon = (state: CollaborationParticipant['currentState']) => {
    switch (state) {
      case 'active': return <Zap className="w-4 h-4 text-green-500" />;
      case 'reflecting': return <Brain className="w-4 h-4 text-blue-500" />;
      case 'sharing': return <MessageCircle className="w-4 h-4 text-purple-500" />;
      case 'listening': return <Eye className="w-4 h-4 text-yellow-500" />;
      default: return <Users className="w-4 h-4" />;
    }
  };

  const getShareIcon = (type: ConsciousnessShare['type']) => {
    switch (type) {
      case 'insight': return <Sparkles className="w-4 h-4 text-yellow-500" />;
      case 'reflection': return <Brain className="w-4 h-4 text-blue-500" />;
      case 'question': return <MessageCircle className="w-4 h-4 text-purple-500" />;
      case 'pattern': return <Zap className="w-4 h-4 text-green-500" />;
      case 'breakthrough': return <Crown className="w-4 h-4 text-gold-500" />;
      default: return <Share className="w-4 h-4" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Connection Status */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`} />
          <span className="text-sm text-muted-foreground">
            {isConnected ? 'Connected to Consciousness Network' : 'Connecting...'}
          </span>
        </div>
        
        {!currentSession && (
          <div className="flex gap-2">
            <Button onClick={() => createSession('consciousness-circle')} size="sm">
              <Users className="w-4 h-4 mr-2" />
              Start Circle
            </Button>
            <Button onClick={() => createSession('group-reflection')} variant="outline" size="sm">
              <Brain className="w-4 h-4 mr-2" />
              Group Reflection
            </Button>
          </div>
        )}
      </div>

      {currentSession ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Session Area */}
          <div className="lg:col-span-2 space-y-4">
            {/* Session Header */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  {currentSession.title}
                  <Badge variant="outline" className="capitalize">
                    {currentSession.currentPhase}
                  </Badge>
                </CardTitle>
                <CardDescription>
                  {currentSession.participants.length} participants • 
                  Avg consciousness: {currentSession.sharedConsciousness.averageLevel}% • 
                  Resonance: {Math.round(currentSession.sharedConsciousness.groupResonance * 100)}%
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-4">
                  <Button
                    variant={audioEnabled ? "default" : "outline"}
                    size="sm"
                    onClick={() => setAudioEnabled(!audioEnabled)}
                  >
                    {audioEnabled ? <Mic className="w-4 h-4" /> : <MicOff className="w-4 h-4" />}
                  </Button>
                  <Button
                    variant={videoEnabled ? "default" : "outline"}
                    size="sm"
                    onClick={() => setVideoEnabled(!videoEnabled)}
                  >
                    {videoEnabled ? <Video className="w-4 h-4" /> : <VideoOff className="w-4 h-4" />}
                  </Button>
                  <Separator orientation="vertical" className="h-6" />
                  <Button variant="outline" size="sm">
                    <UserPlus className="w-4 h-4 mr-2" />
                    Invite
                  </Button>
                  <Button variant="outline" size="sm">
                    <Settings className="w-4 h-4 mr-2" />
                    Settings
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Consciousness Sharing Feed */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Collective Consciousness Stream</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Share Input */}
                  <div className="flex gap-2">
                    <Input
                      placeholder="Share your consciousness state, insights, or questions..."
                      value={messageInput}
                      onChange={(e) => setMessageInput(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && shareConsciousness('reflection')}
                    />
                    <div className="flex gap-1">
                      <Button 
                        size="sm" 
                        onClick={() => shareConsciousness('insight')}
                        disabled={!messageInput.trim()}
                      >
                        <Sparkles className="w-4 h-4" />
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => shareConsciousness('reflection')}
                        disabled={!messageInput.trim()}
                      >
                        <Brain className="w-4 h-4" />
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => shareConsciousness('question')}
                        disabled={!messageInput.trim()}
                      >
                        <MessageCircle className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>

                  {/* Shares Feed */}
                  <ScrollArea className="h-[400px]">
                    <div className="space-y-3">
                      {shares.map((share) => {
                        const participant = currentSession.participants.find(p => p.id === share.participantId);
                        
                        return (
                          <div key={share.id} className="border rounded-lg p-3 space-y-2">
                            <div className="flex items-start gap-3">
                              <Avatar className="w-8 h-8">
                                <AvatarImage src={participant?.avatar} />
                                <AvatarFallback>
                                  {participant?.name.charAt(0) || 'U'}
                                </AvatarFallback>
                              </Avatar>
                              
                              <div className="flex-1 space-y-1">
                                <div className="flex items-center gap-2">
                                  <span className="font-medium text-sm">
                                    {participant?.name || 'Anonymous'}
                                  </span>
                                  {getShareIcon(share.type)}
                                  <Badge variant="outline" className="text-xs capitalize">
                                    {share.type}
                                  </Badge>
                                  <span className="text-xs text-muted-foreground">
                                    {share.timestamp.toLocaleTimeString()}
                                  </span>
                                </div>
                                
                                <p className="text-sm">{share.content}</p>
                                
                                <div className="flex items-center gap-2">
                                  <div className="text-xs text-muted-foreground">
                                    Consciousness: {share.consciousnessLevel}%
                                  </div>
                                  
                                  <div className="flex gap-1">
                                    {['resonance', 'support', 'curiosity', 'gratitude'].map((reaction) => (
                                      <Button
                                        key={reaction}
                                        variant="ghost"
                                        size="sm"
                                        className="h-6 px-2 text-xs"
                                        onClick={() => addReaction(share.id, reaction as any)}
                                      >
                                        {reaction === 'resonance' && '🔊'}
                                        {reaction === 'support' && '🤝'}
                                        {reaction === 'curiosity' && '🤔'}
                                        {reaction === 'gratitude' && '🙏'}
                                        {share.reactions.filter(r => r.type === reaction).length || ''}
                                      </Button>
                                    ))}
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </ScrollArea>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Participants Sidebar */}
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Participants</CardTitle>
                <CardDescription>
                  {currentSession.participants.length} of {currentSession.maxParticipants}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {currentSession.participants.map((participant) => (
                    <div key={participant.id} className="flex items-center gap-3">
                      <Avatar className="w-8 h-8">
                        <AvatarImage src={participant.avatar} />
                        <AvatarFallback>{participant.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-sm truncate">
                            {participant.name}
                          </span>
                          {participant.role === 'facilitator' && (
                            <Crown className="w-3 h-3 text-yellow-500" />
                          )}
                        </div>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          {getStateIcon(participant.currentState)}
                          <span className="capitalize">{participant.currentState}</span>
                          <span>• {participant.consciousnessScore}%</span>
                        </div>
                      </div>
                      
                      <div className={`w-2 h-2 rounded-full ${participant.isOnline ? 'bg-green-500' : 'bg-gray-400'}`} />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Collective Insights</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {currentSession.sharedConsciousness.collectiveInsights.map((insight, index) => (
                    <div key={index} className="text-sm p-2 bg-muted rounded">
                      {insight}
                    </div>
                  ))}
                  
                  {currentSession.sharedConsciousness.collectiveInsights.length === 0 && (
                    <div className="text-sm text-muted-foreground text-center py-4">
                      Collective insights will emerge as the session progresses
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Real-Time Consciousness Collaboration</CardTitle>
            <CardDescription>
              Connect with others for shared consciousness exploration and collective insight generation
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-4">
                <h3 className="font-medium">Session Types</h3>
                <div className="space-y-2">
                  <Button 
                    className="w-full justify-start" 
                    variant="outline"
                    onClick={() => createSession('consciousness-circle')}
                  >
                    <Users className="w-4 h-4 mr-2" />
                    Consciousness Circle (8 people max)
                  </Button>
                  <Button 
                    className="w-full justify-start" 
                    variant="outline"
                    onClick={() => createSession('group-reflection')}
                  >
                    <Brain className="w-4 h-4 mr-2" />
                    Group Reflection (12 people max)
                  </Button>
                  <Button 
                    className="w-full justify-start" 
                    variant="outline"
                    onClick={() => createSession('guided-session')}
                  >
                    <Eye className="w-4 h-4 mr-2" />
                    Guided Exploration
                  </Button>
                </div>
              </div>
              
              <div className="space-y-4">
                <h3 className="font-medium">Your Consciousness Profile</h3>
                <div className="space-y-2 text-sm">
                  <div>Level: {userStats.level}</div>
                  <div>Consciousness Score: {userStats.consciousnessScore}%</div>
                  <div>Sessions: {userStats.totalSessions}</div>
                  <div>Streak: {userStats.streak} days</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}