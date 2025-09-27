import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { UserProgress } from '@/components/ui/user-progress';
import { ActivityFeed } from '@/components/ui/activity-feed';
import { SkeletonDashboard } from '@/components/ui/skeleton';
import { useGameification } from '@/hooks/useGameification';
import { pwaManager } from '@/lib/pwaManager';
import { 
  Brain, 
  Zap, 
  TrendingUp, 
  Users, 
  Crown, 
  Smartphone,
  Bell,
  Wifi,
  WifiOff,
  Sparkles
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface EnhancedConsciousnessDashboardProps {
  className?: string;
}

export function EnhancedConsciousnessDashboard({ className }: EnhancedConsciousnessDashboardProps) {
  const { userStats, achievements, activities, completeConsciousnessSession } = useGameification();
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [showInstallPrompt, setShowInstallPrompt] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  useEffect(() => {
    // Check if PWA is installable
    const checkInstallable = () => {
      if (pwaManager.isInstallable()) {
        setShowInstallPrompt(true);
      }
    };
    
    // Simulate loading
    const timer = setTimeout(() => {
      setIsLoading(false);
      checkInstallable();
    }, 1000);
    
    return () => clearTimeout(timer);
  }, []);

  const handleInstallPWA = async () => {
    const installed = await pwaManager.showInstallPrompt();
    if (installed) {
      setShowInstallPrompt(false);
    }
  };

  const handleStartSession = () => {
    // Mock consciousness session completion
    const score = Math.floor(Math.random() * 30) + 70; // 70-100% score
    completeConsciousnessSession(score);
    
    // Send notification about session completion
    pwaManager.sendNotification({
      title: "Session Complete! 🧠",
      body: `Great job! You achieved ${score}% consciousness score.`,
      data: { type: 'session_complete', score }
    });
  };

  const handleRequestNotifications = async () => {
    const granted = await pwaManager.requestNotificationPermission();
    if (granted) {
      pwaManager.sendNotification({
        title: "Notifications Enabled! 🔔",
        body: "You'll now receive consciousness insights and reminders.",
        data: { type: 'notifications_enabled' }
      });
    }
  };

  if (isLoading) {
    return <SkeletonDashboard className={className} />;
  }

  return (
    <div className={cn('space-y-6', className)}>
      {/* PWA Install Prompt */}
      {showInstallPrompt && (
        <Card className="border-primary/30 bg-gradient-subtle">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gradient-cosmic rounded-lg">
                  <Smartphone className="h-5 w-5 text-primary-foreground" />
                </div>
                <div>
                  <h3 className="font-medium text-foreground">Install Pitchfork App</h3>
                  <p className="text-sm text-muted-foreground">Get offline access and push notifications</p>
                </div>
              </div>
              <div className="flex gap-2">
                <Button onClick={handleInstallPWA} size="sm" className="bg-gradient-button">
                  Install
                </Button>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => setShowInstallPrompt(false)}
                >
                  Later
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Status Bar */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h1 className="text-2xl font-bold text-gradient-cosmic">Consciousness Hub</h1>
          <Badge variant={isOnline ? "default" : "secondary"} className="flex items-center gap-1">
            {isOnline ? <Wifi className="h-3 w-3" /> : <WifiOff className="h-3 w-3" />}
            {isOnline ? 'Online' : 'Offline'}
          </Badge>
        </div>
        
        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleRequestNotifications}
            className="flex items-center gap-2"
          >
            <Bell className="h-4 w-4" />
            Enable Notifications
          </Button>
          <Button 
            onClick={handleStartSession}
            className="bg-gradient-button flex items-center gap-2"
          >
            <Brain className="h-4 w-4" />
            Start Session
          </Button>
        </div>
      </div>

      {/* Main Dashboard */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="progress">Progress</TabsTrigger>
          <TabsTrigger value="activity">Activity</TabsTrigger>
          <TabsTrigger value="insights">Insights</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card className="bg-gradient-subtle border-primary/20">
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-sm">
                  <Crown className="h-4 w-4 text-primary" />
                  Level
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-gradient-cosmic">{userStats.level}</div>
                <p className="text-xs text-muted-foreground">
                  {userStats.xpToNextLevel} XP to next level
                </p>
              </CardContent>
            </Card>
            
            <Card className="bg-gradient-subtle border-accent/20">
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-sm">
                  <Brain className="h-4 w-4 text-accent" />
                  C-Score
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-foreground">{userStats.consciousnessScore}%</div>
                <p className="text-xs text-muted-foreground">
                  Peak consciousness level
                </p>
              </CardContent>
            </Card>
            
            <Card className="bg-gradient-subtle border-orange-400/20">
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-sm">
                  <Zap className="h-4 w-4 text-orange-400" />
                  Streak
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-foreground">{userStats.streak}</div>
                <p className="text-xs text-muted-foreground">
                  Days consecutive
                </p>
              </CardContent>
            </Card>
            
            <Card className="bg-gradient-subtle border-green-400/20">
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-sm">
                  <TrendingUp className="h-4 w-4 text-green-400" />
                  Sessions
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-foreground">{userStats.totalSessions}</div>
                <p className="text-xs text-muted-foreground">
                  Total completed
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-primary" />
                Quick Actions
              </CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Button 
                variant="outline" 
                className="h-20 flex flex-col gap-2"
                onClick={handleStartSession}
              >
                <Brain className="h-6 w-6" />
                <span className="text-sm">Deep Session</span>
              </Button>
              
              <Button 
                variant="outline" 
                className="h-20 flex flex-col gap-2"
                onClick={() => pwaManager.scheduleConsciousnessReminder(60)}
              >
                <Bell className="h-6 w-6" />
                <span className="text-sm">Set Reminder</span>
              </Button>
              
              <Button 
                variant="outline" 
                className="h-20 flex flex-col gap-2"
              >
                <Users className="h-6 w-6" />
                <span className="text-sm">Join Group</span>
              </Button>
              
              <Button 
                variant="outline" 
                className="h-20 flex flex-col gap-2"
              >
                <TrendingUp className="h-6 w-6" />
                <span className="text-sm">View Analytics</span>
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="progress">
          <UserProgress
            level={userStats.level}
            xp={userStats.xp}
            xpToNextLevel={userStats.xpToNextLevel}
            streak={userStats.streak}
            totalSessions={userStats.totalSessions}
            consciousnessScore={userStats.consciousnessScore}
            achievements={achievements}
          />
        </TabsContent>

        <TabsContent value="activity">
          <ActivityFeed 
            activities={activities}
            hasMore={false}
            isLoading={false}
          />
        </TabsContent>

        <TabsContent value="insights" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Consciousness Insights</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12 text-muted-foreground">
                <Brain className="h-16 w-16 mx-auto mb-4 opacity-30" />
                <h3 className="text-lg font-medium mb-2">AI-Powered Insights Coming Soon</h3>
                <p className="text-sm max-w-md mx-auto">
                  Advanced consciousness analysis and personalized recommendations will be available here.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}