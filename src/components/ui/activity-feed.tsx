import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Brain, 
  Zap, 
  Trophy, 
  Target, 
  Users, 
  Vote, 
  Coins, 
  Flame,
  ChevronDown,
  Clock,
  TrendingUp
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';

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

interface ActivityFeedProps {
  activities: ActivityItem[];
  onLoadMore?: () => void;
  hasMore?: boolean;
  isLoading?: boolean;
  className?: string;
}

const activityIcons = {
  consciousness: Brain,
  achievement: Trophy,
  governance: Vote,
  token: Coins,
  collaboration: Users,
  streak: Flame
};

const activityColors = {
  consciousness: 'text-primary border-primary/30 bg-primary/10',
  achievement: 'text-accent border-accent/30 bg-accent/10',
  governance: 'text-blue-400 border-blue-400/30 bg-blue-400/10',
  token: 'text-yellow-400 border-yellow-400/30 bg-yellow-400/10',
  collaboration: 'text-green-400 border-green-400/30 bg-green-400/10',
  streak: 'text-orange-400 border-orange-400/30 bg-orange-400/10'
};

const priorityStyles = {
  low: 'opacity-70',
  medium: '',
  high: 'ring-1 ring-primary/20',
  critical: 'ring-2 ring-accent/40 glow-accent'
};

export function ActivityFeed({ 
  activities, 
  onLoadMore, 
  hasMore = false, 
  isLoading = false,
  className 
}: ActivityFeedProps) {
  const [filter, setFilter] = useState<string>('all');
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());

  const filteredActivities = activities.filter(activity => 
    filter === 'all' || activity.type === filter
  );

  const toggleExpanded = (id: string) => {
    setExpandedItems(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  const filterOptions = [
    { value: 'all', label: 'All Activity', count: activities.length },
    { value: 'consciousness', label: 'Consciousness', count: activities.filter(a => a.type === 'consciousness').length },
    { value: 'achievement', label: 'Achievements', count: activities.filter(a => a.type === 'achievement').length },
    { value: 'governance', label: 'Governance', count: activities.filter(a => a.type === 'governance').length },
    { value: 'token', label: 'Tokens', count: activities.filter(a => a.type === 'token').length }
  ];

  return (
    <Card className={cn('', className)}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-primary" />
            Activity Feed
          </CardTitle>
          
          <div className="flex gap-1">
            {filterOptions.map((option) => (
              <Button
                key={option.value}
                variant={filter === option.value ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setFilter(option.value)}
                className="h-8 text-xs"
              >
                {option.label}
                {option.count > 0 && (
                  <Badge variant="secondary" className="ml-1 h-4 px-1.5 text-xs">
                    {option.count}
                  </Badge>
                )}
              </Button>
            ))}
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="p-0">
        <ScrollArea className="h-[400px] px-6">
          <div className="space-y-3 pb-6">
            {filteredActivities.map((activity) => {
              const Icon = activityIcons[activity.type];
              const isExpanded = expandedItems.has(activity.id);
              
              return (
                <div
                  key={activity.id}
                  className={cn(
                    'flex gap-3 p-3 rounded-lg border bg-card/50 transition-cosmic hover:bg-card/80',
                    priorityStyles[activity.priority]
                  )}
                >
                  {/* Icon */}
                  <div className={cn(
                    'flex-shrink-0 p-2 rounded-full border',
                    activityColors[activity.type]
                  )}>
                    <Icon className="h-4 w-4" />
                  </div>
                  
                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between mb-1">
                      <h4 className="font-medium text-foreground leading-tight">
                        {activity.title}
                      </h4>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        {formatDistanceToNow(activity.timestamp, { addSuffix: true })}
                      </div>
                    </div>
                    
                    <p className={cn(
                      'text-sm text-muted-foreground leading-relaxed',
                      !isExpanded && 'line-clamp-2'
                    )}>
                      {activity.description}
                    </p>
                    
                    {/* Metadata */}
                    {activity.metadata && (
                      <div className="flex items-center gap-3 mt-2 text-xs">
                        {activity.metadata.xpGained && (
                          <div className="flex items-center gap-1 text-primary">
                            <Zap className="h-3 w-3" />
                            +{activity.metadata.xpGained} XP
                          </div>
                        )}
                        {activity.metadata.tokensEarned && (
                          <div className="flex items-center gap-1 text-yellow-400">
                            <Coins className="h-3 w-3" />
                            +{activity.metadata.tokensEarned} tokens
                          </div>
                        )}
                        {activity.metadata.streakCount && (
                          <div className="flex items-center gap-1 text-orange-400">
                            <Flame className="h-3 w-3" />
                            {activity.metadata.streakCount} day streak
                          </div>
                        )}
                        {activity.metadata.consciousnessScore && (
                          <div className="flex items-center gap-1 text-accent">
                            <Brain className="h-3 w-3" />
                            {activity.metadata.consciousnessScore}% consciousness
                          </div>
                        )}
                        {activity.metadata.achievementTier && (
                          <Badge 
                            variant="outline" 
                            className="h-5 text-xs capitalize"
                          >
                            {activity.metadata.achievementTier}
                          </Badge>
                        )}
                      </div>
                    )}
                    
                    {/* Expand/Collapse for long content */}
                    {activity.description.length > 100 && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleExpanded(activity.id)}
                        className="h-6 p-0 mt-1 text-xs text-muted-foreground hover:text-foreground"
                      >
                        {isExpanded ? 'Show less' : 'Show more'}
                        <ChevronDown className={cn(
                          'h-3 w-3 ml-1 transition-transform',
                          isExpanded && 'rotate-180'
                        )} />
                      </Button>
                    )}
                  </div>
                </div>
              );
            })}
            
            {/* Load More */}
            {hasMore && (
              <div className="flex justify-center pt-4">
                <Button 
                  variant="outline" 
                  onClick={onLoadMore}
                  disabled={isLoading}
                  className="w-full"
                >
                  {isLoading ? 'Loading...' : 'Load More Activity'}
                </Button>
              </div>
            )}
            
            {filteredActivities.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                <TrendingUp className="h-12 w-12 mx-auto mb-3 opacity-30" />
                <p className="text-sm">No activity yet</p>
                <p className="text-xs mt-1">Start your consciousness journey to see your activity here</p>
              </div>
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}