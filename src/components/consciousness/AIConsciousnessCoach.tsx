import React, { useState, useEffect } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { 
  Brain, 
  Sparkles, 
  TrendingUp, 
  Target, 
  MessageCircle, 
  Lightbulb,
  ArrowRight,
  Clock,
  Star,
  Zap
} from 'lucide-react';
import { consciousnessApi } from '@/lib/consciousnessApi';
import { useToast } from '@/hooks/use-toast';
import { useGameification } from '@/hooks/useGameification';

interface PersonalizedInsight {
  id: string;
  type: 'reflection' | 'pattern' | 'growth' | 'challenge' | 'opportunity';
  title: string;
  content: string;
  actionable: boolean;
  confidence: number;
  priority: 'low' | 'medium' | 'high' | 'critical';
  tags: string[];
  generatedAt: Date;
  expiresAt?: Date;
}

interface CoachingSession {
  id: string;
  userId: string;
  sessionType: 'quick-check' | 'deep-dive' | 'pattern-analysis' | 'goal-setting';
  insights: PersonalizedInsight[];
  recommendations: string[];
  nextSteps: string[];
  consciousnessScore: number;
  sentimentAnalysis: {
    overall: 'positive' | 'neutral' | 'negative';
    emotions: Array<{ emotion: string; intensity: number }>;
    themes: string[];
  };
  createdAt: Date;
}

export function AIConsciousnessCoach() {
  const { toast } = useToast();
  const { userStats, completeConsciousnessSession } = useGameification();
  const [currentInput, setCurrentInput] = useState('');
  const [activeSession, setActiveSession] = useState<CoachingSession | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [selectedInsightType, setSelectedInsightType] = useState<string>('all');

  // Fetch recent consciousness data for personalization
  const { data: recentSessions } = useQuery({
    queryKey: ['consciousness-states', 'recent'],
    queryFn: () => consciousnessApi.getConsciousnessStates('current-user'),
    refetchInterval: 30000,
  });

  const { data: reflectionHistory } = useQuery({
    queryKey: ['reflection-logs', 'recent'],
    queryFn: () => consciousnessApi.getReflectionLogs('current-user'),
  });

  // AI coaching mutation
  const coachingMutation = useMutation({
    mutationFn: async (data: {
      input: string;
      sessionType: CoachingSession['sessionType'];
      context?: any;
    }) => {
      // This would call the AI service with consciousness-specific prompts
      const response = await consciousnessApi.processDecision(
        {
          type: 'consciousness-coaching',
          userInput: data.input,
          sessionType: data.sessionType,
          userHistory: {
            recentSessions: recentSessions?.slice(-5),
            reflections: reflectionHistory?.slice(-10),
            level: userStats.level,
            consciousnessScore: userStats.consciousnessScore,
          },
          context: data.context,
        },
        {
          model: 'claude-3-5-sonnet-20241022', // Best for consciousness analysis
          temperature: 0.7,
          maxTokens: 2000,
        }
      );
      return response;
    },
    onSuccess: (response) => {
      const session: CoachingSession = {
        id: `session-${Date.now()}`,
        userId: 'current-user',
        sessionType: 'deep-dive',
        insights: generateInsightsFromResponse(response),
        recommendations: response.recommendations || [],
        nextSteps: response.nextSteps || [],
        consciousnessScore: response.consciousnessScore || userStats.consciousnessScore,
        sentimentAnalysis: response.sentimentAnalysis || {
          overall: 'neutral',
          emotions: [],
          themes: [],
        },
        createdAt: new Date(),
      };
      
      setActiveSession(session);
      completeConsciousnessSession(session.consciousnessScore);
      
      toast({
        title: "AI Coaching Complete",
        description: `Generated ${session.insights.length} personalized insights for your growth`,
      });
    },
    onError: (error) => {
      toast({
        title: "Coaching Session Failed",
        description: error instanceof Error ? error.message : "Unable to generate insights",
        variant: "destructive",
      });
    },
    onSettled: () => {
      setIsAnalyzing(false);
    },
  });

  const generateInsightsFromResponse = (response: any): PersonalizedInsight[] => {
    // Transform AI response into structured insights
    const insights: PersonalizedInsight[] = [];
    
    if (response.patterns) {
      response.patterns.forEach((pattern: any, index: number) => {
        insights.push({
          id: `pattern-${index}`,
          type: 'pattern',
          title: `Pattern Recognition: ${pattern.title}`,
          content: pattern.description,
          actionable: pattern.actionable || false,
          confidence: pattern.confidence || 0.7,
          priority: pattern.priority || 'medium',
          tags: pattern.tags || ['pattern-recognition'],
          generatedAt: new Date(),
        });
      });
    }

    if (response.reflections) {
      response.reflections.forEach((reflection: any, index: number) => {
        insights.push({
          id: `reflection-${index}`,
          type: 'reflection',
          title: reflection.title,
          content: reflection.content,
          actionable: true,
          confidence: 0.8,
          priority: 'medium',
          tags: ['self-reflection', 'growth'],
          generatedAt: new Date(),
        });
      });
    }

    if (response.opportunities) {
      response.opportunities.forEach((opportunity: any, index: number) => {
        insights.push({
          id: `opportunity-${index}`,
          type: 'opportunity',
          title: `Growth Opportunity: ${opportunity.title}`,
          content: opportunity.description,
          actionable: true,
          confidence: opportunity.confidence || 0.6,
          priority: 'high',
          tags: ['opportunity', 'growth', 'potential'],
          generatedAt: new Date(),
        });
      });
    }

    return insights;
  };

  const startCoachingSession = (sessionType: CoachingSession['sessionType']) => {
    if (!currentInput.trim()) {
      toast({
        title: "Input Required",
        description: "Please share what's on your mind to begin the coaching session",
        variant: "destructive",
      });
      return;
    }

    setIsAnalyzing(true);
    coachingMutation.mutate({
      input: currentInput,
      sessionType,
      context: {
        timestamp: new Date().toISOString(),
        userLevel: userStats.level,
        streak: userStats.streak,
      },
    });
  };

  const getInsightIcon = (type: PersonalizedInsight['type']) => {
    switch (type) {
      case 'pattern': return <TrendingUp className="w-4 h-4" />;
      case 'reflection': return <Brain className="w-4 h-4" />;
      case 'growth': return <Sparkles className="w-4 h-4" />;
      case 'challenge': return <Target className="w-4 h-4" />;
      case 'opportunity': return <Lightbulb className="w-4 h-4" />;
      default: return <MessageCircle className="w-4 h-4" />;
    }
  };

  const getPriorityColor = (priority: PersonalizedInsight['priority']) => {
    switch (priority) {
      case 'critical': return 'destructive';
      case 'high': return 'default';
      case 'medium': return 'secondary';
      case 'low': return 'outline';
      default: return 'secondary';
    }
  };

  const filteredInsights = activeSession?.insights.filter(insight => 
    selectedInsightType === 'all' || insight.type === selectedInsightType
  ) || [];

  return (
    <div className="space-y-6">
      {/* AI Coaching Input */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="w-5 h-5" />
            AI Consciousness Coach
          </CardTitle>
          <CardDescription>
            Share your thoughts, challenges, or goals for personalized AI-powered insights
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Textarea
            placeholder="What's on your mind? Share your current thoughts, challenges, or what you'd like to explore about your consciousness journey..."
            value={currentInput}
            onChange={(e) => setCurrentInput(e.target.value)}
            className="min-h-[100px]"
          />
          
          <div className="flex flex-wrap gap-2">
            <Button
              onClick={() => startCoachingSession('quick-check')}
              disabled={isAnalyzing || !currentInput.trim()}
              size="sm"
            >
              <Zap className="w-4 h-4 mr-2" />
              Quick Check-in
            </Button>
            <Button
              onClick={() => startCoachingSession('deep-dive')}
              disabled={isAnalyzing || !currentInput.trim()}
              variant="outline"
              size="sm"
            >
              <Brain className="w-4 h-4 mr-2" />
              Deep Dive Analysis
            </Button>
            <Button
              onClick={() => startCoachingSession('pattern-analysis')}
              disabled={isAnalyzing || !currentInput.trim()}
              variant="outline"
              size="sm"
            >
              <TrendingUp className="w-4 h-4 mr-2" />
              Pattern Recognition
            </Button>
            <Button
              onClick={() => startCoachingSession('goal-setting')}
              disabled={isAnalyzing || !currentInput.trim()}
              variant="outline"
              size="sm"
            >
              <Target className="w-4 h-4 mr-2" />
              Goal Setting
            </Button>
          </div>

          {isAnalyzing && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
              AI is analyzing your input and generating personalized insights...
            </div>
          )}
        </CardContent>
      </Card>

      {/* Active Session Results */}
      {activeSession && (
        <div className="space-y-4">
          {/* Session Overview */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="w-5 h-5" />
                Coaching Session Results
                <Badge variant="outline">
                  {new Date(activeSession.createdAt).toLocaleTimeString()}
                </Badge>
              </CardTitle>
              <CardDescription>
                Consciousness Score: {activeSession.consciousnessScore}% • 
                Sentiment: {activeSession.sentimentAnalysis.overall} • 
                {activeSession.insights.length} insights generated
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <div className="text-sm font-medium">Consciousness Progress</div>
                  <Progress value={activeSession.consciousnessScore} className="h-2" />
                  <div className="text-xs text-muted-foreground">
                    {activeSession.consciousnessScore}% overall awareness
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="text-sm font-medium">Emotional Themes</div>
                  <div className="flex flex-wrap gap-1">
                    {activeSession.sentimentAnalysis.themes.slice(0, 3).map((theme, index) => (
                      <Badge key={index} variant="secondary" className="text-xs">
                        {theme}
                      </Badge>
                    ))}
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="text-sm font-medium">Session Type</div>
                  <Badge variant="outline" className="capitalize">
                    {activeSession.sessionType.replace('-', ' ')}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Insights Filter */}
          <div className="flex flex-wrap gap-2">
            <Button
              variant={selectedInsightType === 'all' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedInsightType('all')}
            >
              All Insights ({activeSession.insights.length})
            </Button>
            {['pattern', 'reflection', 'growth', 'opportunity', 'challenge'].map((type) => {
              const count = activeSession.insights.filter(i => i.type === type).length;
              if (count === 0) return null;
              
              return (
                <Button
                  key={type}
                  variant={selectedInsightType === type ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedInsightType(type)}
                  className="capitalize"
                >
                  {type} ({count})
                </Button>
              );
            })}
          </div>

          {/* Insights Display */}
          <ScrollArea className="h-[400px]">
            <div className="space-y-3">
              {filteredInsights.map((insight) => (
                <Card key={insight.id}>
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <CardTitle className="text-base flex items-center gap-2">
                        {getInsightIcon(insight.type)}
                        {insight.title}
                      </CardTitle>
                      <div className="flex items-center gap-2">
                        <Badge variant={getPriorityColor(insight.priority)} className="text-xs">
                          {insight.priority}
                        </Badge>
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Star className="w-3 h-3" />
                          {Math.round(insight.confidence * 100)}%
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-3">
                      {insight.content}
                    </p>
                    
                    {insight.actionable && (
                      <div className="flex items-center gap-2 text-xs text-primary">
                        <ArrowRight className="w-3 h-3" />
                        Actionable insight - consider implementing
                      </div>
                    )}
                    
                    <div className="flex flex-wrap gap-1 mt-2">
                      {insight.tags.map((tag, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </ScrollArea>

          {/* Recommendations & Next Steps */}
          {(activeSession.recommendations.length > 0 || activeSession.nextSteps.length > 0) && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {activeSession.recommendations.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">AI Recommendations</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {activeSession.recommendations.map((rec, index) => (
                        <li key={index} className="text-sm flex items-start gap-2">
                          <Lightbulb className="w-4 h-4 mt-0.5 text-yellow-500" />
                          {rec}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              )}
              
              {activeSession.nextSteps.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Next Steps</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {activeSession.nextSteps.map((step, index) => (
                        <li key={index} className="text-sm flex items-start gap-2">
                          <ArrowRight className="w-4 h-4 mt-0.5 text-primary" />
                          {step}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}