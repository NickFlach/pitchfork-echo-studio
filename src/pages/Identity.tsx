import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Shield, CheckCircle, AlertCircle, Lock, Key, Eye, EyeOff, Check, AlertTriangle } from 'lucide-react';
import { useWeb3 } from '@/hooks/useWeb3';
import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { identityApi } from '@/lib/api';
import { Navigation } from '@/components/Navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

const Identity = () => {
  const { isConnected, account } = useWeb3();
  const [isVerifying, setIsVerifying] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch existing identity
  const { data: identity, isLoading, error } = useQuery({
    queryKey: ['identity', account],
    queryFn: async () => {
      if (!account) return null;
      console.log('Fetching identity for account:', account);
      const result = await identityApi.getByWallet(account);
      console.log('Identity result:', result);
      return result;
    },
    enabled: !!account,
    retry: 1, // Only retry once to avoid infinite loops
  });

  // Show error state if there's an error
  if (error && isConnected) {
    return (
      <div className="min-h-screen bg-gradient-subtle">
        <Navigation />
        <div className="flex items-center justify-center min-h-[calc(100vh-80px)]">
          <Card className="w-full max-w-md">
            <CardContent className="flex items-center justify-center p-8">
              <div className="text-center space-y-4">
                <AlertTriangle className="w-8 h-8 text-destructive mx-auto" />
                <p className="text-muted-foreground">Error loading identity. Check console for details.</p>
                <Button onClick={() => window.location.reload()} variant="outline">
                  Retry
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Show loading state during initial fetch
  if (isLoading && isConnected) {
    return (
      <div className="min-h-screen bg-gradient-subtle">
        <Navigation />
        <div className="flex items-center justify-center min-h-[calc(100vh-80px)]">
          <Card className="w-full max-w-md">
            <CardContent className="flex items-center justify-center p-8">
              <div className="text-center space-y-4">
                <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
                <p className="text-muted-foreground">Loading identity status...</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Verification mutation using unified flow
  const verifyMutation = useMutation({
    mutationFn: async (level: 'basic' | 'verified') => {
      if (!account) throw new Error('No account connected');
      return await identityApi.verifyLevel(account, level);
    },
    onSuccess: (result, level) => {
      // Only invalidate and show success if verification actually succeeded
      if (result.verificationLevel === level) {
        queryClient.invalidateQueries({ queryKey: ['identity'] });
        toast({
          title: "Verification Complete",
          description: `You are now ${level} verified. Your privacy is protected.`,
        });
      } else {
        throw new Error('Verification level mismatch');
      }
    },
    onError: (error) => {
      toast({
        title: "Verification Failed",
        description: error.message || "Please try again",
        variant: "destructive"
      });
    },
  });

  const currentLevel = identity?.verificationLevel || 'none';

  const handleVerification = async (level: 'basic' | 'verified') => {
    setIsVerifying(true);
    
    try {
      await verifyMutation.mutateAsync(level);
      // Success handling is now in verifyMutation.onSuccess
    } catch (error) {
      // Error handling is now in verifyMutation.onError
    } finally {
      setIsVerifying(false);
    }
  };

  if (!isConnected) {
    return (
      <div className="min-h-screen bg-gradient-subtle">
        <Navigation />
        <div className="flex items-center justify-center min-h-[calc(100vh-80px)]">
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
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-subtle">
      <Navigation />
      <div className="max-w-4xl mx-auto space-y-8 p-4">
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
              <div className="flex items-center justify-between p-3 bg-muted/20 rounded-lg" data-testid="status-wallet-connected">
                <span>Wallet Connected</span>
                <Check className="w-5 h-5 text-green-500" />
              </div>
              
              <div className="flex items-center justify-between p-3 bg-muted/20 rounded-lg" data-testid="status-basic-verification">
                <span>Basic Verification</span>
                {currentLevel === 'none' ? (
                  <Eye className="w-5 h-5 text-muted-foreground" />
                ) : (
                  <Check className="w-5 h-5 text-green-500" />
                )}
              </div>
              
              <div className="flex items-center justify-between p-3 bg-muted/20 rounded-lg" data-testid="status-full-verification">
                <span>Full Verification</span>
                {currentLevel === 'verified' ? (
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
                  disabled={isVerifying || currentLevel !== 'none'}
                  className="w-full"
                  variant={currentLevel === 'basic' ? 'cosmicOutline' : 'cosmic'}
                  data-testid="button-verify-basic"
                >
                  {currentLevel === 'basic' ? 'Verified' : 'Verify Basic'}
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
                  disabled={isVerifying || currentLevel !== 'basic'}
                  className="w-full"
                  variant={currentLevel === 'verified' ? 'cosmicOutline' : 'cosmic'}
                  data-testid="button-verify-full"
                >
                  {currentLevel === 'verified' ? 'Fully Verified' : 'Full Verification'}
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

export default Identity;