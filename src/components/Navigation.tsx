import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Menu, Shield, Users, MessageCircle, Scale, FileCheck, Heart, BookOpen, Brain, UserCheck, DollarSign, Settings, Activity, Building, Home } from 'lucide-react';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Separator } from '@/components/ui/separator';

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

// Safe Navigation component that works with or without a Router
export const Navigation: React.FC<NavigationProps> = ({
  showBackButton = true,
  showHomeButton = true,
  showQuickNav = false
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  
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

  const handleNavigation = (path: string) => {
    navigate(path);
  };

  return (
    <div className="sticky top-0 bg-background/95 backdrop-blur-sm border-b border-primary/20 z-50">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          {/* Left side - Hamburger Menu */}
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="h-10 w-10">
                <Menu className="h-6 w-6" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-[300px] overflow-y-auto">
              <SheetHeader>
                <SheetTitle className="text-gradient-cosmic">Pitchfork Protocol</SheetTitle>
              </SheetHeader>
              
              <div className="mt-6 space-y-6">
                {/* Core Features */}
                <div>
                  <h3 className="mb-3 text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                    Core Features
                  </h3>
                  <div className="space-y-1">
                    {coreNavItems.map((item) => {
                      const Icon = item.icon;
                      const isActive = location.pathname === item.path;
                      return (
                        <Button
                          key={item.path}
                          variant={isActive ? "secondary" : "ghost"}
                          className="w-full justify-start h-11"
                          onClick={() => {
                            handleNavigation(item.path);
                            setIsOpen(false);
                          }}
                        >
                          <Icon className="mr-3 h-5 w-5" />
                          {item.label}
                        </Button>
                      );
                    })}
                  </div>
                </div>

                <Separator />

                {/* Consciousness */}
                <div>
                  <h3 className="mb-3 text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                    Consciousness
                  </h3>
                  <div className="space-y-1">
                    {consciousnessNavItems.map((item) => {
                      const Icon = item.icon;
                      const isActive = location.pathname === item.path;
                      return (
                        <Button
                          key={item.path}
                          variant={isActive ? "secondary" : "ghost"}
                          className="w-full justify-start h-11"
                          onClick={() => {
                            handleNavigation(item.path);
                            setIsOpen(false);
                          }}
                        >
                          <Icon className="mr-3 h-5 w-5" />
                          {item.label}
                        </Button>
                      );
                    })}
                  </div>
                </div>

                <Separator />

                {/* System */}
                <div>
                  <h3 className="mb-3 text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                    System
                  </h3>
                  <div className="space-y-1">
                    {systemNavItems.map((item) => {
                      const Icon = item.icon;
                      const isActive = location.pathname === item.path;
                      return (
                        <Button
                          key={item.path}
                          variant={isActive ? "secondary" : "ghost"}
                          className="w-full justify-start h-11"
                          onClick={() => {
                            handleNavigation(item.path);
                            setIsOpen(false);
                          }}
                        >
                          <Icon className="mr-3 h-5 w-5" />
                          {item.label}
                        </Button>
                      );
                    })}
                  </div>
                </div>
              </div>
            </SheetContent>
          </Sheet>

          {/* Center - Platform title */}
          <div className="flex-1 text-center">
            <div className="text-base md:text-lg font-bold text-gradient-cosmic">
              Pitchfork Protocol
            </div>
          </div>
          
          {/* Right - Home Button */}
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-10 w-10"
            onClick={() => handleNavigation('/')}
          >
            <Home className="h-6 w-6" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Navigation;
