import { useWeb3 } from '../contexts/Web3Context';

// Re-export the useWeb3 hook from Web3Context
export { useWeb3 };

export const formatAddress = (address: string): string => {
  if (!address) return '';
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
};

export const getNetworkName = (chainId: number): string => {
  switch (chainId) {
    case 1:
      return 'Ethereum Mainnet';
    case 5:
      return 'Goerli Testnet';
    case 11155111:
      return 'Sepolia Testnet';
    case 137:
      return 'Polygon Mainnet';
    case 80001:
      return 'Mumbai Testnet';
    case 56:
      return 'BSC Mainnet';
    case 97:
      return 'BSC Testnet';
    default:
      return `Chain ID: ${chainId}`;
  }
};