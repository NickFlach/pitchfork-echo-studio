import React, { useMemo, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Shield, Users, FileCheck, Heart, Wallet, LogOut, Copy, ExternalLink, ChevronRight, MessageCircle, Scale, BookOpen, DollarSign, Github } from 'lucide-react';
import { useWeb3 } from '@/hooks/useWeb3';
import { formatAddress, getNetworkName } from '@/hooks/useWeb3';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import neoTokenLogo from '@/assets/neo-token-logo.png';
import { Navigation } from '@/components/Navigation';

export const PitchforkHero = React.memo(() => {
  const {
    isConnected,
    account,
    chainId,
    connectWallet,
    disconnectWallet,
    isConnecting
  } = useWeb3();
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleWalletAction = useCallback(() => {
    if (isConnected) {
      disconnectWallet();
      toast({
        title: "Wallet Disconnected",
        description: "Your wallet has been disconnected successfully."
      });
    } else {
      connectWallet();
    }
  }, [isConnected, disconnectWallet, connectWallet, toast]);

  const copyAddress = useCallback(() => {
    if (account) {
      navigator.clipboard.writeText(account);
      toast({
        title: "Address Copied",
        description: "Wallet address copied to clipboard!"
      });
    }
  }, [account, toast]);

  const openInExplorer = useCallback(() => {
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
            variant: "destructive"
          });
          return;
      }
      window.open(explorerUrl, '_blank');
    }
  }, [account, chainId, toast]);

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
              <Button variant="cosmicOutline" size="lg" onClick={() => navigate('/whitepaper')} className="min-w-[180px] text-lg font-semibold">
                <BookOpen className="w-5 h-5 mr-2" />
                Read Whitepaper
              </Button>
              
              <Button variant="cosmic" size="lg" onClick={() => navigate('/funding')} className="min-w-[180px] text-lg font-semibold bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700">
                <DollarSign className="w-5 h-5 mr-2" />
                Fund Development
              </Button>

              <Button variant="cosmicOutline" size="lg" onClick={() => window.open('https://github.com/NickFlach/pitchfork-echo-studio', '_blank')} className="min-w-[180px] text-lg font-semibold">
                <Github className="w-5 h-5 mr-2" />
                View Source
              </Button>
              
              {!isConnected ? (
                <Button variant="cosmic" size="lg" onClick={handleWalletAction} disabled={isConnecting} className="min-w-[200px] text-lg font-semibold">
                  <Wallet className="w-5 h-5 mr-2" />
                  {isConnecting ? 'Connecting...' : 'Connect Wallet'}
                </Button>
              ) : (
                <div className="space-y-4">
                  {/* Connected wallet info */}
                  <div className="bg-background/10 backdrop-blur-sm border border-primary/20 rounded-lg p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Connected Wallet</span>
                      <Button variant="cosmicOutline" size="sm" onClick={handleWalletAction} className="h-8 px-3">
                        <LogOut className="w-3 h-3 mr-1" />
                        Disconnect
                      </Button>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <code className="text-sm font-mono text-foreground bg-muted/20 px-2 py-1 rounded">
                          {formatAddress(account!)}
                        </code>
                        <Button variant="ghost" size="sm" onClick={copyAddress} className="h-6 w-6 p-0">
                          <Copy className="w-3 h-3" />
                        </Button>
                        <Button variant="ghost" size="sm" onClick={openInExplorer} className="h-6 w-6 p-0">
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
            </div>
            
            {/* Introduction text - always visible */}
            <div className="max-w-3xl mx-auto text-center space-y-4">
              <p className="text-muted-foreground">
                Learn how decentralized tools can help you fight corruption, organize resistance, 
                and build a more just world. Our comprehensive whitepaper explains everything you need to know.
              </p>
              {!isConnected && (
                <p className="text-sm text-muted-foreground/80">
                  Connect your wallet to access the full platform and start taking action.
                </p>
              )}
            </div>
            
            {/* Core Platform Features */}
            {isConnected && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pt-6 max-w-6xl mx-auto">
                <Button variant="cosmicOutline" className="flex items-center justify-between p-4 h-auto" onClick={() => navigate('/identity')}>
                  <div className="flex items-center">
                    <Shield className="w-5 h-5 mr-3" />
                    <div className="text-left">
                      <div className="font-semibold">Secure Identity</div>
                      <div className="text-xs text-muted-foreground">Privacy-first verification</div>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4" />
                </Button>
                
                <Button variant="cosmicOutline" className="flex items-center justify-between p-4 h-auto" onClick={() => navigate('/organize')}>
                  <div className="flex items-center">
                    <Users className="w-5 h-5 mr-3" />
                    <div className="text-left">
                      <div className="font-semibold">Organize</div>
                      <div className="text-xs text-muted-foreground">Coordinate resistance</div>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4" />
                </Button>
                
                <Button variant="cosmicOutline" className="flex items-center justify-between p-4 h-auto" onClick={() => navigate('/messages')}>
                  <div className="flex items-center">
                    <MessageCircle className="w-5 h-5 mr-3" />
                    <div className="text-left">
                      <div className="font-semibold">Secure Messages</div>
                      <div className="text-xs text-muted-foreground">Encrypted communication</div>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4" />
                </Button>

                <Button variant="cosmicOutline" className="flex items-center justify-between p-4 h-auto" onClick={() => navigate('/governance')}>
                  <div className="flex items-center">
                    <Scale className="w-5 h-5 mr-3" />
                    <div className="text-left">
                      <div className="font-semibold">DAO Governance</div>
                      <div className="text-xs text-muted-foreground">Democratic decisions</div>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4" />
                </Button>
                
                <Button variant="cosmicOutline" className="flex items-center justify-between p-4 h-auto" onClick={() => navigate('/verify')}>
                  <div className="flex items-center">
                    <FileCheck className="w-5 h-5 mr-3" />
                    <div className="text-left">
                      <div className="font-semibold">Verify</div>
                      <div className="text-xs text-muted-foreground">Document truth</div>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4" />
                </Button>
                
                <Button variant="cosmicOutline" className="flex items-center justify-between p-4 h-auto" onClick={() => navigate('/support')}>
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
            )}
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
