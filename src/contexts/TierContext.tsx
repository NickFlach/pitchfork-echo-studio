import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useQuery } from '@tanstack/react-query';
import type { MaskedAICredentials } from '../../shared/schema';

// Tier system types
export type TierLevel = 'standard' | 'ai_enhanced';
export type FeatureCategory = 'consciousness' | 'leadership' | 'general';

export interface TierFeature {
  id: string;
  category: FeatureCategory;
  name: string;
  description: string;
  standardDescription: string;
  aiEnhancedDescription: string;
  valueProposition: string;
  standardCapabilities: string[];
  aiEnhancedCapabilities: string[];
  upgradePrompt?: string;
  roi?: string;
}

export interface TierUpgradePrompt {
  featureId: string;
  trigger: 'usage' | 'high_intent' | 'onboarding' | 'manual';
  title: string;
  description: string;
  benefits: string[];
  ctaText: string;
  urgency?: 'low' | 'medium' | 'high';
}

export interface TierAnalytics {
  featureUsage: Record<string, number>;
  upgradeConversions: Record<string, number>;
  tierAdoption: Record<TierLevel, number>;
  conversionFunnelDropoffs: Record<string, number>;
}

export interface TierContextValue {
  currentTier: TierLevel;
  aiCredentials: MaskedAICredentials[];
  configuredProviders: string[];
  isAIConfigured: boolean;
  loadingAIConfig: boolean;
  
  // Feature access control
  canAccessFeature: (featureId: string) => boolean;
  canAccessAIFeature: (featureId: string) => boolean;
  getFeatureDetails: (featureId: string) => TierFeature | undefined;
  
  // Upgrade flow
  triggerUpgradePrompt: (featureId: string, trigger: TierUpgradePrompt['trigger']) => void;
  dismissUpgradePrompt: () => void;
  currentUpgradePrompt: TierUpgradePrompt | null;
  
  // Analytics tracking
  trackFeatureUsage: (featureId: string, category: FeatureCategory) => void;
  trackUpgradeConversion: (fromFeature: string, successful: boolean) => void;
  trackTierAdoption: (newTier: TierLevel) => void;
  
  // Tier features registry
  features: TierFeature[];
  getFeaturesByCategory: (category: FeatureCategory) => TierFeature[];
}

// Feature definitions
const TIER_FEATURES: TierFeature[] = [
  // Consciousness Features
  {
    id: 'consciousness_reflection',
    category: 'consciousness',
    name: 'Reflection Processing',
    description: 'Process your thoughts and experiences for personal growth',
    standardDescription: 'Simple reflection forms with basic categorization',
    aiEnhancedDescription: 'Deep AI analysis with multi-perspective insights and pattern recognition',
    valueProposition: 'Get 10x deeper insights into your thoughts and patterns',
    standardCapabilities: [
      'Basic reflection logging',
      'Simple categorization',
      'Manual pattern recognition',
      'Static templates'
    ],
    aiEnhancedCapabilities: [
      'AI-powered insight generation',
      'Multi-perspective analysis',
      'Automatic pattern detection',
      'Personalized reflection prompts',
      'Emotional intelligence insights',
      'Growth recommendations'
    ],
    upgradePrompt: 'Unlock AI-powered insights that reveal hidden patterns in your consciousness',
    roi: 'Users report 3x faster personal development with AI insights'
  },
  {
    id: 'consciousness_decisions',
    category: 'consciousness',
    name: 'Decision Analysis',
    description: 'Analyze and improve your decision-making process',
    standardDescription: 'Basic decision tracking and simple frameworks',
    aiEnhancedDescription: 'Recursive consciousness analysis and intelligent decision synthesis',
    valueProposition: 'Make better decisions with AI-powered analysis of your decision patterns',
    standardCapabilities: [
      'Decision logging',
      'Basic outcome tracking',
      'Simple decision trees',
      'Manual review'
    ],
    aiEnhancedCapabilities: [
      'AI decision synthesis',
      'Recursive analysis',
      'Outcome prediction',
      'Bias detection',
      'Multi-criteria optimization',
      'Learning from past decisions'
    ],
    upgradePrompt: 'Discover hidden biases and optimize your decision-making with AI',
    roi: '85% improvement in decision quality reported by AI users'
  },
  {
    id: 'consciousness_learning',
    category: 'consciousness',
    name: 'Learning Evolution',
    description: 'Track and accelerate your learning and growth',
    standardDescription: 'Simple learning logs and basic progress tracking',
    aiEnhancedDescription: 'AI-driven learning optimization and evolutionary analysis',
    valueProposition: 'Accelerate your learning with personalized AI coaching',
    standardCapabilities: [
      'Learning logs',
      'Basic progress tracking',
      'Manual goal setting',
      'Static resources'
    ],
    aiEnhancedCapabilities: [
      'Personalized learning paths',
      'AI coaching insights',
      'Adaptive learning strategies',
      'Knowledge gap analysis',
      'Learning style optimization',
      'Growth acceleration metrics'
    ],
    upgradePrompt: 'Get personalized AI coaching that adapts to your learning style',
    roi: '2x faster skill acquisition with AI-guided learning'
  },
  
  // Leadership Features
  {
    id: 'leadership_strategy',
    category: 'leadership',
    name: 'Campaign Strategy',
    description: 'Plan and execute effective movement campaigns',
    standardDescription: 'Basic campaign templates and simple planning tools',
    aiEnhancedDescription: 'AI-generated strategic plans with multi-scenario analysis',
    valueProposition: 'Create winning campaigns with AI-powered strategic intelligence',
    standardCapabilities: [
      'Basic campaign templates',
      'Simple milestone tracking',
      'Manual resource allocation',
      'Static best practices'
    ],
    aiEnhancedCapabilities: [
      'AI-generated campaign strategies',
      'Multi-scenario analysis',
      'Dynamic resource optimization',
      'Opposition analysis',
      'Success probability modeling',
      'Adaptive strategy updates'
    ],
    upgradePrompt: 'Generate winning campaign strategies with AI strategic intelligence',
    roi: '300% improvement in campaign success rates with AI planning'
  },
  {
    id: 'leadership_resources',
    category: 'leadership',
    name: 'Resource Optimization',
    description: 'Optimize resource allocation for maximum impact',
    standardDescription: 'Basic resource lists and manual allocation',
    aiEnhancedDescription: 'Intelligent resource optimization with predictive modeling',
    valueProposition: 'Maximize impact with AI-optimized resource allocation',
    standardCapabilities: [
      'Resource tracking',
      'Manual allocation',
      'Basic budgeting',
      'Static guidelines'
    ],
    aiEnhancedCapabilities: [
      'AI-powered resource optimization',
      'Predictive resource modeling',
      'Dynamic allocation suggestions',
      'ROI optimization',
      'Risk-aware planning',
      'Real-time adjustment recommendations'
    ],
    upgradePrompt: 'Optimize resource allocation with AI for maximum campaign impact',
    roi: '150% better resource efficiency with AI optimization'
  },
  {
    id: 'leadership_opposition',
    category: 'leadership',
    name: 'Opposition Analysis',
    description: 'Analyze and counter opposition forces effectively',
    standardDescription: 'Basic opposition tracking and manual analysis',
    aiEnhancedDescription: 'Advanced AI analysis of opposition patterns and strategies',
    valueProposition: 'Stay ahead of opposition with AI-powered strategic intelligence',
    standardCapabilities: [
      'Opposition tracking',
      'Manual analysis',
      'Basic threat assessment',
      'Static countermeasures'
    ],
    aiEnhancedCapabilities: [
      'AI pattern recognition',
      'Predictive opposition modeling',
      'Strategic vulnerability analysis',
      'Dynamic counterstrategy generation',
      'Real-time threat assessment',
      'Adaptive response planning'
    ],
    upgradePrompt: 'Anticipate opposition moves with AI strategic intelligence',
    roi: '200% better preparedness against opposition tactics'
  }
];

const TierContext = createContext<TierContextValue | undefined>(undefined);

interface TierProviderProps {
  children: ReactNode;
}

export const TierProvider: React.FC<TierProviderProps> = ({ children }) => {
  const [currentUpgradePrompt, setCurrentUpgradePrompt] = useState<TierUpgradePrompt | null>(null);
  const [featureUsage, setFeatureUsage] = useState<Record<string, number>>({});
  const [upgradeConversions, setUpgradeConversions] = useState<Record<string, number>>({});
  const [tierAdoption, setTierAdoption] = useState<Record<TierLevel, number>>({ standard: 0, ai_enhanced: 0 });
  const [sessionId] = useState(() => `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`);

  // AI Configuration Detection
  const { data: aiCredentials = [], isLoading: loadingAIConfig } = useQuery<MaskedAICredentials[]>({
    queryKey: ['/api/admin/ai-credentials'],
    refetchInterval: 30000, // Check every 30 seconds
  });

  // Dynamic AI availability detection
  const isAIConfigured = aiCredentials.some(cred => cred.hasApiKey);
  const configuredProviders = aiCredentials.filter(cred => cred.hasApiKey).map(cred => cred.provider);
  const currentTier: TierLevel = isAIConfigured ? 'ai_enhanced' : 'standard';

  // Feature access control
  const canAccessFeature = (featureId: string): boolean => {
    const feature = TIER_FEATURES.find(f => f.id === featureId);
    if (!feature) return false;
    
    // All features are accessible in basic form, but AI-enhanced features require configuration
    // This provides operational gating for AI-specific actions
    return true; // Basic access always available
  };

  // AI-specific access control - prevents AI calls when not configured
  const canAccessAIFeature = (featureId: string): boolean => {
    const feature = TIER_FEATURES.find(f => f.id === featureId);
    if (!feature) return false;
    
    // AI features require proper configuration
    return isAIConfigured;
  };

  const getFeatureDetails = (featureId: string): TierFeature | undefined => {
    return TIER_FEATURES.find(f => f.id === featureId);
  };

  const getFeaturesByCategory = (category: FeatureCategory): TierFeature[] => {
    return TIER_FEATURES.filter(f => f.category === category);
  };

  // Upgrade flow management
  const triggerUpgradePrompt = (featureId: string, trigger: TierUpgradePrompt['trigger']) => {
    const feature = getFeatureDetails(featureId);
    if (!feature || isAIConfigured) return;

    const prompt: TierUpgradePrompt = {
      featureId,
      trigger,
      title: `Upgrade to AI-Enhanced ${feature.name}`,
      description: feature.valueProposition,
      benefits: feature.aiEnhancedCapabilities,
      ctaText: 'Configure AI Now',
      urgency: trigger === 'high_intent' ? 'high' : 'medium'
    };

    setCurrentUpgradePrompt(prompt);
    
    // Track upgrade prompt shown
    trackFeatureUsage(`upgrade_prompt_${featureId}`, feature.category);
  };

  const dismissUpgradePrompt = () => {
    setCurrentUpgradePrompt(null);
  };

  // Analytics tracking
  const trackFeatureUsage = (featureId: string, category: FeatureCategory) => {
    setFeatureUsage(prev => ({
      ...prev,
      [featureId]: (prev[featureId] || 0) + 1
    }));

    // Send to analytics backend (would be implemented with actual analytics service)
    console.log(`[TIER_ANALYTICS] Feature usage: ${featureId}, category: ${category}, session: ${sessionId}`);
  };

  const trackUpgradeConversion = (fromFeature: string, successful: boolean) => {
    const conversionKey = `${fromFeature}_${successful ? 'success' : 'failure'}`;
    setUpgradeConversions(prev => ({
      ...prev,
      [conversionKey]: (prev[conversionKey] || 0) + 1
    }));

    console.log(`[TIER_ANALYTICS] Upgrade conversion: ${fromFeature}, successful: ${successful}, session: ${sessionId}`);
  };

  const trackTierAdoption = (newTier: TierLevel) => {
    setTierAdoption(prev => ({
      ...prev,
      [newTier]: prev[newTier] + 1
    }));

    console.log(`[TIER_ANALYTICS] Tier adoption: ${newTier}, session: ${sessionId}`);
  };

  // Track initial tier adoption
  useEffect(() => {
    if (!loadingAIConfig) {
      trackTierAdoption(currentTier);
    }
  }, [currentTier, loadingAIConfig]);

  const value: TierContextValue = {
    currentTier,
    aiCredentials,
    configuredProviders,
    isAIConfigured,
    loadingAIConfig,
    
    canAccessFeature,
    canAccessAIFeature,
    getFeatureDetails,
    
    triggerUpgradePrompt,
    dismissUpgradePrompt,
    currentUpgradePrompt,
    
    trackFeatureUsage,
    trackUpgradeConversion,
    trackTierAdoption,
    
    features: TIER_FEATURES,
    getFeaturesByCategory
  };

  return (
    <TierContext.Provider value={value}>
      {children}
    </TierContext.Provider>
  );
};

export const useTier = (): TierContextValue => {
  const context = useContext(TierContext);
  if (context === undefined) {
    throw new Error('useTier must be used within a TierProvider');
  }
  return context;
};

export default TierProvider;