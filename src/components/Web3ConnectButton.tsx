import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Wallet, ExternalLink, Shield, Zap, Info } from 'lucide-react';
import { useWeb3 } from '@/hooks/useWeb3';

export const Web3ConnectButton: React.FC = () => {
  const { 
    isConnected, 
    account, 
    chainId, 
    walletType, 
    connectWallet, 
    disconnectWallet, 
    isConnecting, 
    error, 
    availableWallets,
    supportedChains,
    switchNetwork 
  } = useWeb3();
  
  const [showWalletModal, setShowWalletModal] = useState(false);

  const handleWalletConnect = async (walletType: string) => {
    try {
      await connectWallet(walletType);
      setShowWalletModal(false);
    } catch (error) {
      console.error('Failed to connect wallet:', error);
    }
  };

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const getChainName = (chainId: number) => {
    const chains: Record<number, string> = {
      47763: 'NEO X',
      1: 'Ethereum',
      137: 'Polygon',
      56: 'BSC',
      5: 'Goerli',
      11155111: 'Sepolia',
      80001: 'Mumbai',
      97: 'BSC Testnet'
    };
    return chains[chainId] || `Chain ${chainId}`;
  };

  const isUnsupportedChain = chainId && !supportedChains.includes(chainId);

  if (isConnected && account) {
    return (
      <div className="flex items-center gap-2">
        <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
          <Shield className="w-3 h-3 mr-1" />
          Connected
        </Badge>
        
        <Card className="p-2">
          <div className="flex items-center gap-2 text-sm">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            <span className="font-mono">{formatAddress(account)}</span>
            {chainId && (
              <Badge variant={isUnsupportedChain ? "destructive" : "secondary"} className="text-xs">
                {getChainName(chainId)}
              </Badge>
            )}
          </div>
        </Card>

        {isUnsupportedChain && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => switchNetwork(47763)}
            className="text-orange-600 border-orange-200 hover:bg-orange-50"
          >
            Switch to NEO X
          </Button>
        )}

        <Button
          variant="outline"
          size="sm"
          onClick={disconnectWallet}
          className="text-red-600 border-red-200 hover:bg-red-50"
        >
          Disconnect
        </Button>
      </div>
    );
  }

  return (
    <Dialog open={showWalletModal} onOpenChange={setShowWalletModal}>
      <DialogTrigger asChild>
        <Button 
          variant="default" 
          className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
          disabled={isConnecting}
        >
          <Wallet className="w-4 h-4 mr-2" />
          {isConnecting ? 'Connecting...' : 'Connect Wallet'}
        </Button>
      </DialogTrigger>
      
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Zap className="w-5 h-5 text-purple-600" />
            Connect Web3 Wallet
          </DialogTitle>
          <DialogDescription>
            Connect your wallet to enable blockchain features: secure identity, decentralized governance, and transparent funding.
          </DialogDescription>
        </DialogHeader>

        {error && (
          <Alert variant="destructive">
            <Info className="w-4 h-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="space-y-3">
          {availableWallets.map((wallet) => (
            <Card 
              key={wallet.name}
              className="cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
              onClick={() => handleWalletConnect(wallet.connector)}
            >
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center justify-between text-base">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{wallet.icon}</span>
                    <span>{wallet.name}</span>
                  </div>
                  <ExternalLink className="w-4 h-4 text-gray-400" />
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <CardDescription className="text-sm">
                  {wallet.name === 'MetaMask' && 'Most popular Ethereum wallet with browser extension'}
                  {wallet.name === 'WalletConnect' && 'Connect with mobile wallets via QR code'}
                  {wallet.name === 'Coinbase Wallet' && 'Secure wallet from Coinbase exchange'}
                </CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>

        <Alert>
          <Shield className="w-4 h-4" />
          <AlertDescription className="text-sm">
            <strong>Why connect a wallet?</strong><br />
            • Secure blockchain-based identity verification<br />
            • Participate in decentralized governance voting<br />
            • Make transparent donations to resistance campaigns<br />
            • Store documents with tamper-proof IPFS integration
          </AlertDescription>
        </Alert>

        <div className="text-center">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowWalletModal(false)}
            className="text-gray-500"
          >
            Continue without wallet
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default Web3ConnectButton;
