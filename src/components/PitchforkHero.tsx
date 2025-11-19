import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Shield,
  Users,
  FileCheck,
  Heart,
  ChevronRight,
  MessageCircle,
  Scale,
  BookOpen,
  DollarSign,
  Github,
  RefreshCw,
  ExternalLink,
} from "lucide-react";
import neoTokenLogo from "@/assets/neo-token-logo.png";
import { Navigation } from "@/components/Navigation";
import Web3ConnectButton from "@/components/Web3ConnectButton";
import { useWeb3 } from "@/hooks/useWeb3";
import { ethers } from "ethers";
import { useToast } from "@/hooks/use-toast";

export const PitchforkHero = React.memo(() => {
  const go = (path: string) => {
    window.location.href = path;
  };

  const { isConnected, account, signer, chainId, switchNetwork } = useWeb3();
  const { toast } = useToast();
  const [isClaiming, setIsClaiming] = useState(false);
  const [pforkBalance, setPforkBalance] = useState<string>("0");
  const [isLoadingBalance, setIsLoadingBalance] = useState(false);
  const [cooldownRemaining, setCooldownRemaining] = useState<number>(0);
  const [remainingAllowance, setRemainingAllowance] = useState<string>("0");
  const [amountPerRequest, setAmountPerRequest] = useState<string>("0");
  const [estimatedGas, setEstimatedGas] = useState<string | null>(null);

  const FAUCET_ADDRESS = "0xC938cef0619d74DDc740Cb14490D77E811Ae6841";
  const FAUCET_ABI = [
    "function request() external",
    "function canRequest(address) external view returns (bool)",
    "function paused() external view returns (bool)",
    "function amountPerRequest() external view returns (uint256)",
    "function timeUntilNextRequest(address) external view returns (uint256)",
    "function remainingAllowance(address) external view returns (uint256)",
    "function totalClaimed(address) external view returns (uint256)",
    "function cooldown() external view returns (uint256)",
  ];

  const PFORK_TOKEN_ADDRESS = "0x216490C8E6b33b4d8A2390dADcf9f433E30da60F"; // Replace with actual PFORK token address
  const ERC20_ABI = [
    "function balanceOf(address owner) view returns (uint256)",
    "function decimals() view returns (uint8)",
    "function symbol() view returns (string)",
  ];

  const fetchFaucetInfo = async () => {
    if (!isConnected || !account || !signer || chainId !== 47763) {
      setPforkBalance("0");
      setCooldownRemaining(0);
      setRemainingAllowance("0");
      return;
    }

    try {
      setIsLoadingBalance(true);
      const tokenContract = new ethers.Contract(PFORK_TOKEN_ADDRESS, ERC20_ABI, signer);
      const faucet = new ethers.Contract(FAUCET_ADDRESS, FAUCET_ABI, signer);

      const [balance, decimals, timeUntil, remaining, perRequest] = await Promise.all([
        tokenContract.balanceOf(account),
        tokenContract.decimals(),
        faucet.timeUntilNextRequest(account),
        faucet.remainingAllowance(account),
        faucet.amountPerRequest(),
      ]);

      const formattedBalance = ethers.formatUnits(balance, decimals);
      setPforkBalance(parseFloat(formattedBalance).toFixed(2));
      setCooldownRemaining(Number(timeUntil));
      setRemainingAllowance(ethers.formatUnits(remaining, decimals));
      setAmountPerRequest(ethers.formatUnits(perRequest, decimals));
    } catch (error) {
      console.error("Error fetching faucet info:", error);
      // Don't reset to "0" on error to prevent flickering
    } finally {
      setIsLoadingBalance(false);
    }
  };

  useEffect(() => {
    fetchFaucetInfo();
  }, [isConnected, account, chainId]);

  // Auto-refresh every 10 seconds when connected
  useEffect(() => {
    if (!isConnected || chainId !== 47763) return;
    const interval = setInterval(fetchFaucetInfo, 10000);
    return () => clearInterval(interval);
  }, [isConnected, chainId]);

  // Countdown timer for cooldown
  useEffect(() => {
    if (cooldownRemaining <= 0) return;
    const timer = setInterval(() => {
      setCooldownRemaining((prev) => Math.max(0, prev - 1));
    }, 1000);
    return () => clearInterval(timer);
  }, [cooldownRemaining]);

  const checkRPCHealth = async (): Promise<boolean> => {
    try {
      if (!signer?.provider) {
        console.log("RPC Health Check: No provider available");
        return false;
      }
      const blockNumber = await signer.provider.getBlockNumber();
      console.log("RPC Health Check: Success, current block:", blockNumber);
      return true;
    } catch (error) {
      console.error("RPC Health Check: Failed", error);
      toast({
        title: "Network Error",
        description: "Unable to connect to NEO X network. Please try again.",
        variant: "destructive",
      });
      return false;
    }
  };

  const estimateRequestGas = async (): Promise<string | null> => {
    try {
      if (!signer || !account) return null;
      const faucet = new ethers.Contract(FAUCET_ADDRESS, FAUCET_ABI, signer);
      const gasEstimate = await faucet.request.estimateGas();
      const gasPrice = (await signer.provider.getFeeData()).gasPrice;
      if (!gasPrice) return null;
      const gasCost = gasEstimate * gasPrice;
      return ethers.formatEther(gasCost);
    } catch (error) {
      console.log("Gas estimation failed:", error);
      return null;
    }
  };

  const handleLogoClick = async (e?: React.MouseEvent | React.KeyboardEvent) => {
    e?.preventDefault();

    if (isClaiming) return;

    if (!isConnected || !signer || !account) {
      toast({
        title: "Wallet Not Connected",
        description: "Please connect your wallet first using the Connect Wallet button.",
        variant: "destructive",
      });
      return;
    }

    if (chainId !== 47763) {
      try {
        await switchNetwork(47763);
        toast({
          title: "Network Switched",
          description: "Successfully switched to NEO X network.",
        });
      } catch (error) {
        toast({
          title: "Network Switch Failed",
          description: "Please manually switch your wallet to the NEO X network (chainId 47763).",
          variant: "destructive",
        });
        return;
      }
    }

    try {
      setIsClaiming(true);
      console.log("=== FAUCET CLAIM STARTED ===");
      console.log("Wallet state:", { account, chainId, hasSigner: !!signer });

      // Check RPC health
      const rpcHealthy = await checkRPCHealth();
      if (!rpcHealthy) {
        console.log("RPC health check failed, aborting");
        return;
      }

      // Verify contract exists
      const provider = signer.provider;
      const network = await provider.getNetwork();
      console.log("Current network:", {
        chainId: Number(network.chainId),
        name: network.name,
        faucetAddress: FAUCET_ADDRESS
      });
      
      const code = await provider.getCode(FAUCET_ADDRESS);
      console.log("Contract code check:", {
        address: FAUCET_ADDRESS,
        codeLength: code.length,
        hasCode: code !== "0x"
      });
      
      if (code === "0x") {
        toast({
          title: "Contract Not Found",
          description: (
            <div className="flex flex-col gap-2">
              <p>Faucet contract not found at {FAUCET_ADDRESS} on chain {Number(network.chainId)}.</p>
              <a
                href={`https://xexplorer.neo.org/address/${FAUCET_ADDRESS}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 text-primary hover:underline text-xs"
              >
                Verify on NEO X Explorer <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          ),
          variant: "destructive",
        });
        return;
      }

      const faucet = new ethers.Contract(FAUCET_ADDRESS, FAUCET_ABI, signer);

      // Check if paused
      try {
        const paused = await faucet.paused();
        if (paused) {
          toast({
            title: "Faucet Paused",
            description: "The PFORK faucet is currently paused. Please try again later.",
            variant: "destructive",
          });
          return;
        }
      } catch (pausedError) {
        // Continue if paused check fails
      }

      // Check if can request
      const canRequestNow = await faucet.canRequest(account);
      if (!canRequestNow) {
        const remaining = await faucet.remainingAllowance(account);
        if (remaining === 0n) {
          toast({
            title: "Cap Reached",
            description: "You've reached the maximum PFORK allowance per address.",
            variant: "destructive",
          });
        } else {
          const timeUntil = await faucet.timeUntilNextRequest(account);
          const minutes = Math.ceil(Number(timeUntil) / 60);
          toast({
            title: "Cooldown Active",
            description: `Please wait ${minutes} minute${minutes !== 1 ? 's' : ''} before requesting again.`,
            variant: "destructive",
          });
        }
        return;
      }

      // Estimate gas
      const gasCost = await estimateRequestGas();
      if (gasCost) {
        setEstimatedGas(gasCost);
      }

      // Execute request
      const tx = await faucet.request();
      
      toast({
        title: "Transaction Submitted",
        description: "Waiting for confirmation...",
      });

      await tx.wait();

      toast({
        title: "Request Successful! 🎉",
        description: (
          <div className="flex flex-col gap-2">
            <p>{amountPerRequest} PFORK claimed successfully!</p>
            <a
              href={`https://xexplorer.neo.org/tx/${tx.hash}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-primary hover:underline"
            >
              View on Explorer <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        ),
      });

      await fetchFaucetInfo();
    } catch (error: any) {
      console.error("Error requesting PFORK:", error);
      toast({
        title: "Request Failed",
        description: error.message || "Failed to request PFORK. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsClaiming(false);
    }
  };

  const formatTime = (seconds: number): string => {
    if (seconds <= 0) return "Ready";
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes}m ${secs}s`;
  };

  const formatAllowance = (allowance: string): string => {
    const num = parseFloat(allowance);
    // If number is extremely large (close to max uint256), show as unlimited
    if (num > 1e20) return "Unlimited";
    // Otherwise format to 2 decimal places
    return `${num.toFixed(2)} PFORK`;
  };

  return (
    <div className="min-h-screen bg-gradient-subtle">
      <Navigation showBackButton={false} showQuickNav={true} />
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-8 px-4">
          {/* Logo */}
          <div className="flex justify-center mb-8">
            <div
              onClick={(e) => {
                if (!isClaiming) {
                  void handleLogoClick(e);
                }
              }}
              onKeyDown={(e) => {
                if ((e.key === "Enter" || e.key === " ") && !isClaiming) {
                  e.preventDefault();
                  void handleLogoClick(e);
                }
              }}
              className={`rounded-full cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 transition-all ${isClaiming || cooldownRemaining > 0 ? "opacity-50 cursor-wait" : "hover:shadow-xl hover:shadow-primary/50"}`}
              title={
                isClaiming
                  ? "Requesting PFORK..."
                  : cooldownRemaining > 0
                  ? `Cooldown: ${formatTime(cooldownRemaining)}`
                  : `Click to request ${amountPerRequest} PFORK from faucet`
              }
              role="button"
              tabIndex={0}
              aria-label={`Click to request ${amountPerRequest} PFORK tokens from faucet`}
              aria-disabled={isClaiming || cooldownRemaining > 0}
            >
              <img
                src={neoTokenLogo}
                alt="Neo Token Logo"
                className={`w-32 h-32 transition-cosmic rounded-full pointer-events-none ${isClaiming ? "animate-pulse" : "hover:scale-110 glow-cosmic"}`}
                draggable={false}
              />
            </div>
          </div>

          {/* Main heading with gradient text */}
          <div className="space-y-4">
            <h1 className="text-6xl md:text-7xl font-bold text-gradient-cosmic tracking-tight">Pitchfork Protocol</h1>
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
              <Button
                variant="cosmicOutline"
                size="lg"
                onClick={() => go("/whitepaper")}
                className="min-w-[180px] text-lg font-semibold"
              >
                <BookOpen className="w-5 h-5 mr-2" />
                Read Whitepaper
              </Button>

              <Button
                variant="cosmic"
                size="lg"
                onClick={() => go("/funding")}
                className="min-w-[180px] text-lg font-semibold bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
              >
                <DollarSign className="w-5 h-5 mr-2" />
                Fund Development
              </Button>

              <Button
                variant="cosmicOutline"
                size="lg"
                onClick={() => window.open("https://github.com/NickFlach/pitchfork-echo-studio", "_blank")}
                className="min-w-[180px] text-lg font-semibold"
              >
                <Github className="w-5 h-5 mr-2" />
                View Source
              </Button>

              <div className="min-w-[200px]">
                <Web3ConnectButton />
              </div>
            </div>

            {/* PFORK Balance Display */}
            {isConnected && chainId === 47763 && (
              <div className="flex justify-center pt-4 w-full px-4">
                <div className="bg-card/50 backdrop-blur-sm border border-border/50 rounded-lg p-6 shadow-lg w-full max-w-md">
                  <div className="flex items-center justify-between gap-4 mb-4 pb-4 border-b border-border/50">
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <img src={neoTokenLogo} alt="PFORK" className="w-10 h-10 rounded-full flex-shrink-0" />
                      <div className="min-w-0 flex-1">
                        <p className="text-xs text-muted-foreground whitespace-nowrap">Your Balance</p>
                        <p className="text-2xl font-bold text-foreground truncate">
                          {isLoadingBalance ? <span className="animate-pulse">Loading...</span> : `${pforkBalance} PFORK`}
                        </p>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={fetchFaucetInfo}
                      disabled={isLoadingBalance}
                      title="Refresh info"
                      className="flex-shrink-0"
                    >
                      <RefreshCw className={`w-4 h-4 ${isLoadingBalance ? 'animate-spin' : ''}`} />
                    </Button>
                  </div>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Remaining Cap:</span>
                      <span className="text-sm font-semibold text-foreground">{formatAllowance(remainingAllowance)}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Next Request:</span>
                      <span className="text-sm font-semibold text-foreground">{formatTime(cooldownRemaining)}</span>
                    </div>
                    {estimatedGas && (
                      <div className="flex justify-between items-center pt-2 border-t border-border/50">
                        <span className="text-xs text-muted-foreground">Est. Gas:</span>
                        <span className="text-xs font-medium text-muted-foreground">{parseFloat(estimatedGas).toFixed(6)} GAS</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Introduction text - always visible */}
            <div className="max-w-3xl mx-auto text-center space-y-4">
              <p className="text-muted-foreground">
                Learn how decentralized tools can help you fight corruption, organize resistance, and build a more just
                world. Our comprehensive whitepaper explains everything you need to know.
              </p>
              <p className="text-sm text-muted-foreground/80">
                Connect your wallet to access the full platform and start taking action. Use the menu to explore all features.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Ambient background effects */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-primary/10 rounded-full blur-3xl animate-pulse"></div>
        <div
          className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent/10 rounded-full blur-3xl animate-pulse"
          style={{
            animationDelay: "1s",
          }}
        ></div>
        <div
          className="absolute top-1/2 right-1/3 w-48 h-48 bg-cosmic/10 rounded-full blur-2xl animate-pulse"
          style={{
            animationDelay: "2s",
          }}
        ></div>
      </div>
    </div>
  );
});
PitchforkHero.displayName = "PitchforkHero";
