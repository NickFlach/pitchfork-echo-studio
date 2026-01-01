import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { 
  Form, 
  FormControl, 
  FormDescription, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage 
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Tooltip, 
  TooltipContent, 
  TooltipProvider, 
  TooltipTrigger 
} from '@/components/ui/tooltip';
import { 
  Brain, 
  Settings, 
  Zap, 
  AlertCircle, 
  CheckCircle, 
  XCircle,
  ExternalLink,
  Info,
  Globe,
  Key,
  Clock,
  RefreshCw,
  BarChart3,
  Sparkles
} from 'lucide-react';
import { Navigation } from '@/components/Navigation';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { 
  type AISettings, 
  AIProvider, 
  AIModelConfig,
  insertAISettingsSchema,
  AIProviderEnum,
  type AIUsageAnalytics
} from '../../shared/schema';

// Form validation schema based on the backend schema
const aiSettingsFormSchema = insertAISettingsSchema.extend({
  // Add API key fields for validation (not stored)
  apiKeys: z.object({
    openai: z.string().optional(),
    claude: z.string().optional(),
    gemini: z.string().optional(),
    xai: z.string().optional(),
    litellm: z.string().optional(),
    lovable: z.string().optional(),
  }).optional(),
  // Add base URLs for custom endpoints
  baseUrls: z.object({
    xai: z.string().url().optional(),
    litellm: z.string().url().optional(),
  }).optional(),
});

type AISettingsFormData = z.infer<typeof aiSettingsFormSchema>;

// Enhanced Provider information and configurations with use cases and pricing
const PROVIDER_INFO = {
  openai: {
    name: 'OpenAI',
    description: 'GPT-4, GPT-3.5 Turbo, and other OpenAI models',
    models: ['gpt-4', 'gpt-4-turbo', 'gpt-3.5-turbo', 'gpt-3.5-turbo-16k'],
    apiKeyUrl: 'https://platform.openai.com/api-keys',
    defaultModel: 'gpt-4',
    requiresApiKey: true,
    requiresBaseUrl: false as const,
    defaultBaseUrl: undefined as string | undefined,
    strengths: ['Creative thinking', 'Code generation', 'Conversational AI', 'Broad knowledge'],
    bestFor: ['Creative consciousness exploration', 'Innovative campaign strategies', 'Complex problem solving'],
    consciousnessUseCase: 'Excels at creative self-reflection and exploring novel perspectives on personal growth',
    leadershipUseCase: 'Outstanding for brainstorming innovative campaign strategies and creative solutions',
    pricing: { model: 'gpt-4', inputPrice: 0.03, outputPrice: 0.06, currency: 'USD per 1K tokens' },
    testPrompt: 'Analyze how consciousness can evolve through creative exploration',
  },
  claude: {
    name: 'Anthropic Claude',
    description: 'Claude 3 Opus, Sonnet, and Haiku models',
    models: [
      'claude-3-opus-20240229',
      'claude-3-sonnet-20240229', 
      'claude-3-haiku-20240307',
      'claude-3-5-sonnet-20241022'
    ],
    apiKeyUrl: 'https://console.anthropic.com/settings/keys',
    defaultModel: 'claude-3-sonnet-20240229',
    requiresApiKey: true,
    requiresBaseUrl: false as const,
    defaultBaseUrl: undefined as string | undefined,
    strengths: ['Logical reasoning', 'Ethical analysis', 'Long-form analysis', 'Safety-focused'],
    bestFor: ['Deep consciousness reflection', 'Ethical decision-making', 'Strategic analysis'],
    consciousnessUseCase: 'Superior for deep philosophical reflection and ethical consciousness development',
    leadershipUseCase: 'Excellent for analyzing complex situations and providing balanced strategic guidance',
    pricing: { model: 'claude-3-sonnet', inputPrice: 0.003, outputPrice: 0.015, currency: 'USD per 1K tokens' },
    testPrompt: 'Provide a detailed analysis of decision-making frameworks for social movements',
  },
  gemini: {
    name: 'Google Gemini',
    description: 'Gemini Pro and other Google AI models',
    models: ['gemini-pro', 'gemini-pro-vision', 'gemini-1.5-pro'],
    apiKeyUrl: 'https://aistudio.google.com/app/apikey',
    defaultModel: 'gemini-pro',
    requiresApiKey: true,
    requiresBaseUrl: false as const,
    defaultBaseUrl: undefined as string | undefined,
    strengths: ['Data analysis', 'Research synthesis', 'Factual accuracy', 'Multimodal capabilities'],
    bestFor: ['Research-based insights', 'Data-driven decisions', 'Information synthesis'],
    consciousnessUseCase: 'Ideal for research-backed consciousness insights and evidence-based personal development',
    leadershipUseCase: 'Perfect for data-driven campaign analysis and research-based strategic planning',
    pricing: { model: 'gemini-pro', inputPrice: 0.0005, outputPrice: 0.0015, currency: 'USD per 1K tokens' },
    testPrompt: 'Synthesize research on effective leadership strategies for social change',
  },
  xai: {
    name: 'xAI Grok',
    description: 'Grok and other xAI models',
    models: ['grok-beta', 'grok-1'],
    apiKeyUrl: 'https://console.x.ai/team/api-keys',
    defaultModel: 'grok-beta',
    requiresApiKey: true,
    requiresBaseUrl: true as const,
    defaultBaseUrl: 'https://api.x.ai/v1' as const,
    strengths: ['Real-time information', 'Witty insights', 'Current events', 'Direct responses'],
    bestFor: ['Current context awareness', 'Real-time strategy', 'Timely insights'],
    consciousnessUseCase: 'Great for consciousness development in current world context and real-time insights',
    leadershipUseCase: 'Excellent for timely campaign strategies and current event-based decision making',
    pricing: { model: 'grok-beta', inputPrice: 0.01, outputPrice: 0.02, currency: 'USD per 1K tokens (estimated)' },
    testPrompt: 'Analyze current social movements and their consciousness-raising strategies',
  },
  litellm: {
    name: 'LiteLLM Proxy',
    description: 'Universal LLM API proxy supporting 100+ models',
    models: ['gpt-4', 'claude-3-opus', 'gemini-pro', 'custom-model'],
    apiKeyUrl: 'https://docs.litellm.ai/docs/proxy/quick_start',
    defaultModel: 'gpt-4',
    requiresApiKey: true,
    requiresBaseUrl: true as const,
    defaultBaseUrl: 'http://localhost:4000' as const,
    strengths: ['Model flexibility', 'Custom deployments', 'Cost optimization', 'Model switching'],
    bestFor: ['Custom workflows', 'Cost control', 'Model experimentation'],
    consciousnessUseCase: 'Flexible approach for experimenting with different consciousness exploration models',
    leadershipUseCase: 'Allows strategic model selection based on specific campaign needs and budget',
    pricing: { model: 'various', inputPrice: 'varies', outputPrice: 'varies', currency: 'depends on proxied model' },
    testPrompt: 'Test custom model configuration for consciousness and leadership applications',
  },
  lovable: {
    name: 'Lovable AI',
    description: 'Lovable AI Gateway - Access to Gemini & GPT-5 models with no API key required',
    models: ['google/gemini-2.5-flash', 'google/gemini-2.5-pro', 'openai/gpt-5', 'openai/gpt-5-mini'],
    apiKeyUrl: '',
    defaultModel: 'google/gemini-2.5-flash',
    requiresApiKey: false,
    requiresBaseUrl: false as const,
    defaultBaseUrl: undefined as string | undefined,
    strengths: ['No API key required', 'Built-in rate limiting', 'Multi-model access', 'Seamless integration'],
    bestFor: ['Quick integration', 'Production apps', 'Cost-effective AI'],
    consciousnessUseCase: 'Seamless AI integration for consciousness exploration without configuration',
    leadershipUseCase: 'Ready-to-use AI for campaign strategies with automatic model routing',
    pricing: { model: 'gemini-2.5-flash', inputPrice: 0.0, outputPrice: 0.0, currency: 'Included with Lovable' },
    testPrompt: 'Analyze consciousness development strategies for social movements',
  },
} as const;

export default function AISettings() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [showApiKeys, setShowApiKeys] = useState<Record<string, boolean>>({});
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [onboardingStep, setOnboardingStep] = useState(1);
  const [testingProvider, setTestingProvider] = useState<string | null>(null);
  const [testResults, setTestResults] = useState<Record<string, any>>({});
  const [selectedProviderForComparison, setSelectedProviderForComparison] = useState<string | null>(null);
  const [showProviderComparison, setShowProviderComparison] = useState(false);
  const [estimatedMonthlyCost, setEstimatedMonthlyCost] = useState<Record<string, number>>({});
  const [usageEstimate, setUsageEstimate] = useState({ requests: 1000, tokensPerRequest: 2000 });

  // Fetch current AI settings
  const { data: currentSettings, isLoading } = useQuery({
    queryKey: ['/api/admin/ai-settings'],
    staleTime: 30000, // 30 seconds
  });

  // Fetch AI service health status
  const { data: healthStatus } = useQuery({
    queryKey: ['/api/ai/health'],
    refetchInterval: 60000, // Refresh every minute
  });

  // Form setup with default values
  const form = useForm<AISettingsFormData>({
    resolver: zodResolver(aiSettingsFormSchema),
    defaultValues: {
      mode: 'direct',
      routing: {
        primary: 'openai',
        fallbacks: ['claude', 'gemini'],
        timeoutMs: 30000,
        retry: {
          maxAttempts: 3,
          backoffMs: 1000,
        },
      },
      providerPrefs: {},
      apiKeys: {},
      baseUrls: {},
    },
  });

  // Update form when settings are loaded
  useEffect(() => {
    if (currentSettings && typeof currentSettings === 'object') {
      const settings = currentSettings as AISettings;
      form.reset({
        mode: settings.mode,
        routing: settings.routing,
        providerPrefs: settings.providerPrefs || {},
        apiKeys: {}, // Never populate API keys from server
        baseUrls: {},
      });
    }
  }, [currentSettings, form]);

  // Fetch current credentials (masked)
  const { data: currentCredentials } = useQuery({
    queryKey: ['/api/admin/ai-credentials'],
    staleTime: 30000, // 30 seconds
  });

  // Mutation for updating AI settings
  const updateSettingsMutation = useMutation({
    mutationFn: async (data: AISettingsFormData) => {
      // Remove API keys and base URLs from the data sent to AI settings
      const { apiKeys, baseUrls, ...settingsData } = data;
      return apiRequest('/api/admin/ai-settings', {
        method: 'PUT',
        body: JSON.stringify(settingsData),
      });
    },
    onSuccess: () => {
      toast({
        title: 'Settings Updated',
        description: 'AI routing and provider preferences have been updated.',
      });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/ai-settings'] });
      queryClient.invalidateQueries({ queryKey: ['/api/ai/health'] });
    },
    onError: (error) => {
      toast({
        title: 'Settings Update Failed',
        description: error instanceof Error ? error.message : 'Failed to update settings',
        variant: 'destructive',
      });
    },
  });
  
  // Mutation for updating AI credentials
  const updateCredentialsMutation = useMutation({
    mutationFn: async (credentials: { apiKeys?: Record<string, string>, baseUrls?: Record<string, string> }) => {
      return apiRequest('/api/admin/ai-credentials', {
        method: 'PUT',
        body: JSON.stringify(credentials),
      });
    },
    onSuccess: (response) => {
      toast({
        title: 'Credentials Updated',
        description: `Successfully updated ${response.count} credential(s).`,
      });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/ai-credentials'] });
      queryClient.invalidateQueries({ queryKey: ['/api/ai/health'] });
      // Clear the form credential fields after successful update
      form.setValue('apiKeys', {});
      form.setValue('baseUrls', {});
    },
    onError: (error) => {
      toast({
        title: 'Credential Update Failed',
        description: error instanceof Error ? error.message : 'Failed to update credentials',
        variant: 'destructive',
      });
    },
  });

  const onSubmitSettings = (data: AISettingsFormData) => {
    // Submit only settings (routing, provider preferences)
    updateSettingsMutation.mutate(data);
  };
  
  const onSubmitCredentials = (data: AISettingsFormData) => {
    // Submit only credentials (API keys and base URLs)
    const credentials: { apiKeys?: Record<string, string>, baseUrls?: Record<string, string> } = {};
    
    if (data.apiKeys && Object.keys(data.apiKeys).length > 0) {
      // Filter out empty values
      const filteredApiKeys = Object.fromEntries(
        Object.entries(data.apiKeys).filter(([_, value]) => value && value.trim())
      );
      if (Object.keys(filteredApiKeys).length > 0) {
        credentials.apiKeys = filteredApiKeys;
      }
    }
    
    if (data.baseUrls && Object.keys(data.baseUrls).length > 0) {
      // Filter out empty values
      const filteredBaseUrls = Object.fromEntries(
        Object.entries(data.baseUrls).filter(([_, value]) => value && value.trim())
      );
      if (Object.keys(filteredBaseUrls).length > 0) {
        credentials.baseUrls = filteredBaseUrls;
      }
    }
    
    if (Object.keys(credentials).length > 0) {
      updateCredentialsMutation.mutate(credentials);
    } else {
      toast({
        title: 'No Credentials to Update',
        description: 'Please enter API keys or base URLs to update.',
        variant: 'destructive',
      });
    }
  };
  
  const onResetCredentials = () => {
    form.setValue('apiKeys', {});
    form.setValue('baseUrls', {});
    toast({
      title: 'Credentials Reset',
      description: 'Credential form fields have been cleared.',
    });
  };

  const toggleApiKeyVisibility = (provider: string) => {
    setShowApiKeys(prev => ({
      ...prev,
      [provider]: !prev[provider]
    }));
  };

  const getProviderStatus = (provider: AIProvider) => {
    if (!healthStatus || typeof healthStatus !== 'object' || !('providers' in healthStatus)) return 'unknown';
    const providers = (healthStatus as any).providers;
    return providers && providers[provider] ? 'healthy' : 'unhealthy';
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'unhealthy':
        return <XCircle className="w-4 h-4 text-red-500" />;
      default:
        return <AlertCircle className="w-4 h-4 text-yellow-500" />;
    }
  };

  // Helper functions for enhanced AI Settings features
  const testProviderMutation = useMutation({
    mutationFn: async (provider: string) => {
      const providerInfo = PROVIDER_INFO[provider as keyof typeof PROVIDER_INFO];
      return apiRequest('/api/ai/test', {
        method: 'POST',
        body: JSON.stringify({
          provider,
          prompt: providerInfo.testPrompt,
          maxTokens: 100,
        }),
      });
    },
    onSuccess: (result, provider) => {
      setTestResults(prev => ({ ...prev, [provider]: result }));
      toast({
        title: 'Provider Test Successful',
        description: `${PROVIDER_INFO[provider as keyof typeof PROVIDER_INFO].name} is working correctly`,
      });
    },
    onError: (error, provider) => {
      setTestResults(prev => ({ ...prev, [provider]: { error: error.message } }));
      toast({
        title: 'Provider Test Failed',
        description: `Failed to test ${PROVIDER_INFO[provider as keyof typeof PROVIDER_INFO].name}: ${error instanceof Error ? error.message : 'Unknown error'}`,
        variant: 'destructive',
      });
    },
    onSettled: () => {
      setTestingProvider(null);
    },
  });

  const testProvider = (provider: string) => {
    setTestingProvider(provider);
    testProviderMutation.mutate(provider);
  };

  const calculateMonthlyCost = (provider: string, requests: number, tokensPerRequest: number) => {
    const providerInfo = PROVIDER_INFO[provider as keyof typeof PROVIDER_INFO];
    if (!providerInfo.pricing || typeof providerInfo.pricing.inputPrice !== 'number') {
      return 0;
    }
    const totalTokens = requests * tokensPerRequest;
    const cost = (totalTokens / 1000) * (providerInfo.pricing.inputPrice + (providerInfo.pricing.outputPrice as number || 0)) / 2;
    return Math.round(cost * 100) / 100; // Round to 2 decimal places
  };

  // Update cost estimates when usage changes
  useEffect(() => {
    const costs: Record<string, number> = {};
    Object.keys(PROVIDER_INFO).forEach(provider => {
      costs[provider] = calculateMonthlyCost(provider, usageEstimate.requests, usageEstimate.tokensPerRequest);
    });
    setEstimatedMonthlyCost(costs);
  }, [usageEstimate]);

  // Check if user needs onboarding (no API keys configured)
  useEffect(() => {
    if (currentCredentials && Array.isArray(currentCredentials)) {
      const hasAnyCredentials = currentCredentials.some(cred => cred.hasApiKey);
      setShowOnboarding(!hasAnyCredentials);
    }
  }, [currentCredentials]);

  const nextOnboardingStep = () => {
    if (onboardingStep < 4) {
      setOnboardingStep(prev => prev + 1);
    } else {
      setShowOnboarding(false);
      toast({
        title: 'Onboarding Complete!',
        description: 'You\'re all set to use AI-enhanced consciousness and leadership features.',
      });
    }
  };

  const prevOnboardingStep = () => {
    if (onboardingStep > 1) {
      setOnboardingStep(prev => prev - 1);
    }
  };

  // Get intelligent recommendations based on usage analytics
  const getIntelligentRecommendations = (analytics: any[]): Array<{
    title: string;
    description: string;
    priority: 'high' | 'medium' | 'low';
    action?: () => void;
    actionText?: string;
  }> => {
    if (!analytics || analytics.length === 0) return [];

    const recommendations: any[] = [];
    
    // Analyze provider performance
    const providerStats = analytics.reduce((acc: any, item: any) => {
      if (!acc[item.aiProvider]) {
        acc[item.aiProvider] = { success: 0, total: 0, avgTime: 0, tokens: 0 };
      }
      acc[item.aiProvider].total++;
      if (item.success) {
        acc[item.aiProvider].success++;
        acc[item.aiProvider].avgTime += item.responseTimeMs || 0;
      }
      acc[item.aiProvider].tokens += item.totalTokens || 0;
      return acc;
    }, {});

    // Check for low-performing providers
    Object.entries(providerStats).forEach(([provider, stats]: [string, any]) => {
      const successRate = stats.success / stats.total;
      const avgTime = stats.success > 0 ? stats.avgTime / stats.success : 0;
      
      if (successRate < 0.85 && stats.total > 5) {
        recommendations.push({
          title: `${PROVIDER_INFO[provider as keyof typeof PROVIDER_INFO]?.name || provider} Performance Alert`,
          description: `Success rate is ${(successRate * 100).toFixed(1)}%. Consider checking API credentials or switching primary provider.`,
          priority: 'high' as const,
          action: () => {
            // Set primary to best performing provider
            const bestProvider = Object.entries(providerStats)
              .sort(([,a], [,b]) => ((b as any).success / (b as any).total) - ((a as any).success / (a as any).total))[0][0];
            form.setValue('routing.primary', bestProvider as any);
          },
          actionText: 'Switch to best provider'
        });
      }
      
      if (avgTime > 10000 && stats.success > 0) {
        recommendations.push({
          title: 'Slow Response Times Detected',
          description: `${provider} averages ${Math.round(avgTime)}ms response time. Consider optimizing or using faster providers for real-time features.`,
          priority: 'medium' as const,
        });
      }
    });

    // Feature-specific recommendations
    const featureUsage = analytics.reduce((acc: any, item: any) => {
      acc[item.featureType] = (acc[item.featureType] || 0) + 1;
      return acc;
    }, {});

    if (featureUsage['consciousness-reflection'] > 10) {
      recommendations.push({
        title: 'Consciousness Reflection Optimization',
        description: 'Claude is recommended for deep philosophical reflection based on your usage patterns.',
        priority: 'low' as const,
        action: () => form.setValue('routing.primary', 'claude'),
        actionText: 'Set Claude as primary'
      });
    }

    return recommendations.slice(0, 3); // Show top 3 recommendations
  };

  const getProviderRecommendation = (useCase: 'consciousness' | 'leadership' | 'general') => {
    switch (useCase) {
      case 'consciousness':
        return {
          primary: 'claude',
          reason: 'Best for deep philosophical reflection and ethical consciousness development',
          alternatives: [
            { provider: 'openai', reason: 'Great for creative self-exploration' },
            { provider: 'gemini', reason: 'Excellent for research-backed insights' }
          ]
        };
      case 'leadership':
        return {
          primary: 'openai',
          reason: 'Outstanding for innovative campaign strategies and creative solutions',
          alternatives: [
            { provider: 'claude', reason: 'Excellent for strategic analysis' },
            { provider: 'xai', reason: 'Great for timely, context-aware strategies' }
          ]
        };
      default:
        return {
          primary: 'claude',
          reason: 'Well-balanced for various AI tasks',
          alternatives: [
            { provider: 'openai', reason: 'Versatile and creative' },
            { provider: 'gemini', reason: 'Cost-effective and reliable' }
          ]
        };
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation showQuickNav={false} />
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation showQuickNav={false} />
      
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <div className="flex items-center gap-2">
            <Brain className="w-8 h-8 text-primary" />
            <h1 className="text-3xl font-bold">AI Settings</h1>
          </div>
          <Badge variant="outline" className="ml-2">
            Configuration
          </Badge>
        </div>

        <Form {...form}>
          <div className="space-y-8">
            
            {/* Operation Mode */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="w-5 h-5" />
                  Operation Mode
                </CardTitle>
                <CardDescription>
                  Choose how AI requests are handled in your system
                </CardDescription>
              </CardHeader>
              <CardContent>
                <FormField
                  control={form.control}
                  name="mode"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>AI Service Mode</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value} data-testid="select-operation-mode">
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select operation mode" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="direct">
                            <div className="flex flex-col">
                              <span>Direct Providers</span>
                              <span className="text-sm text-muted-foreground">
                                Connect directly to AI provider APIs
                              </span>
                            </div>
                          </SelectItem>
                          <SelectItem value="litellm">
                            <div className="flex flex-col">
                              <span>LiteLLM Proxy</span>
                              <span className="text-sm text-muted-foreground">
                                Route through LiteLLM proxy for unified access
                              </span>
                            </div>
                          </SelectItem>
                        </SelectContent>
                      </Select>
                      <FormDescription>
                        {field.value === 'direct' 
                          ? 'Individual provider configurations with intelligent routing and fallbacks'
                          : 'Single LiteLLM proxy endpoint supporting 100+ models with unified API'
                        }
                      </FormDescription>
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            <Tabs defaultValue="providers" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="providers" data-testid="tab-providers">Providers</TabsTrigger>
                <TabsTrigger value="routing" data-testid="tab-routing">Routing</TabsTrigger>
                <TabsTrigger value="status" data-testid="tab-status">Status</TabsTrigger>
              </TabsList>

              {/* Provider Configuration Tab */}
              <TabsContent value="providers" className="space-y-6">
                <TooltipProvider>
                  {Object.entries(PROVIDER_INFO).map(([providerId, info]) => {
                    const provider = providerId as AIProvider;
                    const isLiteLLMMode = form.watch('mode') === 'litellm';
                    
                    // Skip non-LiteLLM providers in LiteLLM mode
                    if (isLiteLLMMode && provider !== 'litellm') return null;
                    
                    // Skip LiteLLM in direct mode
                    if (!isLiteLLMMode && provider === 'litellm') return null;

                    return (
                      <Card key={provider}>
                        <CardHeader>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <CardTitle className="flex items-center gap-2">
                                {info.name}
                                {getStatusIcon(getProviderStatus(provider))}
                              </CardTitle>
                            </div>
                            <div className="flex items-center gap-2">
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={() => window.open(info.apiKeyUrl, '_blank')}
                                    data-testid={`button-api-docs-${provider}`}
                                  >
                                    <ExternalLink className="w-4 h-4" />
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>
                                  Get API Key
                                </TooltipContent>
                              </Tooltip>
                            </div>
                          </div>
                          <CardDescription>{info.description}</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          
                          {/* API Key Field */}
                          {info.requiresApiKey && (
                            <div className="space-y-2">
                              <FormLabel className="flex items-center gap-2">
                                <Key className="w-4 h-4" />
                                API Key
                              </FormLabel>
                              <div className="flex gap-2">
                                <Input
                                  type={showApiKeys[provider] ? 'text' : 'password'}
                                  placeholder="••••••••••••••••••••••••••••••••"
                                  value={form.watch(`apiKeys.${provider}`) || ''}
                                  onChange={(e) => 
                                    form.setValue(`apiKeys.${provider}`, e.target.value)
                                  }
                                  data-testid={`input-api-key-${provider}`}
                                />
                                <Button
                                  type="button"
                                  variant="outline"
                                  size="sm"
                                  onClick={() => toggleApiKeyVisibility(provider)}
                                  data-testid={`button-toggle-key-${provider}`}
                                >
                                  {showApiKeys[provider] ? 'Hide' : 'Show'}
                                </Button>
                              </div>
                              <p className="text-sm text-muted-foreground">
                                API keys are never stored on the server. Configure them securely in your environment.
                              </p>
                            </div>
                          )}

                          {/* Base URL Field (for xAI and LiteLLM) */}
                          {info.requiresBaseUrl && (
                            <div className="space-y-2">
                              <FormLabel className="flex items-center gap-2">
                                <Globe className="w-4 h-4" />
                                Base URL
                              </FormLabel>
                              <Input
                                placeholder={info.defaultBaseUrl}
                                value={(form.watch('baseUrls') as any)?.[provider] || ''}
                                onChange={(e) => 
                                  form.setValue(`baseUrls.${provider}` as any, e.target.value)
                                }
                                data-testid={`input-base-url-${provider}`}
                              />
                              <p className="text-sm text-muted-foreground">
                                {provider === 'litellm' 
                                  ? 'LiteLLM proxy server endpoint'
                                  : 'Custom API endpoint URL'
                                }
                              </p>
                            </div>
                          )}

                          {/* Model Configuration */}
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="space-y-2">
                              <FormLabel>Model</FormLabel>
                              <Select
                                value={(form.watch('providerPrefs') as any)?.[provider]?.model || info.defaultModel}
                                onValueChange={(value) => 
                                  form.setValue(`providerPrefs.${provider}.model` as any, value)
                                }
                                data-testid={`select-model-${provider}`}
                              >
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  {info.models.map(model => (
                                    <SelectItem key={model} value={model}>
                                      {model}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>

                            <div className="space-y-2">
                              <FormLabel>Temperature</FormLabel>
                              <Input
                                type="number"
                                min="0"
                                max="2"
                                step="0.1"
                                placeholder="0.7"
                                value={form.watch(`providerPrefs.${provider}.temperature`) || ''}
                                onChange={(e) => 
                                  form.setValue(`providerPrefs.${provider}.temperature`, parseFloat(e.target.value))
                                }
                                data-testid={`input-temperature-${provider}`}
                              />
                            </div>

                            <div className="space-y-2">
                              <FormLabel>Max Tokens</FormLabel>
                              <Input
                                type="number"
                                min="1"
                                max="100000"
                                placeholder="4000"
                                value={form.watch(`providerPrefs.${provider}.maxTokens`) || ''}
                                onChange={(e) => 
                                  form.setValue(`providerPrefs.${provider}.maxTokens`, parseInt(e.target.value))
                                }
                                data-testid={`input-max-tokens-${provider}`}
                              />
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </TooltipProvider>
              </TabsContent>

              {/* Routing Configuration Tab */}
              <TabsContent value="routing" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Zap className="w-5 h-5" />
                      Routing Policy
                    </CardTitle>
                    <CardDescription>
                      Configure primary provider, fallback chain, and retry logic
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    
                    {/* Primary Provider */}
                    <FormField
                      control={form.control}
                      name="routing.primary"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Primary Provider</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value} data-testid="select-primary-provider">
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {Object.entries(PROVIDER_INFO).map(([providerId, info]) => {
                                const isLiteLLMMode = form.watch('mode') === 'litellm';
                                if (isLiteLLMMode && providerId !== 'litellm') return null;
                                if (!isLiteLLMMode && providerId === 'litellm') return null;
                                
                                return (
                                  <SelectItem key={providerId} value={providerId}>
                                    {info.name}
                                  </SelectItem>
                                );
                              })}
                            </SelectContent>
                          </Select>
                          <FormDescription>
                            The default provider for all AI requests
                          </FormDescription>
                        </FormItem>
                      )}
                    />

                    {/* Fallback Providers (only in direct mode) */}
                    {form.watch('mode') === 'direct' && (
                      <div className="space-y-2">
                        <FormLabel>Fallback Providers</FormLabel>
                        <div className="grid grid-cols-2 gap-2">
                          {(['openai', 'claude', 'gemini', 'xai'] as AIProvider[]).map(provider => (
                            <div key={provider} className="flex items-center space-x-2">
                              <input
                                type="checkbox"
                                id={`fallback-${provider}`}
                                checked={form.watch('routing.fallbacks')?.includes(provider) || false}
                                onChange={(e) => {
                                  const current = form.watch('routing.fallbacks') || [];
                                  if (e.target.checked) {
                                    form.setValue('routing.fallbacks', [...current, provider]);
                                  } else {
                                    form.setValue('routing.fallbacks', current.filter(p => p !== provider));
                                  }
                                }}
                                data-testid={`checkbox-fallback-${provider}`}
                              />
                              <label htmlFor={`fallback-${provider}`} className="text-sm">
                                {PROVIDER_INFO[provider].name}
                              </label>
                            </div>
                          ))}
                        </div>
                        <p className="text-sm text-muted-foreground">
                          Providers to try if the primary provider fails
                        </p>
                      </div>
                    )}

                    <Separator />

                    {/* Timeout and Retry Configuration */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <FormField
                        control={form.control}
                        name="routing.timeoutMs"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="flex items-center gap-2">
                              <Clock className="w-4 h-4" />
                              Timeout (ms)
                            </FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                min="1000"
                                max="300000"
                                placeholder="30000"
                                {...field}
                                onChange={(e) => field.onChange(parseInt(e.target.value))}
                                data-testid="input-timeout"
                              />
                            </FormControl>
                            <FormDescription>Request timeout in milliseconds</FormDescription>
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="routing.retry.maxAttempts"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="flex items-center gap-2">
                              <RefreshCw className="w-4 h-4" />
                              Max Retries
                            </FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                min="1"
                                max="10"
                                placeholder="3"
                                {...field}
                                onChange={(e) => field.onChange(parseInt(e.target.value))}
                                data-testid="input-max-retries"
                              />
                            </FormControl>
                            <FormDescription>Maximum retry attempts</FormDescription>
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="routing.retry.backoffMs"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Backoff (ms)</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                min="100"
                                max="60000"
                                placeholder="1000"
                                {...field}
                                onChange={(e) => field.onChange(parseInt(e.target.value))}
                                data-testid="input-backoff"
                              />
                            </FormControl>
                            <FormDescription>Base backoff time</FormDescription>
                          </FormItem>
                        )}
                      />
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Status Tab */}
              <TabsContent value="status" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <CheckCircle className="w-5 h-5" />
                      System Status
                    </CardTitle>
                    <CardDescription>
                      Monitor the health and status of AI providers
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {healthStatus ? (
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <span className="font-medium">Overall Status:</span>
                          <Badge variant={
                            healthStatus && typeof healthStatus === 'object' && 'status' in healthStatus
                              ? (healthStatus as any).status === 'healthy' ? 'default' :
                                (healthStatus as any).status === 'degraded' ? 'secondary' : 'destructive'
                              : 'destructive'
                          }>
                            {healthStatus && typeof healthStatus === 'object' && 'status' in healthStatus 
                              ? (healthStatus as any).status 
                              : 'unknown'}
                          </Badge>
                        </div>
                        
                        <Separator />
                        
                        <div className="space-y-2">
                          <h4 className="font-medium">Provider Status:</h4>
                          {healthStatus && typeof healthStatus === 'object' && 'providers' in healthStatus && 
                           Object.entries((healthStatus as any).providers).map(([provider, isHealthy]) => (
                            <div key={provider} className="flex items-center justify-between">
                              <span className="capitalize">{provider}:</span>
                              <div className="flex items-center gap-2">
                                {getStatusIcon(isHealthy ? 'healthy' : 'unhealthy')}
                                <span className="text-sm">
                                  {isHealthy ? 'Healthy' : 'Unhealthy'}
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-4">
                        <p className="text-muted-foreground">Loading status...</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>

            {/* Form Actions */}
            <div className="flex items-center justify-between pt-6">
              <Alert className="flex-1 mr-4">
                <Info className="w-4 h-4" />
                <AlertDescription>
                  Settings are automatically applied to all AI operations. API keys should be configured in your environment variables.
                </AlertDescription>
              </Alert>
              
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => form.reset()}
                  data-testid="button-reset"
                >
                  Reset
                </Button>
                <Button
                  type="submit"
                  disabled={updateSettingsMutation.isPending}
                  data-testid="button-save"
                >
                  {updateSettingsMutation.isPending ? 'Saving...' : 'Save Settings'}
                </Button>
              </div>
            </div>
          </div>
        </Form>
      </div>
    </div>
  );
}