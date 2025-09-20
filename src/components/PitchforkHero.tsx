import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Volume2, VolumeX, Wallet } from 'lucide-react';
import neoTokenLogo from '@/assets/neo-token-logo.png';

export const PitchforkHero = () => {
  const [musicEnabled, setMusicEnabled] = useState(false);

  const handleConnectWallet = () => {
    // TODO: Implement wallet connection logic
    console.log('Connect wallet clicked');
  };

  const toggleMusic = () => {
    setMusicEnabled(!musicEnabled);
    console.log('Music toggled:', !musicEnabled);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-subtle">
      <div className="text-center space-y-8 px-4">
        {/* Logo */}
        <div className="flex justify-center mb-8">
          <img 
            src={neoTokenLogo} 
            alt="Neo Token Logo" 
            className="w-32 h-32 transition-cosmic hover:scale-110 glow-cosmic rounded-full"
          />
        </div>
        
        {/* Main heading with gradient text */}
        <div className="space-y-4">
          <h1 className="text-6xl md:text-7xl font-bold text-gradient-cosmic tracking-tight">
            Pitchfork Protocol
          </h1>
          <p className="text-xl text-muted-foreground">
            A tool for humanity
          </p>
        </div>
        
        {/* Action buttons */}
        <div className="space-y-4 pt-8">
          <Button 
            variant="cosmic" 
            size="lg"
            onClick={handleConnectWallet}
            className="min-w-[200px] text-lg font-semibold"
          >
            <Wallet className="w-5 h-5 mr-2" />
            Connect Wallet
          </Button>
          
          <div className="pt-4">
            <Button 
              variant="cosmicOutline" 
              size="default"
              onClick={toggleMusic}
              className="min-w-[160px]"
            >
              {musicEnabled ? (
                <>
                  <VolumeX className="w-4 h-4 mr-2" />
                  Turn Music Off
                </>
              ) : (
                <>
                  <Volume2 className="w-4 h-4 mr-2" />
                  Turn Music On
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
      
      {/* Ambient background effects */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-primary/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
        <div className="absolute top-1/2 right-1/3 w-48 h-48 bg-cosmic/10 rounded-full blur-2xl animate-pulse" style={{ animationDelay: '2s' }}></div>
      </div>
    </div>
  );
};