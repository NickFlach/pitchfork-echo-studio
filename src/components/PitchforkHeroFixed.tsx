import React from 'react';
import { Button } from '@/components/ui/button';
import { Shield, Users, FileCheck, Heart, ChevronRight, MessageCircle, Scale, BookOpen, DollarSign, Github } from 'lucide-react';
import neoTokenLogo from '@/assets/neo-token-logo.png';
import { Navigation } from '@/components/Navigation';
import Web3ConnectButton from '@/components/Web3ConnectButton';

export const PitchforkHero = React.memo(() => {
  const go = (path: string) => { window.location.href = path; };

  return (
    <div className="min-h-screen bg-gradient-subtle">
      <Navigation showBackButton={false} showQuickNav={true} />
      
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-8 px-4">
          {/* Logo */}
          <div className="flex justify-center mb-8">
            <img src={neoTokenLogo} alt="Neo Token Logo" className="w-32 h-32 transition-cosmic hover:scale-110 glow-cosmic rounded-full" />
          </div>
          
          {/* Main heading with gradient text */}
          <div className="space-y-4">
            <h1 className="text-6xl md:text-7xl font-bold text-gradient-cosmic tracking-tight">
              Pitchfork Protocol
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Decentralized tools for peaceful resistance against corruption and injustice
            </p>
            <p className="text-sm text-muted-foreground/80 max-w-xl mx-auto mt-2">
              Organize. Verify. Fund. Fight back legally and safely.
            </p>
          </div>
          
          {/* Action buttons - always visible */}
          <div className="space-y-6 pt-8">
            {/* Primary Actions - Always accessible */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center flex-wrap">
              <Button variant="cosmicOutline" size="lg" onClick={() => go('/whitepaper')} className="min-w-[180px] text-lg font-semibold">
                <BookOpen className="w-5 h-5 mr-2" />
                Read Whitepaper
              </Button>
              
              <Button variant="cosmic" size="lg" onClick={() => go('/funding')} className="min-w-[180px] text-lg font-semibold bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700">
                <DollarSign className="w-5 h-5 mr-2" />
                Fund Development
              </Button>

              <Button variant="cosmicOutline" size="lg" onClick={() => window.open('https://github.com/NickFlach/pitchfork-echo-studio', '_blank')} className="min-w-[180px] text-lg font-semibold">
                <Github className="w-5 h-5 mr-2" />
                View Source
              </Button>

              {/* Shared wallet connect button (same as top-right) */}
              <Web3ConnectButton />
            </div>
            
            {/* Introduction text - always visible */}
            <div className="max-w-3xl mx-auto text-center space-y-4">
              <p className="text-muted-foreground">
                Learn how decentralized tools can help you fight corruption, organize resistance, 
                and build a more just world. Our comprehensive whitepaper explains everything you need to know.
              </p>
              <p className="text-sm text-muted-foreground/80">
                Connect your wallet to access the full platform and start taking action.
              </p>
            </div>
            
            {/* Core Platform Features */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pt-6 max-w-6xl mx-auto">
              <Button variant="cosmicOutline" className="flex items-center justify-between p-4 h-auto" onClick={() => go('/identity')}>
                <div className="flex items-center">
                  <Shield className="w-5 h-5 mr-3" />
                  <div className="text-left">
                    <div className="font-semibold">Secure Identity</div>
                    <div className="text-xs text-muted-foreground">Privacy-first verification</div>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4" />
              </Button>
              
              <Button variant="cosmicOutline" className="flex items-center justify-between p-4 h-auto" onClick={() => go('/organize')}>
                <div className="flex items-center">
                  <Users className="w-5 h-5 mr-3" />
                  <div className="text-left">
                    <div className="font-semibold">Organize</div>
                    <div className="text-xs text-muted-foreground">Coordinate resistance</div>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4" />
              </Button>
              
              <Button variant="cosmicOutline" className="flex items-center justify-between p-4 h-auto" onClick={() => go('/messages')}>
                <div className="flex items-center">
                  <MessageCircle className="w-5 h-5 mr-3" />
                  <div className="text-left">
                    <div className="font-semibold">Secure Messages</div>
                    <div className="text-xs text-muted-foreground">Encrypted communication</div>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4" />
              </Button>

              <Button variant="cosmicOutline" className="flex items-center justify-between p-4 h-auto" onClick={() => go('/governance')}>
                <div className="flex items-center">
                  <Scale className="w-5 h-5 mr-3" />
                  <div className="text-left">
                    <div className="font-semibold">DAO Governance</div>
                    <div className="text-xs text-muted-foreground">Democratic decisions</div>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4" />
              </Button>
              
              <Button variant="cosmicOutline" className="flex items-center justify-between p-4 h-auto" onClick={() => go('/verify')}>
                <div className="flex items-center">
                  <FileCheck className="w-5 h-5 mr-3" />
                  <div className="text-left">
                    <div className="font-semibold">Verify</div>
                    <div className="text-xs text-muted-foreground">Document truth</div>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4" />
              </Button>
              
              <Button variant="cosmicOutline" className="flex items-center justify-between p-4 h-auto" onClick={() => go('/support')}>
                <div className="flex items-center">
                  <Heart className="w-5 h-5 mr-3" />
                  <div className="text-left">
                    <div className="font-semibold">Support</div>
                    <div className="text-xs text-muted-foreground">Fund justice</div>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>
      
      {/* Ambient background effects */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-primary/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent/10 rounded-full blur-3xl animate-pulse" style={{
          animationDelay: '1s'
        }}></div>
        <div className="absolute top-1/2 right-1/3 w-48 h-48 bg-cosmic/10 rounded-full blur-2xl animate-pulse" style={{
          animationDelay: '2s'
        }}></div>
      </div>
    </div>
  );
});

PitchforkHero.displayName = 'PitchforkHero';