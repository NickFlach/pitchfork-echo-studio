import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAchievements } from '@/hooks/useContracts';
import { useToast } from '@/hooks/use-toast';
import { AchievementCategory, AchievementLevel } from '@/lib/contracts';
import { Trophy, Star, Zap, Brain, Shield, Eye, Users, Lightbulb } from 'lucide-react';

const CATEGORY_INFO = {
  [AchievementCategory.CONSCIOUS_LEADER]: {
    name: 'Conscious Leader',
    icon: Brain,
    color: 'bg-purple-500',
    description: 'Masters of self-aware leadership'
  },
  [AchievementCategory.STRATEGIC_THINKER]: {
    name: 'Strategic Thinker',
    icon: Lightbulb,
    color: 'bg-blue-500',
    description: 'Experts in long-term strategic planning'
  },
  [AchievementCategory.CRISIS_MANAGER]: {
    name: 'Crisis Manager',
    icon: Shield,
    color: 'bg-red-500',
    description: 'Skilled in navigating challenging situations'
  },
  [AchievementCategory.INNOVATION_CATALYST]: {
    name: 'Innovation Catalyst',
    icon: Zap,
    color: 'bg-yellow-500',
    description: 'Drivers of creative transformation'
  },
  [AchievementCategory.ETHICAL_GUARDIAN]: {
    name: 'Ethical Guardian',
    icon: Shield,
    color: 'bg-green-500',
    description: 'Champions of ethical decision-making'
  },
  [AchievementCategory.WISDOM_KEEPER]: {
    name: 'Wisdom Keeper',
    icon: Eye,
    color: 'bg-indigo-500',
    description: 'Custodians of deep insight and knowledge'
  },
  [AchievementCategory.TRANSFORMATION_AGENT]: {
    name: 'Transformation Agent',
    icon: Star,
    color: 'bg-pink-500',
    description: 'Leaders of organizational change'
  },
  [AchievementCategory.COLLABORATION_MASTER]: {
    name: 'Collaboration Master',
    icon: Users,
    color: 'bg-teal-500',
    description: 'Experts in team dynamics and collaboration'
  },
};

const LEVEL_INFO = {
  [AchievementLevel.BRONZE]: { name: 'Bronze', color: 'text-orange-600', bgColor: 'bg-orange-100' },
  [AchievementLevel.SILVER]: { name: 'Silver', color: 'text-gray-600', bgColor: 'bg-gray-100' },
  [AchievementLevel.GOLD]: { name: 'Gold', color: 'text-yellow-600', bgColor: 'bg-yellow-100' },
  [AchievementLevel.PLATINUM]: { name: 'Platinum', color: 'text-purple-600', bgColor: 'bg-purple-100' },
  [AchievementLevel.DIAMOND]: { name: 'Diamond', color: 'text-blue-600', bgColor: 'bg-blue-100' },
  [AchievementLevel.TRANSCENDENT]: { name: 'Transcendent', color: 'text-violet-600', bgColor: 'bg-violet-100' },
};

export const AchievementsGallery = () => {
  const { achievements, loading, evolveAchievement, refetch } = useAchievements();
  const { toast } = useToast();
  const [evolvingTokens, setEvolvingTokens] = useState<Set<number>>(new Set());

  const handleEvolveAchievement = async (tokenId: number) => {
    setEvolvingTokens(prev => new Set(prev).add(tokenId));
    
    try {
      const tx = await evolveAchievement(tokenId);
      
      toast({
        title: 'Evolution Transaction Submitted',
        description: 'Your achievement is being evolved. Please wait for confirmation.',
      });

      await tx.wait();
      
      toast({
        title: 'Achievement Evolved!',
        description: 'Your achievement has been successfully evolved to the next level.',
      });

      await refetch();
    } catch (error: any) {
      console.error('Evolution error:', error);
      toast({
        title: 'Evolution Failed',
        description: error.message || 'Failed to evolve achievement',
        variant: 'destructive',
      });
    } finally {
      setEvolvingTokens(prev => {
        const newSet = new Set(prev);
        newSet.delete(tokenId);
        return newSet;
      });
    }
  };

  const renderAchievementCard = (achievement: any) => {
    const categoryInfo = CATEGORY_INFO[achievement.category];
    const levelInfo = LEVEL_INFO[achievement.level];
    const Icon = categoryInfo.icon;
    const isEvolving = evolvingTokens.has(achievement.tokenId);

    return (
      <Card key={achievement.tokenId} className="relative overflow-hidden">
        <div className={`absolute top-0 left-0 w-full h-1 ${categoryInfo.color}`} />
        
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className={`p-2 rounded-lg ${categoryInfo.color} text-white`}>
                <Icon className="h-4 w-4" />
              </div>
              <div>
                <CardTitle className="text-sm">{categoryInfo.name}</CardTitle>
                <Badge 
                  variant="secondary" 
                  className={`${levelInfo.color} ${levelInfo.bgColor}`}
                >
                  {levelInfo.name}
                </Badge>
              </div>
            </div>
            <div className="text-right">
              <div className="text-xs text-muted-foreground">Token #{achievement.tokenId}</div>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-3">
          <p className="text-sm text-muted-foreground">{categoryInfo.description}</p>
          
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-muted-foreground">Consciousness Score</span>
              <div className="font-medium">{achievement.consciousnessScore}/1000</div>
              <Progress 
                value={(achievement.consciousnessScore / 1000) * 100} 
                className="h-1 mt-1"
              />
            </div>
            <div>
              <span className="text-muted-foreground">Assessment Score</span>
              <div className="font-medium">{achievement.assessmentScore}/1000</div>
              <Progress 
                value={(achievement.assessmentScore / 1000) * 100} 
                className="h-1 mt-1"
              />
            </div>
          </div>

          {achievement.skills && achievement.skills.length > 0 && (
            <div>
              <span className="text-sm text-muted-foreground">Skills Unlocked:</span>
              <div className="flex flex-wrap gap-1 mt-1">
                {achievement.skills.slice(0, 3).map((skill: string, index: number) => (
                  <Badge key={index} variant="outline" className="text-xs">
                    {skill}
                  </Badge>
                ))}
                {achievement.skills.length > 3 && (
                  <Badge variant="outline" className="text-xs">
                    +{achievement.skills.length - 3} more
                  </Badge>
                )}
              </div>
            </div>
          )}

          <div className="pt-2">
            {achievement.canEvolve ? (
              <Button
                onClick={() => handleEvolveAchievement(achievement.tokenId)}
                disabled={isEvolving}
                size="sm"
                className="w-full"
                data-testid={`button-evolve-${achievement.tokenId}`}
              >
                {isEvolving ? 'Evolving...' : 'Evolve Achievement'}
              </Button>
            ) : (
              <div className="text-center">
                <p className="text-xs text-muted-foreground">{achievement.reason}</p>
                {achievement.level === AchievementLevel.TRANSCENDENT && (
                  <Badge variant="secondary" className="mt-1">
                    <Trophy className="h-3 w-3 mr-1" />
                    Max Level Reached
                  </Badge>
                )}
              </div>
            )}
          </div>

          <div className="text-xs text-muted-foreground space-y-1">
            <div>Issued: {new Date(achievement.issuedAt * 1000).toLocaleDateString()}</div>
            <div>Last Updated: {new Date(achievement.lastEvolution * 1000).toLocaleDateString()}</div>
          </div>
        </CardContent>
      </Card>
    );
  };

  const groupedAchievements = achievements.reduce((acc, achievement) => {
    const category = achievement.category;
    if (!acc[category]) acc[category] = [];
    acc[category].push(achievement);
    return acc;
  }, {} as Record<number, any[]>);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12" data-testid="achievements-loading">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading your achievements...</p>
        </div>
      </div>
    );
  }

  if (achievements.length === 0) {
    return (
      <div className="text-center py-12" data-testid="no-achievements">
        <Trophy className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
        <h3 className="text-lg font-medium mb-2">No Achievements Yet</h3>
        <p className="text-muted-foreground mb-6">
          Complete consciousness assessments and leadership challenges to earn your first achievements.
        </p>
        <Button>Start Your Journey</Button>
      </div>
    );
  }

  return (
    <div className="space-y-6" data-testid="achievements-gallery">
      {/* Overview Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold">{achievements.length}</div>
            <p className="text-sm text-muted-foreground">Total Achievements</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold">
              {achievements.filter(a => a.canEvolve).length}
            </div>
            <p className="text-sm text-muted-foreground">Ready to Evolve</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold">
              {Object.keys(groupedAchievements).length}
            </div>
            <p className="text-sm text-muted-foreground">Categories Unlocked</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold">
              {Math.round(achievements.reduce((sum, a) => sum + a.consciousnessScore, 0) / achievements.length) || 0}
            </div>
            <p className="text-sm text-muted-foreground">Avg. Consciousness</p>
          </CardContent>
        </Card>
      </div>

      {/* Achievements Grid */}
      <Tabs defaultValue="all" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="all">All Achievements</TabsTrigger>
          <TabsTrigger value="evolvable">Ready to Evolve</TabsTrigger>
          <TabsTrigger value="maxed">Maxed Out</TabsTrigger>
        </TabsList>
        
        <TabsContent value="all" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {achievements.map(renderAchievementCard)}
          </div>
        </TabsContent>
        
        <TabsContent value="evolvable" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {achievements
              .filter(a => a.canEvolve)
              .map(renderAchievementCard)}
          </div>
          {achievements.filter(a => a.canEvolve).length === 0 && (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No achievements ready to evolve yet.</p>
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="maxed" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {achievements
              .filter(a => a.level === AchievementLevel.TRANSCENDENT)
              .map(renderAchievementCard)}
          </div>
          {achievements.filter(a => a.level === AchievementLevel.TRANSCENDENT).length === 0 && (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No transcendent achievements yet. Keep growing!</p>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};