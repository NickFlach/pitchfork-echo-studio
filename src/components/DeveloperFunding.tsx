import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useWeb3 } from '@/hooks/useWeb3';
import { ethers } from 'ethers';
import { Copy, ExternalLink, Heart, Shield, Zap, Github } from 'lucide-react';

// Developer funding wallet address
const DEVELOPER_WALLET = '0x7C29b9Bc9f7CA06DB45E5558c6DEe84f4dd01efb';

export function DeveloperFunding() {
  const { isConnected, signer } = useWeb3();
  const [donationAmount, setDonationAmount] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [lastTxHash, setLastTxHash] = useState('');

  const quickAmounts = [0.01, 0.05, 0.1, 0.25, 0.5, 1.0];

  const handleQuickDonation = async (amount: number) => {
    setDonationAmount(amount.toString());
    await sendDonation(amount);
  };

  const sendDonation = async (amount?: number) => {
    if (!signer || !isConnected) {
      alert('Please connect your wallet first');
      return;
    }

    const donateAmount = amount || parseFloat(donationAmount);
    if (!donateAmount || donateAmount <= 0) {
      alert('Please enter a valid donation amount');
      return;
    }

    setIsLoading(true);
    try {
      // Send ETH directly to developer wallet
      const tx = await signer.sendTransaction({
        to: DEVELOPER_WALLET,
        value: ethers.parseEther(donateAmount.toString()),
        data: ethers.hexlify(ethers.toUtf8Bytes(JSON.stringify({
          type: 'pitchfork_development_funding',
          purpose: 'Anonymous donation for Pitchfork Protocol development',
          timestamp: Date.now(),
          message: 'Supporting decentralized resistance tools'
        })))
      });

      setLastTxHash(tx.hash);
      setDonationAmount('');
      
      // Show success message
      alert(`🎉 Thank you! Donation sent successfully!\nTransaction: ${tx.hash.slice(0, 10)}...`);
      
    } catch (error) {
      console.error('Donation failed:', error);
      alert('Donation failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const copyAddress = () => {
    navigator.clipboard.writeText(DEVELOPER_WALLET);
    alert('Developer wallet address copied to clipboard!');
  };

  const openEtherscan = () => {
    window.open(`https://etherscan.io/address/${DEVELOPER_WALLET}`, '_blank');
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader className="text-center">
        <div className="flex items-center justify-center gap-2 mb-2">
          <Heart className="h-6 w-6 text-red-500" />
          <CardTitle className="text-2xl">Fund Pitchfork Development</CardTitle>
          <Shield className="h-6 w-6 text-blue-500" />
        </div>
        <CardDescription className="text-lg">
          Support the development of decentralized resistance tools with anonymous donations
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Mission Statement */}
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-4 rounded-lg border">
          <h3 className="font-semibold mb-2 flex items-center gap-2">
            <Zap className="h-4 w-4" />
            Building Tools for Digital Resistance
          </h3>
          <p className="text-sm text-gray-700">
            Your anonymous donations fund the development of truly decentralized tools that help activists 
            worldwide organize, communicate securely, and preserve evidence of corruption without fear of censorship.
          </p>
        </div>

        {/* Developer Wallet Info */}
        <div className="space-y-3">
          <Label className="text-sm font-medium">Developer Ethereum Address</Label>
          <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg border">
            <code className="flex-1 text-sm font-mono break-all">
              {DEVELOPER_WALLET}
            </code>
            <Button
              variant="outline"
              size="sm"
              onClick={copyAddress}
              className="shrink-0"
            >
              <Copy className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={openEtherscan}
              className="shrink-0"
            >
              <ExternalLink className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <Separator />

        {/* Quick Donation Buttons */}
        <div className="space-y-3">
          <Label className="text-sm font-medium">Quick Anonymous Donations</Label>
          <div className="grid grid-cols-3 gap-2">
            {quickAmounts.map((amount) => (
              <Button
                key={amount}
                variant="outline"
                onClick={() => handleQuickDonation(amount)}
                disabled={!isConnected || isLoading}
                className="text-sm"
              >
                {amount} ETH
              </Button>
            ))}
          </div>
        </div>

        {/* Custom Amount */}
        <div className="space-y-3">
          <Label htmlFor="custom-amount" className="text-sm font-medium">
            Custom Amount (ETH)
          </Label>
          <div className="flex gap-2">
            <Input
              id="custom-amount"
              type="number"
              step="0.001"
              min="0"
              placeholder="0.1"
              value={donationAmount}
              onChange={(e) => setDonationAmount(e.target.value)}
              disabled={isLoading}
            />
            <Button
              onClick={() => sendDonation()}
              disabled={!isConnected || isLoading || !donationAmount}
              className="shrink-0"
            >
              {isLoading ? 'Sending...' : 'Donate'}
            </Button>
          </div>
        </div>

        {/* Connection Status */}
        <div className="flex items-center justify-center gap-2">
          <Badge variant={isConnected ? 'default' : 'secondary'}>
            {isConnected ? '🟢 Wallet Connected' : '🔴 Connect Wallet to Donate'}
          </Badge>
        </div>

        {/* Last Transaction */}
        {lastTxHash && (
          <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
            <p className="text-sm text-green-800">
              ✅ Last donation successful! 
              <br />
              <a 
                href={`https://etherscan.io/tx/${lastTxHash}`}
                target="_blank"
                rel="noopener noreferrer"
                className="underline hover:no-underline"
              >
                View on Etherscan: {lastTxHash.slice(0, 20)}...
              </a>
            </p>
          </div>
        )}

        <Separator />

        {/* Privacy Notice */}
        <div className="text-xs text-gray-600 space-y-2">
          <p className="font-medium">🔒 Privacy & Anonymity:</p>
          <ul className="space-y-1 ml-4">
            <li>• Donations are sent directly from your wallet to the developer address</li>
            <li>• No personal information is collected or stored</li>
            <li>• Transaction data includes only a development funding identifier</li>
            <li>• Your wallet address is visible on the blockchain (standard Ethereum behavior)</li>
            <li>• Consider using a privacy-focused wallet or mixing service for maximum anonymity</li>
          </ul>
        </div>

        {/* What Funds Support */}
        <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
          <h4 className="font-medium text-blue-900 mb-2">🛠️ Your donations support:</h4>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• Blockchain integration and smart contract development</li>
            <li>• IPFS infrastructure for censorship-resistant document storage</li>
            <li>• WebRTC peer-to-peer messaging improvements</li>
            <li>• Zero-knowledge proof implementation for privacy</li>
            <li>• Security audits and penetration testing</li>
            <li>• Mobile app development for global accessibility</li>
            <li>• Server costs for development and testing environments</li>
          </ul>
        </div>

        {/* GitHub Link */}
        <div className="text-center">
          <Button
            variant="outline"
            onClick={() => window.open('https://github.com/NickFlach/pitchfork-echo-studio', '_blank')}
            className="w-full max-w-md"
          >
            <Github className="h-4 w-4 mr-2" />
            View Source Code on GitHub
          </Button>
          <p className="text-xs text-gray-600 mt-2">
            Open source • Transparent development • Community contributions welcome
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
