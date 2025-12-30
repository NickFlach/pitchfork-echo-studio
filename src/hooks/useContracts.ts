import { useState, useEffect, useMemo } from 'react';
import { useWeb3 } from '../contexts/Web3Context';
import { ContractService } from '../lib/contracts';

export const useContracts = () => {
  const { provider, signer, account, isConnected } = useWeb3();
  const [contractService, setContractService] = useState<ContractService | null>(null);

  useEffect(() => {
    if (provider && signer && isConnected) {
      const service = new ContractService(provider, signer);
      setContractService(service);
    } else {
      setContractService(null);
    }
  }, [provider, signer, isConnected]);

  return contractService;
};

export const usePforkToken = () => {
  const contractService = useContracts();
  const { account } = useWeb3();
  
  const [balance, setBalance] = useState<string>('0');
  const [stakedBalance, setStakedBalance] = useState<string>('0');
  const [pendingRewards, setPendingRewards] = useState<string>('0');
  const [votes, setVotes] = useState<string>('0');
  const [loading, setLoading] = useState(false);

  const fetchBalances = async () => {
    if (!contractService || !account) return;
    
    setLoading(true);
    try {
      const [pforkBalance, gpforkBalance, rewards, votingPower] = await Promise.all([
        contractService.getPforkBalance(account),
        contractService.getGpforkBalance(account),
        contractService.getPendingRewards(account),
        contractService.getVotes(account),
      ]);
      
      setBalance(pforkBalance);
      setStakedBalance(gpforkBalance);
      setPendingRewards(rewards);
      setVotes(votingPower);
    } catch (error) {
      console.error('Error fetching token balances:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBalances();
  }, [contractService, account]);

  const stake = async (amount: string) => {
    if (!contractService) throw new Error('Contract service not available');
    return await contractService.stakeTokens(amount);
  };

  const unstake = async (amount: string) => {
    if (!contractService) throw new Error('Contract service not available');
    return await contractService.unstakeTokens(amount);
  };

  const claimRewards = async () => {
    if (!contractService) throw new Error('Contract service not available');
    return await contractService.claimRewards();
  };

  const exit = async () => {
    if (!contractService) throw new Error('Contract service not available');
    return await contractService.exitStaking();
  };

  const delegate = async (delegatee: string) => {
    if (!contractService) throw new Error('Contract service not available');
    return await contractService.delegateVotes(delegatee);
  };

  return {
    balance,
    stakedBalance,
    pendingRewards,
    votes,
    loading,
    stake,
    unstake,
    claimRewards,
    exit,
    delegate,
    refetch: fetchBalances,
  };
};

// Alias for backward compatibility
export const useConsciousnessToken = usePforkToken;

export const useAchievements = () => {
  const contractService = useContracts();
  const { account } = useWeb3();
  
  const [achievements, setAchievements] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchAchievements = async () => {
    if (!contractService || !account) return;
    
    setLoading(true);
    try {
      const tokenIds = await contractService.getUserAchievements(account);
      const achievementDetails = await Promise.all(
        tokenIds.map(async (tokenId) => {
          const details = await contractService.getAchievementDetails(tokenId);
          const evolutionInfo = await contractService.canEvolveAchievement(tokenId);
          return {
            tokenId,
            ...details,
            ...evolutionInfo,
          };
        })
      );
      
      setAchievements(achievementDetails);
    } catch (error) {
      console.error('Error fetching achievements:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAchievements();
  }, [contractService, account]);

  const evolveAchievement = async (tokenId: number) => {
    if (!contractService) throw new Error('Contract service not available');
    return await contractService.evolveAchievement(tokenId);
  };

  return {
    achievements,
    loading,
    evolveAchievement,
    refetch: fetchAchievements,
  };
};

export const useSubscription = () => {
  const contractService = useContracts();
  const { account } = useWeb3();
  
  const [subscription, setSubscription] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const fetchSubscription = async () => {
    if (!contractService || !account) return;
    
    setLoading(true);
    try {
      const subDetails = await contractService.getSubscription(account);
      setSubscription(subDetails);
    } catch (error) {
      console.error('Error fetching subscription:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubscription();
  }, [contractService, account]);

  const subscribe = async (tier: number, isAnnual: boolean, paymentToken: string) => {
    if (!contractService) throw new Error('Contract service not available');
    return await contractService.subscribe(tier, isAnnual, paymentToken);
  };

  const hasFeatureAccess = async (feature: string): Promise<boolean> => {
    if (!contractService || !account) return false;
    return await contractService.hasFeatureAccess(account, feature);
  };

  return {
    subscription,
    loading,
    subscribe,
    hasFeatureAccess,
    refetch: fetchSubscription,
  };
};

export const useGovernance = () => {
  const contractService = useContracts();
  const { account } = useWeb3();
  
  const [votingPower, setVotingPower] = useState<string>('0');
  const [proposals, setProposals] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchVotingPower = async () => {
    if (!contractService || !account) return;
    
    try {
      const power = await contractService.getVotingPower(account);
      setVotingPower(power);
    } catch (error) {
      console.error('Error fetching voting power:', error);
    }
  };

  useEffect(() => {
    fetchVotingPower();
  }, [contractService, account]);

  const createProposal = async (
    category: number,
    title: string,
    description: string,
    executionDetails: string
  ) => {
    if (!contractService) throw new Error('Contract service not available');
    return await contractService.createProposal(category, title, description, executionDetails);
  };

  const castVote = async (proposalId: number, voteType: number, reason: string) => {
    if (!contractService) throw new Error('Contract service not available');
    return await contractService.castVote(proposalId, voteType, reason);
  };

  const getProposal = async (proposalId: number) => {
    if (!contractService) throw new Error('Contract service not available');
    return await contractService.getProposal(proposalId);
  };

  return {
    votingPower,
    proposals,
    loading,
    createProposal,
    castVote,
    getProposal,
    refetch: fetchVotingPower,
  };
};

export const useIdentity = () => {
  const contractService = useContracts();
  const { account } = useWeb3();
  
  const [identity, setIdentity] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const fetchIdentity = async () => {
    if (!contractService || !account) return;
    
    setLoading(true);
    try {
      const identityDetails = await contractService.getIdentity(account);
      setIdentity(identityDetails);
    } catch (error) {
      console.error('Error fetching identity:', error);
      // Identity might not exist yet
      setIdentity(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchIdentity();
  }, [contractService, account]);

  const createIdentity = async (publicProfile: string, isEnterpriseAccount: boolean) => {
    if (!contractService) throw new Error('Contract service not available');
    return await contractService.createIdentity(publicProfile, isEnterpriseAccount);
  };

  return {
    identity,
    loading,
    createIdentity,
    refetch: fetchIdentity,
  };
};

export const useAIPayment = () => {
  const contractService = useContracts();
  const { account } = useWeb3();
  
  const [accountBalance, setAccountBalance] = useState<string>('0');
  const [loading, setLoading] = useState(false);

  const fetchAccountBalance = async (token: string) => {
    if (!contractService || !account) return '0';
    
    try {
      const balance = await contractService.getUserTokenBalance(account, token);
      return balance;
    } catch (error) {
      console.error('Error fetching AI payment balance:', error);
      return '0';
    }
  };

  const fundAccount = async (token: string, amount: string) => {
    if (!contractService) throw new Error('Contract service not available');
    return await contractService.fundAccount(token, amount);
  };

  const canAccessService = async (serviceType: number) => {
    if (!contractService || !account) return { canAccess: false, message: 'Not connected' };
    return await contractService.canAccessService(account, serviceType);
  };

  return {
    accountBalance,
    loading,
    fundAccount,
    canAccessService,
    fetchAccountBalance,
  };
};