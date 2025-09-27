import { useState, useEffect, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import { pwaManager } from '@/lib/pwaManager';

interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  unlocked: boolean;
  progress: number;
  maxProgress: number;
  tier: 'bronze' | 'silver' | 'gold' | 'cosmic';
  xpReward: number;
  tokenReward?: number;
}

interface ActivityItem {
  id: string;
  type: 'consciousness' | 'achievement' | 'governance' | 'token' | 'collaboration' | 'streak';
  title: string;
  description: string;
  timestamp: Date;
  metadata?: {
    xpGained?: number;
    tokensEarned?: number;
    streakCount?: number;
    achievementTier?: 'bronze' | 'silver' | 'gold' | 'cosmic';
    consciousnessScore?: number;
  };
  priority: 'low' | 'medium' | 'high' | 'critical';
}

interface UserStats {
  level: number;
  xp: number;
  xpToNextLevel: number;
  streak: number;
  totalSessions: number;
  consciousnessScore: number;
  totalTokens: number;
  lastActivityDate: Date | null;
}

const DEFAULT_ACHIEVEMENTS: Achievement[] = [
  {
    id: 'first_session',
    name: 'First Step',
    description: 'Complete your first consciousness session',
    icon: '🧠',
    unlocked: false,
    progress: 0,
    maxProgress: 1,
    tier: 'bronze',
    xpReward: 100
  },
  {
    id: 'week_streak',
    name: 'Mindful Week',
    description: 'Maintain a 7-day consciousness streak',
    icon: '🔥',
    unlocked: false,
    progress: 0,
    maxProgress: 7,
    tier: 'silver',
    xpReward: 500
  },
  {
    id: 'governance_voter',
    name: 'Democratic Voice',
    description: 'Participate in 5 governance votes',
    icon: '🗳️',
    unlocked: false,
    progress: 0,
    maxProgress: 5,
    tier: 'silver',
    xpReward: 300
  },
  {
    id: 'consciousness_master',
    name: 'Consciousness Master',
    description: 'Achieve 90%+ consciousness score',
    icon: '👑',
    unlocked: false,
    progress: 0,
    maxProgress: 90,
    tier: 'gold',
    xpReward: 1000,
    tokenReward: 50
  },
  {
    id: 'cosmic_leader',
    name: 'Cosmic Leader',
    description: 'Complete 100 consciousness sessions',
    icon: '🌟',
    unlocked: false,
    progress: 0,
    maxProgress: 100,
    tier: 'cosmic',
    xpReward: 2500,
    tokenReward: 100
  }
];

export function useGameification() {
  const { toast } = useToast();
  const [userStats, setUserStats] = useState<UserStats>({
    level: 1,
    xp: 0,
    xpToNextLevel: 1000,
    streak: 0,
    totalSessions: 0,
    consciousnessScore: 0,
    totalTokens: 0,
    lastActivityDate: null
  });
  
  const [achievements, setAchievements] = useState<Achievement[]>(DEFAULT_ACHIEVEMENTS);
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  
  // Load data from localStorage on mount
  useEffect(() => {
    const savedStats = localStorage.getItem('pitchfork_user_stats');
    const savedAchievements = localStorage.getItem('pitchfork_achievements');
    const savedActivities = localStorage.getItem('pitchfork_activities');
    
    if (savedStats) {
      const parsed = JSON.parse(savedStats);
      parsed.lastActivityDate = parsed.lastActivityDate ? new Date(parsed.lastActivityDate) : null;
      setUserStats(parsed);
    }
    
    if (savedAchievements) {
      setAchievements(JSON.parse(savedAchievements));
    }
    
    if (savedActivities) {
      const parsed = JSON.parse(savedActivities);
      const activitiesWithDates = parsed.map((activity: any) => ({
        ...activity,
        timestamp: new Date(activity.timestamp)
      }));
      setActivities(activitiesWithDates);
    }
  }, []);
  
  // Save to localStorage whenever data changes
  useEffect(() => {
    localStorage.setItem('pitchfork_user_stats', JSON.stringify(userStats));
  }, [userStats]);
  
  useEffect(() => {
    localStorage.setItem('pitchfork_achievements', JSON.stringify(achievements));
  }, [achievements]);
  
  useEffect(() => {
    localStorage.setItem('pitchfork_activities', JSON.stringify(activities));
  }, [activities]);

  const calculateLevel = (totalXp: number): { level: number; xpToNext: number } => {
    let level = 1;
    let xpRequired = 1000;
    let totalRequired = 0;
    
    while (totalXp >= totalRequired + xpRequired) {
      totalRequired += xpRequired;
      level++;
      xpRequired = Math.floor(xpRequired * 1.2); // 20% increase per level
    }
    
    const xpToNext = (totalRequired + xpRequired) - totalXp;
    return { level, xpToNext };
  };

  const awardXP = useCallback((amount: number, reason: string) => {
    setUserStats(prev => {
      const newXp = prev.xp + amount;
      const { level, xpToNext } = calculateLevel(newXp);
      
      // Check for level up
      if (level > prev.level) {
        toast({
          title: "🎉 Level Up!",
          description: `You've reached level ${level}! Keep up the consciousness growth.`,
        });
        
        // Send level up notification
        pwaManager.sendNotification({
          title: "Level Up Achievement!",
          body: `Congratulations! You've reached consciousness level ${level}`,
          data: { type: 'level_up', level }
        });
      }
      
      return {
        ...prev,
        xp: newXp,
        level,
        xpToNextLevel: xpToNext
      };
    });
    
    // Add activity
    addActivity({
      type: 'consciousness',
      title: 'XP Gained',
      description: reason,
      metadata: { xpGained: amount },
      priority: 'medium'
    });
  }, [toast]);

  const updateStreak = useCallback(() => {
    const now = new Date();
    const today = now.toDateString();
    
    setUserStats(prev => {
      const lastActivity = prev.lastActivityDate?.toDateString();
      let newStreak = prev.streak;
      
      if (lastActivity !== today) {
        const yesterday = new Date(now);
        yesterday.setDate(yesterday.getDate() - 1);
        
        if (lastActivity === yesterday.toDateString()) {
          // Continue streak
          newStreak = prev.streak + 1;
        } else if (lastActivity !== today) {
          // Reset streak if more than 1 day gap
          newStreak = 1;
        }
        
        // Check streak achievements
        checkAchievementProgress('week_streak', newStreak);
        
        if (newStreak > prev.streak) {
          toast({
            title: "🔥 Streak Maintained!",
            description: `${newStreak} day consciousness streak! Keep it going!`,
          });
        }
        
        return {
          ...prev,
          streak: newStreak,
          lastActivityDate: now
        };
      }
      
      return prev;
    });
  }, [toast]);

  const checkAchievementProgress = useCallback((achievementId: string, progress: number) => {
    setAchievements(prev => prev.map(achievement => {
      if (achievement.id === achievementId && !achievement.unlocked) {
        const newProgress = Math.min(progress, achievement.maxProgress);
        
        if (newProgress >= achievement.maxProgress) {
          // Achievement unlocked!
          toast({
            title: "🏆 Achievement Unlocked!",
            description: `${achievement.name} - ${achievement.description}`,
          });
          
          // Award XP and tokens
          setUserStats(stats => ({
            ...stats,
            xp: stats.xp + achievement.xpReward,
            totalTokens: stats.totalTokens + (achievement.tokenReward || 0)
          }));
          
          // Send achievement notification
          pwaManager.sendNotification({
            title: "Achievement Unlocked! 🏆",
            body: `${achievement.name} - You earned ${achievement.xpReward} XP!`,
            data: { type: 'achievement', achievementId }
          });
          
          // Add activity
          addActivity({
            type: 'achievement',
            title: 'Achievement Unlocked',
            description: `${achievement.name} - ${achievement.description}`,
            metadata: { 
              xpGained: achievement.xpReward,
              tokensEarned: achievement.tokenReward,
              achievementTier: achievement.tier
            },
            priority: 'high'
          });
          
          return { ...achievement, unlocked: true, progress: newProgress };
        }
        
        return { ...achievement, progress: newProgress };
      }
      return achievement;
    }));
  }, [toast]);

  const addActivity = useCallback((activity: Omit<ActivityItem, 'id' | 'timestamp'>) => {
    const newActivity: ActivityItem = {
      ...activity,
      id: `activity_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date()
    };
    
    setActivities(prev => [newActivity, ...prev].slice(0, 100)); // Keep last 100 activities
  }, []);

  const completeConsciousnessSession = useCallback((score: number) => {
    updateStreak();
    
    const baseXp = 50;
    const bonusXp = Math.floor((score / 100) * 50); // Up to 50 bonus XP for perfect score
    const totalXp = baseXp + bonusXp;
    
    awardXP(totalXp, `Completed consciousness session with ${score}% score`);
    
    setUserStats(prev => ({
      ...prev,
      totalSessions: prev.totalSessions + 1,
      consciousnessScore: Math.max(prev.consciousnessScore, score)
    }));
    
    // Check achievements
    checkAchievementProgress('first_session', 1);
    checkAchievementProgress('consciousness_master', score);
    checkAchievementProgress('cosmic_leader', userStats.totalSessions + 1);
    
    addActivity({
      type: 'consciousness',
      title: 'Session Completed',
      description: `Achieved ${score}% consciousness score`,
      metadata: { 
        xpGained: totalXp,
        consciousnessScore: score
      },
      priority: 'medium'
    });
  }, [awardXP, updateStreak, checkAchievementProgress, addActivity, userStats.totalSessions]);

  const participateInGovernance = useCallback((proposalTitle: string) => {
    awardXP(25, `Voted on proposal: ${proposalTitle}`);
    
    // Update governance participation progress
    const currentProgress = achievements.find(a => a.id === 'governance_voter')?.progress || 0;
    checkAchievementProgress('governance_voter', currentProgress + 1);
    
    addActivity({
      type: 'governance',
      title: 'Governance Vote',
      description: `Voted on: ${proposalTitle}`,
      metadata: { xpGained: 25 },
      priority: 'medium'
    });
  }, [awardXP, checkAchievementProgress, addActivity, achievements]);

  const earnTokens = useCallback((amount: number, reason: string) => {
    setUserStats(prev => ({
      ...prev,
      totalTokens: prev.totalTokens + amount
    }));
    
    addActivity({
      type: 'token',
      title: 'Tokens Earned',
      description: reason,
      metadata: { tokensEarned: amount },
      priority: 'low'
    });
  }, [addActivity]);

  return {
    userStats,
    achievements,
    activities,
    completeConsciousnessSession,
    participateInGovernance,
    earnTokens,
    awardXP,
    addActivity
  };
}