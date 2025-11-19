import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

// Conditional ethers import for Lovable/Replit compatibility
let BrowserProvider: any = null;
let JsonRpcSigner: any = null;
let ethers: any = null;

// Initialize ethers only if available
const initEthers = async () => {
  try {
    if (typeof window !== 'undefined') {
      const ethersModule = await import('ethers');
      BrowserProvider = ethersModule.BrowserProvider;
      JsonRpcSigner = ethersModule.JsonRpcSigner;
      ethers = ethersModule.ethers;
    }
  } catch (error) {
    console.warn('Ethers.js not available, Web3 features disabled');
  }
};

export interface WalletInfo {
  name: string;
  icon: string;
  connector: any;
}

export interface Web3ContextType {
  isConnected: boolean;
  account: string | null;
  provider: any | null; // BrowserProvider when available
  signer: any | null; // JsonRpcSigner when available
  chainId: number | null;
  walletType: string | null;
  connectWallet: (walletType?: string) => Promise<void>;
  disconnectWallet: () => void;
  isConnecting: boolean;
  error: string | null;
  supportedChains: number[];
  switchNetwork: (chainId: number) => Promise<void>;
  availableWallets: WalletInfo[];
}

const Web3Context = createContext<Web3ContextType | undefined>(undefined);

interface Web3ProviderProps {
  children: ReactNode;
  config?: {
    supportedChains?: number[];
  };
}

export const Web3Provider: React.FC<Web3ProviderProps> = ({ children, config }) => {
  const [isConnected, setIsConnected] = useState(false);
  const [account, setAccount] = useState<string | null>(null);
  const [provider, setProvider] = useState<any | null>(null);
  const [signer, setSigner] = useState<any | null>(null);
  const [chainId, setChainId] = useState<number | null>(null);
  const [walletType, setWalletType] = useState<string | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [supportedChains] = useState<number[]>(config?.supportedChains || [47763, 1, 137, 56, 5, 11155111, 80001, 97]);

  // Initialize ethers on component mount and check connection after
  useEffect(() => {
    const initializeAndCheck = async () => {
      await initEthers();
      await checkConnection();
    };
    initializeAndCheck();
  }, []);

  // Listen for account changes
  useEffect(() => {
    if (window.ethereum) {
      const handleAccountsChanged = (accounts: string[]) => {
        console.log('🔄 MetaMask account changed event fired:', accounts);
        if (accounts.length === 0) {
          console.log('🚪 No accounts found, disconnecting wallet');
          disconnectWallet();
        } else {
          console.log('👤 Updating account to:', accounts[0]);
          setAccount(accounts[0]);
          // Refresh provider and signer with new account
          if (BrowserProvider) {
            const provider = new BrowserProvider(window.ethereum);
            provider.getSigner().then(newSigner => {
              console.log('✅ Signer updated for new account');
              setSigner(newSigner);
            });
          }
        }
      };

      const handleChainChanged = (chainId: string) => {
        const numericChainId = parseInt(chainId, 16);
        console.log('🔄 MetaMask chain changed event fired:', numericChainId);
        setChainId(numericChainId);
        // Force page reload on chain change for clean state
        window.location.reload();
      };

      window.ethereum.on('accountsChanged', handleAccountsChanged);
      window.ethereum.on('chainChanged', handleChainChanged);

      return () => {
        window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
        window.ethereum.removeListener('chainChanged', handleChainChanged);
      };
    }
  }, []);

  const checkConnection = async () => {
    console.log('🔍 Checking existing wallet connection...');
    if (window.ethereum && BrowserProvider) {
      try {
        const accounts = await window.ethereum.request({ method: 'eth_accounts' });
        console.log('🔍 eth_accounts returned:', accounts);
        
        if (accounts.length > 0) {
          const provider = new BrowserProvider(window.ethereum);
          const signer = await provider.getSigner();
          const network = await provider.getNetwork();
          
          console.log('🔄 Restoring connection:');
          console.log('  - Account:', accounts[0]);
          console.log('  - ChainId:', Number(network.chainId));
          console.log('  - Network:', network.name);
          
          setIsConnected(true);
          setAccount(accounts[0]);
          setProvider(provider);
          setSigner(signer);
          setChainId(Number(network.chainId));
          setWalletType(localStorage.getItem('walletType') || 'metamask');
          
          console.log('✅ Connection restored successfully!');
        } else {
          console.log('ℹ️ No existing connection found');
          // Clear any stale wallet type
          localStorage.removeItem('walletType');
        }
      } catch (error) {
        console.error('❌ Error checking connection:', error);
        localStorage.removeItem('walletType');
      }
    } else {
      console.log('ℹ️ No Web3 wallet detected or ethers not initialized - this is expected if MetaMask is not installed');
    }
  };

  const connectWallet = async (walletType?: string) => {
    console.log('🔗 Attempting to connect wallet...', { walletType });
    setError(null);

    if (!window.ethereum) {
      const errorMsg = 'No Web3 wallet detected. Please install MetaMask or another Web3 wallet.';
      console.warn('⚠️ No Web3 wallet detected - install MetaMask to enable blockchain features');
      setError(errorMsg);
      throw new Error(errorMsg);
    }

    if (!BrowserProvider) {
      const errorMsg = 'Web3 provider not initialized. Please try again.';
      console.warn('⚠️ Ethers not initialized');
      setError(errorMsg);
      throw new Error(errorMsg);
    }

    console.log('✅ Ethereum object found:', window.ethereum);
    console.log('🔗 About to request accounts...');
    setIsConnecting(true);
    try {
      // Request account access
      console.log('📞 Calling eth_requestAccounts...');
      const accounts = await window.ethereum.request({
        method: 'eth_requestAccounts',
      });
      console.log('📞 eth_requestAccounts completed');

      console.log('📋 Accounts received:', accounts);

      if (accounts.length > 0) {
        const provider = new BrowserProvider(window.ethereum);
        const signer = await provider.getSigner();
        const network = await provider.getNetwork();

        console.log('🌐 Network info:', { chainId: network.chainId, name: network.name });
        console.log('👤 Account connected:', accounts[0]);

        setIsConnected(true);
        setAccount(accounts[0]);
        setProvider(provider);
        setSigner(signer);
        setChainId(Number(network.chainId));
        const wType = walletType || 'metamask';
        setWalletType(wType);
        localStorage.setItem('walletType', wType);
        
        console.log('✅ Wallet connection successful!');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to connect wallet';
      setError(errorMessage);
      console.error('Error connecting wallet:', error);
      throw new Error(errorMessage);
    } finally {
      setIsConnecting(false);
    }
  };

  const switchNetwork = async (chainId: number) => {
    if (!window.ethereum) {
      throw new Error('No Web3 wallet detected');
    }

    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: `0x${chainId.toString(16)}` }],
      });
    } catch (error: any) {
      // If the network doesn't exist in the wallet, try to add it
      if (error.code === 4902) {
        // Handle network not found error
        const networkInfo = getNetworkInfo(chainId);
        if (networkInfo) {
          await window.ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [networkInfo],
          });
        }
      } else {
        throw error;
      }
    }
  };

  const getNetworkInfo = (chainId: number) => {
    const networks: Record<number, any> = {
      1: {
        chainId: '0x1',
        chainName: 'Ethereum Mainnet',
        nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
        rpcUrls: ['https://mainnet.infura.io/v3/'],
        blockExplorerUrls: ['https://etherscan.io/']
      },
      137: {
        chainId: '0x89',
        chainName: 'Polygon Mainnet',
        nativeCurrency: { name: 'MATIC', symbol: 'MATIC', decimals: 18 },
        rpcUrls: ['https://polygon-rpc.com/'],
        blockExplorerUrls: ['https://polygonscan.com/']
      },
      47763: {
        chainId: '0xBA93',
        chainName: 'NEO X',
        nativeCurrency: { name: 'GAS', symbol: 'GAS', decimals: 18 },
        rpcUrls: [
          'https://mainnet-1.rpc.banelabs.org',
          'https://mainnet-2.rpc.banelabs.org'
        ],
        blockExplorerUrls: ['https://xexplorer.neo.org']
      },
      // Add more network configurations as needed
    };

    return networks[chainId];
  };

  const disconnectWallet = () => {
    console.log('🚪 Disconnecting wallet...');
    setIsConnected(false);
    setAccount(null);
    setProvider(null);
    setSigner(null);
    setChainId(null);
    setWalletType(null);
    setError(null);
    localStorage.removeItem('walletType');
    console.log('✅ Wallet disconnected');
  };

  const value: Web3ContextType = {
    isConnected,
    account,
    provider,
    signer,
    chainId,
    walletType,
    connectWallet,
    disconnectWallet,
    isConnecting,
    error,
    supportedChains,
    switchNetwork,
    availableWallets: [
      {
        name: 'MetaMask',
        icon: '🦊',
        connector: 'metamask'
      },
      {
        name: 'WalletConnect',
        icon: '📱',
        connector: 'walletconnect'
      },
      {
        name: 'Coinbase Wallet',
        icon: '🔷',
        connector: 'coinbase'
      }
    ],
  };

  return <Web3Context.Provider value={value}>{children}</Web3Context.Provider>;
};

export const useWeb3 = (): Web3ContextType => {
  const context = useContext(Web3Context);
  if (context === undefined) {
    throw new Error('useWeb3 must be used within a Web3Provider');
  }
  return context;
};

// Extend Window interface for TypeScript
declare global {
  interface Window {
    ethereum?: any;
  }
}