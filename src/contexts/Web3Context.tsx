import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { BrowserProvider, JsonRpcSigner, ethers } from 'ethers';

export interface WalletInfo {
  name: string;
  icon: string;
  connector: any;
}

export interface Web3ContextType {
  isConnected: boolean;
  account: string | null;
  provider: BrowserProvider | null;
  signer: JsonRpcSigner | null;
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
  const [provider, setProvider] = useState<BrowserProvider | null>(null);
  const [signer, setSigner] = useState<JsonRpcSigner | null>(null);
  const [chainId, setChainId] = useState<number | null>(null);
  const [walletType, setWalletType] = useState<string | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [supportedChains] = useState<number[]>(config?.supportedChains || [1, 137, 56, 5, 11155111, 80001, 97]);

  // Available wallet configurations
  const availableWallets: WalletInfo[] = [
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
  ];

  // Check if wallet is already connected on load
  useEffect(() => {
    checkConnection();
  }, []);

  // Listen for account changes
  useEffect(() => {
    if (window.ethereum) {
      const handleAccountsChanged = (accounts: string[]) => {
        if (accounts.length === 0) {
          disconnectWallet();
        } else {
          setAccount(accounts[0]);
        }
      };

      const handleChainChanged = (chainId: string) => {
        setChainId(parseInt(chainId, 16));
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
    if (window.ethereum) {
      try {
        const accounts = await window.ethereum.request({ method: 'eth_accounts' });
        if (accounts.length > 0) {
          const provider = new BrowserProvider(window.ethereum);
          const signer = await provider.getSigner();
          const network = await provider.getNetwork();
          
          setIsConnected(true);
          setAccount(accounts[0]);
          setProvider(provider);
          setSigner(signer);
          setChainId(Number(network.chainId));
        }
      } catch (error) {
        console.error('Error checking connection:', error);
      }
    }
  };

  const connectWallet = async (walletType?: string) => {
    setError(null);

    if (!window.ethereum) {
      const errorMsg = 'No Web3 wallet detected. Please install MetaMask or another Web3 wallet.';
      setError(errorMsg);
      throw new Error(errorMsg);
    }

    setIsConnecting(true);
    try {
      // Request account access
      const accounts = await window.ethereum.request({
        method: 'eth_requestAccounts',
      });

      if (accounts.length > 0) {
        const provider = new BrowserProvider(window.ethereum);
        const signer = await provider.getSigner();
        const network = await provider.getNetwork();

        setIsConnected(true);
        setAccount(accounts[0]);
        setProvider(provider);
        setSigner(signer);
        setChainId(Number(network.chainId));
        setWalletType(walletType || 'metamask');
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
      // Add more network configurations as needed
    };

    return networks[chainId];
  };

  const disconnectWallet = () => {
    setIsConnected(false);
    setAccount(null);
    setProvider(null);
    setSigner(null);
    setChainId(null);
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
    availableWallets,
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