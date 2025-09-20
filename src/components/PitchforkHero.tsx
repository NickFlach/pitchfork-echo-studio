import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Volume2, VolumeX, Wallet, LogOut, Copy, ExternalLink } from 'lucide-react';
import { useWeb3 } from '@/hooks/useWeb3';
import { formatAddress, getNetworkName } from '@/hooks/useWeb3';
import { useToast } from '@/hooks/use-toast';
import neoTokenLogo from '@/assets/neo-token-logo.png';

export const PitchforkHero = () => {
  const [musicEnabled, setMusicEnabled] = useState(false);
  const { isConnected, account, chainId, connectWallet, disconnectWallet, isConnecting } = useWeb3();
  const { toast } = useToast();

  const handleWalletAction = () => {
    if (isConnected) {
      disconnectWallet();
      toast({
        title: "Wallet Disconnected",
        description: "Your wallet has been disconnected successfully.",
      });
    } else {
      connectWallet();
    }
  };

  const copyAddress = () => {
    if (account) {
      navigator.clipboard.writeText(account);
      toast({
        title: "Address Copied",
        description: "Wallet address copied to clipboard!",
      });
    }
  };

  const openInExplorer = () => {
    if (account && chainId) {
      let explorerUrl = '';
      switch (chainId) {
        case 1:
          explorerUrl = `https://etherscan.io/address/${account}`;
          break;
        case 137:
          explorerUrl = `https://polygonscan.com/address/${account}`;
          break;
        case 56:
          explorerUrl = `https://bscscan.com/address/${account}`;
          break;
        default:
          toast({
            title: "Explorer Not Available",
            description: "Block explorer not configured for this network.",
            variant: "destructive",
          });
          return;
      }
      window.open(explorerUrl, '_blank');
    }
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
        
        {/* Wallet connection section */}
        <div className="space-y-6 pt-8">
          {!isConnected ? (
            <Button 
              variant="cosmic" 
              size="lg"
              onClick={handleWalletAction}
              disabled={isConnecting}
              className="min-w-[200px] text-lg font-semibold"
            >
              <Wallet className="w-5 h-5 mr-2" />
              {isConnecting ? 'Connecting...' : 'Connect Wallet'}
            </Button>
          ) : (
            <div className="space-y-4">
              {/* Connected wallet info */}
              <div className="bg-background/10 backdrop-blur-sm border border-primary/20 rounded-lg p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Connected Wallet</span>
                  <Button 
                    variant="cosmicOutline" 
                    size="sm"
                    onClick={handleWalletAction}
                    className="h-8 px-3"
                  >
                    <LogOut className="w-3 h-3 mr-1" />
                    Disconnect
                  </Button>
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <code className="text-sm font-mono text-foreground bg-muted/20 px-2 py-1 rounded">
                      {formatAddress(account!)}
                    </code>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={copyAddress}
                      className="h-6 w-6 p-0"
                    >
                      <Copy className="w-3 h-3" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={openInExplorer}
                      className="h-6 w-6 p-0"
                    >
                      <ExternalLink className="w-3 h-3" />
                    </Button>
                  </div>
                  
                  {chainId && (
                    <div className="text-xs text-muted-foreground">
                      Network: {getNetworkName(chainId)}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
          
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