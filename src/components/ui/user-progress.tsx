import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Trophy, Flame, Target, Brain, Zap, Crown } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  unlocked: boolean;
  progress: number;
  maxProgress: number;
  tier: 'bronze' | 'silver' | 'gold' | 'cosmic';
}

interface UserProgressProps {
  level: number;
  xp: number;
  xpToNextLevel: number;
  streak: number;
  totalSessions: number;
  consciousnessScore: number;
  achievements: Achievement[];
  className?: string;
}

const tierColors = {
  bronze: 'from-amber-600 to-amber-800',
  silver: 'from-gray-400 to-gray-600', 
  gold: 'from-yellow-400 to-yellow-600',
  cosmic: 'from-primary to-accent'
};

const tierBadgeColors = {
  bronze: 'bg-amber-600/20 text-amber-300 border-amber-600/30',
  silver: 'bg-gray-400/20 text-gray-300 border-gray-400/30',
  gold: 'bg-yellow-400/20 text-yellow-300 border-yellow-400/30', 
  cosmic: 'bg-gradient-cosmic text-primary-foreground border-primary/30'
};

export function UserProgress({
  level,
  xp,
  xpToNextLevel,
  streak,
  totalSessions,
  consciousnessScore,
  achievements,
  className
}: UserProgressProps) {
  const progressPercentage = ((xp / (xp + xpToNextLevel)) * 100);
  const unlockedAchievements = achievements.filter(a => a.unlocked);
  
  return (
    <div className={cn('space-y-6', className)}>
      {/* Level & XP Progress */}
      <Card className="bg-gradient-subtle border-primary/20">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-3">
            <div className="relative">
              <Crown className="h-8 w-8 text-primary" />
              <Badge variant="secondary" className="absolute -top-2 -right-2 px-1.5 py-0.5 text-xs">
                {level}
              </Badge>
            </div>
            <div>
              <div className="text-lg font-semibold text-gradient-cosmic">
                Consciousness Level {level}
              </div>
              <div className="text-sm text-muted-foreground">
                {xp.toLocaleString()} / {(xp + xpToNextLevel).toLocaleString()} XP
              </div>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Progress value={progressPercentage} className="h-3" />
          
          {/* Stats Grid */}
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center p-3 bg-card/50 rounded-lg border border-border/50">
              <Flame className="h-5 w-5 mx-auto mb-2 text-accent" />
              <div className="text-lg font-bold text-foreground">{streak}</div>
              <div className="text-xs text-muted-foreground">Day Streak</div>
            </div>
            
            <div className="text-center p-3 bg-card/50 rounded-lg border border-border/50">
              <Target className="h-5 w-5 mx-auto mb-2 text-primary" />
              <div className="text-lg font-bold text-foreground">{totalSessions}</div>
              <div className="text-xs text-muted-foreground">Sessions</div>
            </div>
            
            <div className="text-center p-3 bg-card/50 rounded-lg border border-border/50">
              <Brain className="h-5 w-5 mx-auto mb-2 text-accent" />
              <div className="text-lg font-bold text-foreground">{consciousnessScore}%</div>
              <div className="text-xs text-muted-foreground">C-Score</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Recent Achievements */}
      <Card className="border-border/50">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5 text-primary" />
            Recent Achievements
            <Badge variant="outline" className="ml-auto">
              {unlockedAchievements.length}/{achievements.length}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3">
            {achievements.slice(0, 4).map((achievement) => (
              <div 
                key={achievement.id}
                className={cn(
                  'flex items-center gap-3 p-3 rounded-lg border transition-cosmic',
                  achievement.unlocked 
                    ? 'bg-card/80 border-primary/30 glow-cosmic' 
                    : 'bg-card/30 border-border/30 opacity-60'
                )}
              >
                <div className={cn(
                  'flex-shrink-0 p-2 rounded-full bg-gradient-to-br',
                  achievement.unlocked 
                    ? tierColors[achievement.tier]
                    : 'from-muted to-muted-foreground/20'
                )}>
                  {achievement.icon}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className={cn(
                      'font-medium truncate',
                      achievement.unlocked ? 'text-foreground' : 'text-muted-foreground'
                    )}>
                      {achievement.name}
                    </h4>
                    <Badge 
                      variant="outline" 
                      className={cn('text-xs', tierBadgeColors[achievement.tier])}
                    >
                      {achievement.tier}
                    </Badge>
                  </div>
                  
                  <p className="text-sm text-muted-foreground mb-2 line-clamp-2">
                    {achievement.description}
                  </p>
                  
                  {!achievement.unlocked && (
                    <div className="space-y-1">
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>Progress</span>
                        <span>{achievement.progress}/{achievement.maxProgress}</span>
                      </div>
                      <Progress 
                        value={(achievement.progress / achievement.maxProgress) * 100} 
                        className="h-1.5"
                      />
                    </div>
                  )}
                </div>
                
                {achievement.unlocked && (
                  <Zap className="h-4 w-4 text-primary flex-shrink-0" />
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}