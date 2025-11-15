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
} from "lucide-react";
import neoTokenLogo from "@/assets/neo-token-logo.png";
import { Navigation } from "@/components/Navigation";
import Web3ConnectButton from "@/components/Web3ConnectButton";
import { useWeb3 } from "@/hooks/useWeb3";
import { ethers } from "ethers";

export const PitchforkHero = React.memo(() => {
  const go = (path: string) => {
    window.location.href = path;
  };

  const { isConnected, account, signer, chainId, switchNetwork } = useWeb3();
  const [isClaiming, setIsClaiming] = useState(false);
  const [pforkBalance, setPforkBalance] = useState<string>("0");
  const [isLoadingBalance, setIsLoadingBalance] = useState(false);

  const FAUCET_ADDRESS = "0xFb05A4dEf7548C9D4371B56222CaBbac6080885D";
  const FAUCET_ABI = [
    "function claim() external",
    "function hasClaimed(address) view returns (bool)",
  ];

  const PFORK_TOKEN_ADDRESS = "0x216490C8E6b33b4d8A2390dADcf9f433E30da60F"; // Replace with actual PFORK token address
  const ERC20_ABI = [
    "function balanceOf(address owner) view returns (uint256)",
    "function decimals() view returns (uint8)",
    "function symbol() view returns (string)",
  ];

  const fetchPforkBalance = async () => {
    console.log("🔍 Fetching PFORK balance...", { isConnected, account, hasSigner: !!signer, chainId });
    
    if (!isConnected || !account || !signer || chainId !== 47763) {
      console.log("❌ Balance fetch skipped:", { isConnected, hasAccount: !!account, hasSigner: !!signer, chainId, expectedChainId: 47763 });
      setPforkBalance("0");
      return;
    }

    try {
      setIsLoadingBalance(true);
      console.log("📞 Creating PFORK token contract at:", PFORK_TOKEN_ADDRESS);
      const tokenContract = new ethers.Contract(PFORK_TOKEN_ADDRESS, ERC20_ABI, signer);
      
      console.log("📊 Fetching balance for account:", account);
      const balance = await tokenContract.balanceOf(account);
      console.log("💰 Raw balance:", balance.toString());
      
      const decimals = await tokenContract.decimals();
      console.log("🔢 Token decimals:", decimals);
      
      const formattedBalance = ethers.formatUnits(balance, decimals);
      console.log("✅ Formatted balance:", formattedBalance);
      
      setPforkBalance(parseFloat(formattedBalance).toFixed(2));
    } catch (error) {
      console.error("❌ Error fetching PFORK balance:", error);
      setPforkBalance("0");
    } finally {
      setIsLoadingBalance(false);
    }
  };

  useEffect(() => {
    fetchPforkBalance();
  }, [isConnected, account, chainId]);

  const handleLogoClick = async (e?: React.MouseEvent | React.KeyboardEvent) => {
    e?.preventDefault();
    console.log("🪙 PFORK logo clicked");
    console.log("📊 Wallet state:", { isConnected, account, chainId, hasSigner: !!signer });

    if (isClaiming) {
      console.log("⏳ Already claiming, ignoring click");
      return;
    }

    if (!isConnected || !signer || !account) {
      console.log("❌ Wallet not connected");
      console.log("📊 Full wallet state debug:", {
        isConnected,
        hasAccount: !!account,
        hasSigner: !!signer,
        chainId,
        ethereumExists: !!window.ethereum,
      });
      alert("Please connect your wallet first using the Connect Wallet button.");
      return;
    }

    if (chainId !== 47763) {
      console.log("🔄 Wrong network, attempting to switch to NEO X (47763)");
      try {
        await switchNetwork(47763);
        console.log("✅ Network switched successfully");
      } catch (error) {
        console.error("❌ Failed to switch network:", error);
        alert("Please switch your wallet to the NEO X network (chainId 47763) to claim PFORK.");
        return;
      }
    }

    try {
      setIsClaiming(true);
      console.log("🔗 Creating contract instance at:", FAUCET_ADDRESS);
      
      // First, check if contract exists by checking code at address
      const provider = signer.provider;
      const code = await provider.getCode(FAUCET_ADDRESS);
      console.log("📜 Contract code length:", code.length, "bytes");
      
      if (code === "0x") {
        alert(`Faucet contract not found at ${FAUCET_ADDRESS} on Neo X.\n\nPlease check the contract address is correct for Neo X mainnet (chainId 47763).`);
        return;
      }
      
      const faucet = new ethers.Contract(FAUCET_ADDRESS, FAUCET_ABI, signer);

      console.log("🔍 Checking if already claimed for:", account);
      const alreadyClaimed = await faucet.hasClaimed(account);
      console.log("📊 Already claimed status:", alreadyClaimed);

      if (alreadyClaimed) {
        alert("You have already claimed your 10 PFORK from this faucet.");
        return;
      }

      console.log("📤 Calling claim() function...");
      const tx = await faucet.claim();
      console.log("⏳ Transaction sent:", tx.hash);

      console.log("⏳ Waiting for confirmation...");
      await tx.wait();
      console.log("✅ Transaction confirmed!");

      alert(`10 PFORK claimed successfully!\nTransaction: ${tx.hash.slice(0, 10)}...`);
      // Refresh balance after successful claim
      await fetchPforkBalance();
    } catch (error: any) {
      console.error("❌ Error claiming PFORK:", error);
      console.error("Error details:", {
        message: error.message,
        code: error.code,
        data: error.data,
      });
      alert(`Failed to claim PFORK: ${error.message || "Please try again or check your wallet."}`);
    } finally {
      setIsClaiming(false);
      console.log("🏁 Claim attempt finished");
    }
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
                console.log("🖱 Logo container clicked");
                if (!isClaiming) {
                  void handleLogoClick(e);
                }
              }}
              onKeyDown={(e) => {
                if ((e.key === "Enter" || e.key === " ") && !isClaiming) {
                  e.preventDefault();
                  console.log("⌨️ Logo activated via keyboard");
                  void handleLogoClick(e);
                }
              }}
              className={`rounded-full cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 transition-all ${isClaiming ? "opacity-50 cursor-wait" : "hover:shadow-xl hover:shadow-primary/50"}`}
              title={isClaiming ? "Claiming PFORK..." : "Click to claim 10 PFORK (NEO X faucet)"}
              role="button"
              tabIndex={0}
              aria-label="Click to claim 10 PFORK tokens from faucet"
              aria-disabled={isClaiming}
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
              <div className="flex justify-center pt-4">
                <div className="bg-card/50 backdrop-blur-sm border border-border/50 rounded-lg px-6 py-3 shadow-lg">
                  <div className="flex items-center gap-3">
                    <img src={neoTokenLogo} alt="PFORK" className="w-8 h-8 rounded-full" />
                    <div className="text-left">
                      <p className="text-xs text-muted-foreground">Your Balance</p>
                      <p className="text-xl font-bold text-foreground">
                        {isLoadingBalance ? <span className="animate-pulse">Loading...</span> : `${pforkBalance} PFORK`}
                      </p>
                    </div>
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
                Connect your wallet to access the full platform and start taking action.
              </p>
            </div>

            {/* Core Platform Features */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pt-6 max-w-6xl mx-auto">
              <Button
                variant="cosmicOutline"
                className="flex items-center justify-between p-4 h-auto"
                onClick={() => go("/identity")}
              >
                <div className="flex items-center">
                  <Shield className="w-5 h-5 mr-3" />
                  <div className="text-left">
                    <div className="font-semibold">Secure Identity</div>
                    <div className="text-xs text-muted-foreground">Privacy-first verification</div>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4" />
              </Button>

              <Button
                variant="cosmicOutline"
                className="flex items-center justify-between p-4 h-auto"
                onClick={() => go("/organize")}
              >
                <div className="flex items-center">
                  <Users className="w-5 h-5 mr-3" />
                  <div className="text-left">
                    <div className="font-semibold">Organize</div>
                    <div className="text-xs text-muted-foreground">Coordinate resistance</div>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4" />
              </Button>

              <Button
                variant="cosmicOutline"
                className="flex items-center justify-between p-4 h-auto"
                onClick={() => go("/messages")}
              >
                <div className="flex items-center">
                  <MessageCircle className="w-5 h-5 mr-3" />
                  <div className="text-left">
                    <div className="font-semibold">Secure Messages</div>
                    <div className="text-xs text-muted-foreground">Encrypted communication</div>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4" />
              </Button>

              <Button
                variant="cosmicOutline"
                className="flex items-center justify-between p-4 h-auto"
                onClick={() => go("/governance")}
              >
                <div className="flex items-center">
                  <Scale className="w-5 h-5 mr-3" />
                  <div className="text-left">
                    <div className="font-semibold">DAO Governance</div>
                    <div className="text-xs text-muted-foreground">Democratic decisions</div>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4" />
              </Button>

              <Button
                variant="cosmicOutline"
                className="flex items-center justify-between p-4 h-auto"
                onClick={() => go("/verify")}
              >
                <div className="flex items-center">
                  <FileCheck className="w-5 h-5 mr-3" />
                  <div className="text-left">
                    <div className="font-semibold">Verify</div>
                    <div className="text-xs text-muted-foreground">Document truth</div>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4" />
              </Button>

              <Button
                variant="cosmicOutline"
                className="flex items-center justify-between p-4 h-auto"
                onClick={() => go("/support")}
              >
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
