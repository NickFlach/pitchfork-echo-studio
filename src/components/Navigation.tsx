import React from 'react';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Home, Shield, Users, MessageCircle, Scale, FileCheck, Heart, BookOpen, Brain, UserCheck, DollarSign, Settings, Activity, Building } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import Web3ConnectButton from './Web3ConnectButton';

interface NavigationProps {
  showBackButton?: boolean;
  showHomeButton?: boolean;
  showQuickNav?: boolean;
}

export const Navigation: React.FC<NavigationProps> = ({ 
  showBackButton = true, 
  showHomeButton = true,
  showQuickNav = false 
}) => {
  const navigate = useNavigate();
  const location = useLocation();

  const quickNavItems = [
    { path: '/identity', icon: Shield, label: 'Identity' },
    { path: '/organize', icon: Users, label: 'Organize' },
    { path: '/messages', icon: MessageCircle, label: 'Messages' },
    { path: '/governance', icon: Scale, label: 'Governance' },
    { path: '/verify', icon: FileCheck, label: 'Verify' },
    { path: '/support', icon: Heart, label: 'Support' },
    { path: '/whitepaper', icon: BookOpen, label: 'Whitepaper' },
    { path: '/consciousness', icon: Brain, label: 'Consciousness' },
    { path: '/leadership', icon: UserCheck, label: 'Leadership' },
    { path: '/enterprise-leadership', icon: Building, label: 'Enterprise' },
    { path: '/funding', icon: DollarSign, label: 'Funding' },
    { path: '/ai-settings', icon: Settings, label: 'AI Settings' },
    { path: '/provider-health', icon: Activity, label: 'Provider Health' },
  ];

  const currentPath = location.pathname;

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
              {quickNavItems.map((item) => {
                const Icon = item.icon;
                const isActive = currentPath === item.path;
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
