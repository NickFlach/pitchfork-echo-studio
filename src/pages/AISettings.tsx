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
  RefreshCw
} from 'lucide-react';
import { Navigation } from '@/components/Navigation';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { 
  type AISettings, 
  AIProvider, 
  AIModelConfig,
  insertAISettingsSchema,
  AIProviderEnum
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
  }).optional(),
  // Add base URLs for custom endpoints
  baseUrls: z.object({
    xai: z.string().url().optional(),
    litellm: z.string().url().optional(),
  }).optional(),
});

type AISettingsFormData = z.infer<typeof aiSettingsFormSchema>;

// Provider information and configurations
const PROVIDER_INFO = {
  openai: {
    name: 'OpenAI',
    description: 'GPT-4, GPT-3.5 Turbo, and other OpenAI models',
    models: ['gpt-4', 'gpt-4-turbo', 'gpt-3.5-turbo', 'gpt-3.5-turbo-16k'],
    apiKeyUrl: 'https://platform.openai.com/api-keys',
    defaultModel: 'gpt-4',
    requiresApiKey: true,
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
  },
  gemini: {
    name: 'Google Gemini',
    description: 'Gemini Pro and other Google AI models',
    models: ['gemini-pro', 'gemini-pro-vision', 'gemini-1.5-pro'],
    apiKeyUrl: 'https://aistudio.google.com/app/apikey',
    defaultModel: 'gemini-pro',
    requiresApiKey: true,
  },
  xai: {
    name: 'xAI Grok',
    description: 'Grok and other xAI models',
    models: ['grok-beta', 'grok-1'],
    apiKeyUrl: 'https://console.x.ai/team/api-keys',
    defaultModel: 'grok-beta',
    requiresApiKey: true,
    requiresBaseUrl: true,
    defaultBaseUrl: 'https://api.x.ai/v1',
  },
  litellm: {
    name: 'LiteLLM Proxy',
    description: 'Universal LLM API proxy supporting 100+ models',
    models: ['gpt-4', 'claude-3-opus', 'gemini-pro', 'custom-model'],
    apiKeyUrl: 'https://docs.litellm.ai/docs/proxy/quick_start',
    defaultModel: 'gpt-4',
    requiresApiKey: true,
    requiresBaseUrl: true,
    defaultBaseUrl: 'http://localhost:4000',
  },
} as const;

export default function AISettings() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [showApiKeys, setShowApiKeys] = useState<Record<string, boolean>>({});

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
        body: settingsData,
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
        body: credentials,
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
                                value={form.watch(`baseUrls.${provider}`) || ''}
                                onChange={(e) => 
                                  form.setValue(`baseUrls.${provider}`, e.target.value)
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
                                value={form.watch(`providerPrefs.${provider}.model`) || info.defaultModel}
                                onValueChange={(value) => 
                                  form.setValue(`providerPrefs.${provider}.model`, value)
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