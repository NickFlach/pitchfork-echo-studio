import React from 'react';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Home, Shield, Users, MessageCircle, Scale, FileCheck, Heart, BookOpen, Brain, UserCheck, DollarSign, Settings, Activity, Building } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Web3ConnectButton from './Web3ConnectButton';

interface NavigationItem {
  path: string;
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  group?: 'core' | 'consciousness' | 'system';
}

interface NavigationProps {
  showBackButton?: boolean;
  showHomeButton?: boolean;
  showQuickNav?: boolean;
}

// Navigation component with React Router integration
export const Navigation: React.FC<NavigationProps> = ({ 
  showBackButton = true, 
  showHomeButton = true,
  showQuickNav = false 
}) => {
  const navigate = useNavigate();

  // Organized navigation items by functional groups
  const coreNavItems: NavigationItem[] = [
    { path: '/identity', icon: Shield, label: 'Identity', group: 'core' },
    { path: '/organize', icon: Users, label: 'Organize', group: 'core' },
    { path: '/messages', icon: MessageCircle, label: 'Messages', group: 'core' },
    { path: '/governance', icon: Scale, label: 'Governance', group: 'core' },
    { path: '/verify', icon: FileCheck, label: 'Verify', group: 'core' },
    { path: '/support', icon: Heart, label: 'Support', group: 'core' },
  ];

  const consciousnessNavItems: NavigationItem[] = [
    { path: '/whitepaper', icon: BookOpen, label: 'Whitepaper', group: 'consciousness' },
    { path: '/consciousness', icon: Brain, label: 'Consciousness', group: 'consciousness' },
    { path: '/leadership', icon: UserCheck, label: 'Leadership', group: 'consciousness' },
    { path: '/enterprise-leadership', icon: Building, label: 'Enterprise', group: 'consciousness' },
  ];

  const systemNavItems: NavigationItem[] = [
    { path: '/funding', icon: DollarSign, label: 'Funding', group: 'system' },
    { path: '/ai-settings', icon: Settings, label: 'AI Settings', group: 'system' },
    { path: '/provider-health', icon: Activity, label: 'Provider Health', group: 'system' },
  ];

  // Combine all navigation items for backward compatibility
  const allNavItems = [...coreNavItems, ...consciousnessNavItems, ...systemNavItems];

  return (
    <div className="sticky top-0 bg-background/80 backdrop-blur-sm border-b border-primary/20 z-10">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Left side - Back and Home buttons */}
          <div className="flex items-center gap-2">
            {showBackButton && (
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => navigate(-1)}
                className="flex items-center gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                Back
              </Button>
            )}
            {showHomeButton && (
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => navigate('/')}
                className="flex items-center gap-2"
              >
                <Home className="w-4 h-4" />
                Home
              </Button>
            )}
          </div>

          {/* Center - Quick navigation (optional) */}
          {showQuickNav && (
            <div className="hidden md:flex items-center gap-1">
              {allNavItems.map((item) => {
                const Icon = item.icon;
                const isActive = window.location.pathname === item.path;
                return (
                  <Button
                    key={item.path}
                    variant={isActive ? "cosmic" : "ghost"}
                    size="sm"
                    onClick={() => navigate(item.path)}
                    className="flex items-center gap-1"
                  >
                    <Icon className="w-4 h-4" />
                    <span className="hidden lg:inline">{item.label}</span>
                  </Button>
                );
              })}
            </div>
          )}

          {/* Right side - Web3 Connect and Platform title */}
          <div className="flex items-center gap-4">
            <Web3ConnectButton />
            <div className="text-sm font-semibold text-gradient-cosmic">
              Pitchfork Protocol
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Navigation;
