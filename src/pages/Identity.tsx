import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Shield, Eye, EyeOff, Check, AlertTriangle } from 'lucide-react';
import { useWeb3 } from '@/hooks/useWeb3';
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';

export const Identity = () => {
  const { isConnected, account } = useWeb3();
  const [verificationLevel, setVerificationLevel] = useState<'none' | 'basic' | 'verified'>('none');
  const [isVerifying, setIsVerifying] = useState(false);
  const { toast } = useToast();

  const handleVerification = async (level: 'basic' | 'verified') => {
    setIsVerifying(true);
    
    // Simulate verification process
    setTimeout(() => {
      setVerificationLevel(level);
      setIsVerifying(false);
      toast({
        title: "Verification Complete",
        description: `You are now ${level} verified. Your privacy is protected.`,
      });
    }, 2000);
  };

  if (!isConnected) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-subtle">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <Shield className="w-12 h-12 mx-auto text-primary mb-4" />
            <CardTitle>Connect Your Wallet</CardTitle>
            <CardDescription>
              Connect your wallet to access identity verification features
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-subtle p-4">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="text-center space-y-4 pt-8">
          <h1 className="text-4xl font-bold text-gradient-cosmic">Privacy-First Identity</h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Verify your identity without exposing your personal data. Use zero-knowledge proofs 
            to prove who you are while maintaining complete privacy.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Current Status */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="w-5 h-5" />
                Identity Status
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-muted/20 rounded-lg">
                <span>Wallet Connected</span>
                <Check className="w-5 h-5 text-green-500" />
              </div>
              
              <div className="flex items-center justify-between p-3 bg-muted/20 rounded-lg">
                <span>Basic Verification</span>
                {verificationLevel === 'none' ? (
                  <Eye className="w-5 h-5 text-muted-foreground" />
                ) : (
                  <Check className="w-5 h-5 text-green-500" />
                )}
              </div>
              
              <div className="flex items-center justify-between p-3 bg-muted/20 rounded-lg">
                <span>Full Verification</span>
                {verificationLevel === 'verified' ? (
                  <Check className="w-5 h-5 text-green-500" />
                ) : (
                  <EyeOff className="w-5 h-5 text-muted-foreground" />
                )}
              </div>
            </CardContent>
          </Card>

          {/* Verification Options */}
          <Card>
            <CardHeader>
              <CardTitle>Verification Levels</CardTitle>
              <CardDescription>
                Choose your verification level based on your privacy needs
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 border border-primary/20 rounded-lg space-y-3">
                <div className="flex items-center gap-2">
                  <Eye className="w-4 h-4 text-primary" />
                  <span className="font-semibold">Basic Verification</span>
                </div>
                <p className="text-sm text-muted-foreground">
                  Prove you're a real person without revealing personal details
                </p>
                <Button 
                  onClick={() => handleVerification('basic')}
                  disabled={isVerifying || verificationLevel !== 'none'}
                  className="w-full"
                  variant={verificationLevel === 'basic' ? 'cosmicOutline' : 'cosmic'}
                >
                  {verificationLevel === 'basic' ? 'Verified' : 'Verify Basic'}
                </Button>
              </div>

              <div className="p-4 border border-accent/20 rounded-lg space-y-3">
                <div className="flex items-center gap-2">
                  <Shield className="w-4 h-4 text-accent" />
                  <span className="font-semibold">Full Verification</span>
                </div>
                <p className="text-sm text-muted-foreground">
                  Higher trust level for organizing sensitive actions
                </p>
                <Button 
                  onClick={() => handleVerification('verified')}
                  disabled={isVerifying || verificationLevel !== 'basic'}
                  className="w-full"
                  variant={verificationLevel === 'verified' ? 'cosmicOutline' : 'cosmic'}
                >
                  {verificationLevel === 'verified' ? 'Fully Verified' : 'Full Verification'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Privacy Guarantees */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5" />
              Privacy Guarantees
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center space-y-2">
                <Shield className="w-8 h-8 mx-auto text-primary" />
                <h3 className="font-semibold">Zero Knowledge</h3>
                <p className="text-sm text-muted-foreground">
                  Prove facts about yourself without revealing the underlying data
                </p>
              </div>
              
              <div className="text-center space-y-2">
                <EyeOff className="w-8 h-8 mx-auto text-primary" />
                <h3 className="font-semibold">No Data Storage</h3>
                <p className="text-sm text-muted-foreground">
                  Your personal information is never stored on our servers
                </p>
              </div>
              
              <div className="text-center space-y-2">
                <Eye className="w-8 h-8 mx-auto text-primary" />
                <h3 className="font-semibold">Selective Disclosure</h3>
                <p className="text-sm text-muted-foreground">
                  Share only what's necessary for each specific purpose
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};