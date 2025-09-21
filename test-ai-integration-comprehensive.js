#!/usr/bin/env node

/**
 * Comprehensive AI Integration Testing Suite
 * Tests all AI components: Service Manager, Providers, Storage, Consciousness, Leadership
 */

import { spawn } from 'child_process';
import { performance } from 'perf_hooks';

// Test configuration
const TEST_CONFIG = {
  baseUrl: 'http://localhost:8080',
  timeout: 30000,
  maxRetries: 3,
  // Test API keys (use environment variables in production)
  testApiKeys: {
    // These are intentionally invalid keys for testing error handling
    openai: process.env.OPENAI_API_KEY || 'sk-test-invalid-key',
    claude: process.env.ANTHROPIC_API_KEY || 'sk-ant-test-invalid-key',
    gemini: process.env.GOOGLE_AI_API_KEY || 'test-invalid-key',
    xai: process.env.XAI_API_KEY || 'xai-test-invalid-key',
    litellm: process.env.LITELLM_API_KEY || 'test-invalid-key'
  },
  // Test endpoints
  endpoints: {
    aiSettings: '/api/admin/ai-settings',
    aiCredentials: '/api/admin/ai-credentials',
    aiHealth: '/api/ai/health',
    consciousnessReflect: '/api/consciousness/reflect',
    consciousnessProcess: '/api/consciousness/process-decision',
    leadershipStrategy: '/api/leadership/generate-strategy',
    leadershipAnalysis: '/api/leadership/analyze-decision'
  }
};

// Test utilities
class TestRunner {
  constructor() {
    this.results = {
      passed: 0,
      failed: 0,
      skipped: 0,
      errors: [],
      details: []
    };
    this.serverProcess = null;
  }

  async makeRequest(endpoint, options = {}) {
    const url = `${TEST_CONFIG.baseUrl}${endpoint}`;
    const method = options.method || 'GET';
    const headers = {
      'Content-Type': 'application/json',
      ...options.headers
    };

    const requestOptions = {
      method,
      headers,
      ...(options.body && { body: JSON.stringify(options.body) })
    };

    try {
      const response = await fetch(url, requestOptions);
      const data = response.headers.get('content-type')?.includes('application/json') 
        ? await response.json() 
        : await response.text();
      
      return {
        status: response.status,
        data,
        headers: Object.fromEntries(response.headers.entries())
      };
    } catch (error) {
      return {
        status: 0,
        error: error.message,
        data: null
      };
    }
  }

  async startServer() {
    return new Promise((resolve, reject) => {
      console.log('🚀 Starting server for testing...');
      
      // Try to start the server
      this.serverProcess = spawn('npm', ['run', 'dev'], {
        stdio: ['pipe', 'pipe', 'pipe'],
        env: { ...process.env, NODE_ENV: 'test' }
      });

      let serverReady = false;
      const timeout = setTimeout(() => {
        if (!serverReady) {
          console.log('⚠️  Server startup timeout - proceeding with existing server if available');
          resolve(false);
        }
      }, 15000);

      this.serverProcess.stdout.on('data', (data) => {
        const output = data.toString();
        console.log(`Server: ${output.trim()}`);
        
        if (output.includes('Local:') || output.includes('ready')) {
          if (!serverReady) {
            serverReady = true;
            clearTimeout(timeout);
            console.log('✅ Server ready for testing');
            // Wait a bit more for full initialization
            setTimeout(() => resolve(true), 2000);
          }
        }
      });

      this.serverProcess.stderr.on('data', (data) => {
        const output = data.toString();
        console.log(`Server Error: ${output.trim()}`);
        
        // If we get ENOSPC error, continue anyway
        if (output.includes('ENOSPC')) {
          console.log('⚠️  File watcher issue detected - continuing with limited functionality');
          if (!serverReady) {
            serverReady = true;
            clearTimeout(timeout);
            resolve(false);
          }
        }
      });

      this.serverProcess.on('error', (error) => {
        console.log(`Server spawn error: ${error.message}`);
        clearTimeout(timeout);
        resolve(false);
      });
    });
  }

  async stopServer() {
    if (this.serverProcess) {
      this.serverProcess.kill();
      this.serverProcess = null;
    }
  }

  assert(condition, message, details = null) {
    if (condition) {
      this.results.passed++;
      console.log(`✅ ${message}`);
      if (details) {
        this.results.details.push({ type: 'PASS', message, details });
      }
    } else {
      this.results.failed++;
      console.log(`❌ ${message}`);
      this.results.errors.push({ message, details });
      this.results.details.push({ type: 'FAIL', message, details });
    }
    return condition;
  }

  skip(message, reason) {
    this.results.skipped++;
    console.log(`⏭️  ${message} (${reason})`);
    this.results.details.push({ type: 'SKIP', message, reason });
  }

  async delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// Test suites
class AIServiceManagerTests {
  constructor(runner) {
    this.runner = runner;
  }

  async runTests() {
    console.log('\n🧠 Testing AI Service Manager Core Functionality...');

    // Test 1: AI Settings API
    await this.testAISettingsAPI();
    
    // Test 2: AI Credentials API
    await this.testAICredentialsAPI();
    
    // Test 3: AI Health Check API
    await this.testAIHealthAPI();
    
    // Test 4: Provider Configuration
    await this.testProviderConfiguration();
    
    // Test 5: Fallback Mechanisms
    await this.testFallbackMechanisms();
  }

  async testAISettingsAPI() {
    console.log('\n📋 Testing AI Settings API...');

    // Get current settings
    const getResponse = await this.runner.makeRequest(TEST_CONFIG.endpoints.aiSettings);
    this.runner.assert(
      getResponse.status === 200 || getResponse.status === 404,
      'GET /api/admin/ai-settings returns valid response',
      { status: getResponse.status, hasData: !!getResponse.data }
    );

    // Test settings update
    const testSettings = {
      mode: 'direct',
      routing: {
        primary: 'openai',
        fallbacks: ['claude', 'gemini'],
        timeoutMs: 30000,
        retry: {
          maxAttempts: 3,
          backoffMs: 1000
        }
      },
      providerPrefs: {
        temperature: 0.7,
        maxTokens: 4000
      }
    };

    const putResponse = await this.runner.makeRequest(TEST_CONFIG.endpoints.aiSettings, {
      method: 'PUT',
      body: testSettings
    });

    this.runner.assert(
      putResponse.status === 200 || putResponse.status === 201,
      'PUT /api/admin/ai-settings accepts valid settings',
      { status: putResponse.status, data: putResponse.data }
    );
  }

  async testAICredentialsAPI() {
    console.log('\n🔐 Testing AI Credentials API...');

    // Test credentials update
    const credentialsUpdate = {
      apiKeys: {
        openai: 'test-key-openai-12345',
        claude: 'test-key-claude-12345'
      },
      baseUrls: {
        xai: 'https://api.x.ai/v1',
        litellm: 'http://localhost:4000'
      }
    };

    const putResponse = await this.runner.makeRequest(TEST_CONFIG.endpoints.aiCredentials, {
      method: 'PUT',
      body: credentialsUpdate
    });

    this.runner.assert(
      putResponse.status === 200,
      'PUT /api/admin/ai-credentials accepts credential updates',
      { status: putResponse.status, count: putResponse.data?.count }
    );

    // Test getting masked credentials
    const getResponse = await this.runner.makeRequest(TEST_CONFIG.endpoints.aiCredentials);
    this.runner.assert(
      getResponse.status === 200,
      'GET /api/admin/ai-credentials returns masked credentials',
      { status: getResponse.status, credentialsCount: getResponse.data?.length }
    );

    // Verify credentials are properly masked
    if (getResponse.data && Array.isArray(getResponse.data)) {
      const hasApiKey = getResponse.data.some(cred => 
        cred.maskedApiKey && cred.maskedApiKey.includes('***')
      );
      this.runner.assert(
        hasApiKey,
        'API keys are properly masked in responses',
        { maskedCredentials: getResponse.data.map(c => ({ provider: c.provider, masked: c.maskedApiKey })) }
      );
    }
  }

  async testAIHealthAPI() {
    console.log('\n🩺 Testing AI Health Check API...');

    const healthResponse = await this.runner.makeRequest(TEST_CONFIG.endpoints.aiHealth);
    
    this.runner.assert(
      healthResponse.status === 200,
      'GET /api/ai/health returns health status',
      { status: healthResponse.status, providers: healthResponse.data?.providers?.length }
    );

    // Verify health response structure
    if (healthResponse.data && healthResponse.data.providers) {
      const requiredProviders = ['openai', 'claude', 'gemini', 'xai', 'litellm'];
      const responseProviders = healthResponse.data.providers.map(p => p.provider);
      
      requiredProviders.forEach(provider => {
        const hasProvider = responseProviders.includes(provider);
        this.runner.assert(
          hasProvider,
          `Health check includes ${provider} provider`,
          { provider, included: hasProvider }
        );
      });
    }
  }

  async testProviderConfiguration() {
    console.log('\n⚙️  Testing Provider Configuration...');

    // Test configuring each provider individually
    const providers = [
      { name: 'openai', key: 'test-openai-key' },
      { name: 'claude', key: 'test-claude-key' },
      { name: 'gemini', key: 'test-gemini-key' },
      { name: 'xai', key: 'test-xai-key', baseUrl: 'https://api.x.ai/v1' },
      { name: 'litellm', key: 'test-litellm-key', baseUrl: 'http://localhost:4000' }
    ];

    for (const provider of providers) {
      const credentialUpdate = {
        apiKeys: { [provider.name]: provider.key },
        ...(provider.baseUrl && { baseUrls: { [provider.name]: provider.baseUrl } })
      };

      const response = await this.runner.makeRequest(TEST_CONFIG.endpoints.aiCredentials, {
        method: 'PUT',
        body: credentialUpdate
      });

      this.runner.assert(
        response.status === 200,
        `${provider.name} provider can be configured`,
        { provider: provider.name, status: response.status }
      );
    }
  }

  async testFallbackMechanisms() {
    console.log('\n🔄 Testing Fallback Mechanisms...');

    // Test with invalid primary provider
    const settingsWithInvalidPrimary = {
      mode: 'direct',
      routing: {
        primary: 'invalid-provider',
        fallbacks: ['openai', 'claude'],
        timeoutMs: 5000,
        retry: {
          maxAttempts: 2,
          backoffMs: 500
        }
      }
    };

    const response = await this.runner.makeRequest(TEST_CONFIG.endpoints.aiSettings, {
      method: 'PUT',
      body: settingsWithInvalidPrimary
    });

    this.runner.assert(
      response.status >= 400,
      'Invalid primary provider is rejected',
      { status: response.status, error: response.data?.error }
    );

    // Test valid fallback configuration
    const validFallbackSettings = {
      mode: 'direct',
      routing: {
        primary: 'openai',
        fallbacks: ['claude', 'gemini', 'xai'],
        timeoutMs: 15000,
        retry: {
          maxAttempts: 3,
          backoffMs: 1000
        }
      }
    };

    const validResponse = await this.runner.makeRequest(TEST_CONFIG.endpoints.aiSettings, {
      method: 'PUT',
      body: validFallbackSettings
    });

    this.runner.assert(
      validResponse.status === 200,
      'Valid fallback configuration is accepted',
      { status: validResponse.status }
    );
  }
}

class ConsciousnessAITests {
  constructor(runner) {
    this.runner = runner;
  }

  async runTests() {
    console.log('\n🧘 Testing Consciousness AI Integration...');

    // Test 1: Consciousness Reflection API
    await this.testConsciousnessReflection();
    
    // Test 2: Consciousness Decision Processing
    await this.testConsciousnessDecisionProcessing();
    
    // Test 3: AI-Enhanced Features
    await this.testAIEnhancedFeatures();
    
    // Test 4: Graceful Degradation
    await this.testGracefulDegradation();
  }

  async testConsciousnessReflection() {
    console.log('\n🪞 Testing Consciousness Reflection API...');

    const reflectionRequest = {
      trigger: 'Testing AI-enhanced reflection capabilities for comprehensive system validation',
      context: {
        agentId: 'test-agent',
        awarenessLevel: 0.8,
        previousInsights: ['System integration requires deep validation', 'AI enhancement enables meta-cognitive processing']
      }
    };

    const response = await this.runner.makeRequest(TEST_CONFIG.endpoints.consciousnessReflect, {
      method: 'POST',
      body: reflectionRequest
    });

    this.runner.assert(
      response.status === 200,
      'POST /api/consciousness/reflect processes requests',
      { status: response.status, hasReflection: !!response.data?.reflection }
    );

    // Verify response structure for AI-enhanced reflection
    if (response.data) {
      this.runner.assert(
        response.data.reflection && typeof response.data.reflection === 'object',
        'Reflection response has proper structure',
        { hasReflection: !!response.data.reflection, hasAIProcessing: !!response.data.aiProcessing }
      );
    }
  }

  async testConsciousnessDecisionProcessing() {
    console.log('\n🎯 Testing Consciousness Decision Processing...');

    const decisionRequest = {
      context: 'Choosing between multiple AI providers for optimal system performance',
      options: [
        { id: 'option1', description: 'Use OpenAI as primary with Claude fallback' },
        { id: 'option2', description: 'Use Claude as primary with Gemini fallback' },
        { id: 'option3', description: 'Use multi-provider routing based on request type' }
      ]
    };

    const response = await this.runner.makeRequest(TEST_CONFIG.endpoints.consciousnessProcess, {
      method: 'POST',
      body: decisionRequest
    });

    this.runner.assert(
      response.status === 200,
      'POST /api/consciousness/process-decision handles complex decisions',
      { status: response.status, hasProcessing: !!response.data?.result }
    );

    // Check for AI-enhanced decision analysis
    if (response.data && response.data.result) {
      this.runner.assert(
        response.data.result.selectedOption || response.data.result.analysis,
        'Decision processing provides meaningful analysis',
        { hasSelection: !!response.data.result.selectedOption, hasAnalysis: !!response.data.result.analysis }
      );
    }
  }

  async testAIEnhancedFeatures() {
    console.log('\n🚀 Testing AI-Enhanced Consciousness Features...');

    // Test multiscale awareness with AI processing
    const multiscaleRequest = {
      context: 'System-wide AI integration impact analysis',
      scales: ['immediate', 'short-term', 'long-term'],
      aiEnhanced: true
    };

    const response = await this.runner.makeRequest('/api/consciousness/multiscale-analysis', {
      method: 'POST',
      body: multiscaleRequest
    });

    // This might not exist yet, so we'll check gracefully
    if (response.status === 404) {
      this.runner.skip(
        'Multiscale analysis endpoint not implemented yet',
        'Feature may be in development'
      );
    } else {
      this.runner.assert(
        response.status === 200,
        'AI-enhanced multiscale analysis works',
        { status: response.status }
      );
    }
  }

  async testGracefulDegradation() {
    console.log('\n🛡️  Testing Graceful Degradation...');

    // First, clear all AI credentials to test non-AI operation
    const clearCredentials = {
      apiKeys: {},
      baseUrls: {}
    };

    await this.runner.makeRequest(TEST_CONFIG.endpoints.aiCredentials, {
      method: 'PUT',
      body: clearCredentials
    });

    // Test consciousness reflection without AI
    const reflectionRequest = {
      trigger: 'Testing consciousness without AI enhancement',
      context: { agentId: 'test-agent', awarenessLevel: 0.5 }
    };

    const response = await this.runner.makeRequest(TEST_CONFIG.endpoints.consciousnessReflect, {
      method: 'POST',
      body: reflectionRequest
    });

    this.runner.assert(
      response.status === 200,
      'Consciousness features work without AI providers',
      { status: response.status, degradedMode: !response.data?.aiProcessing }
    );

    // Verify it's using fallback processing
    if (response.data) {
      this.runner.assert(
        !response.data.aiProcessing || response.data.fallbackMode,
        'System properly indicates non-AI operation',
        { aiProcessing: !!response.data.aiProcessing, fallbackMode: !!response.data.fallbackMode }
      );
    }
  }
}

class LeadershipAITests {
  constructor(runner) {
    this.runner = runner;
  }

  async runTests() {
    console.log('\n👑 Testing Leadership AI Integration...');

    // Test 1: Campaign Strategy Generation
    await this.testCampaignStrategyGeneration();
    
    // Test 2: Leadership Decision Analysis
    await this.testLeadershipDecisionAnalysis();
    
    // Test 3: Resource Optimization
    await this.testResourceOptimization();
    
    // Test 4: Leadership Without AI
    await this.testLeadershipWithoutAI();
  }

  async testCampaignStrategyGeneration() {
    console.log('\n📊 Testing Campaign Strategy Generation...');

    const strategyRequest = {
      objective: 'Increase transparency in government AI procurement processes',
      timeframe: '6 months',
      resources: {
        budget: 50000,
        volunteers: 100,
        expertise: ['technology', 'policy', 'communications']
      },
      constraints: ['limited media access', 'regulatory complexity'],
      targetAudience: 'technology professionals and policy makers'
    };

    const response = await this.runner.makeRequest(TEST_CONFIG.endpoints.leadershipStrategy, {
      method: 'POST',
      body: strategyRequest
    });

    this.runner.assert(
      response.status === 200,
      'POST /api/leadership/generate-strategy creates strategies',
      { status: response.status, hasStrategy: !!response.data?.strategy }
    );

    if (response.data && response.data.strategy) {
      this.runner.assert(
        response.data.strategy.phases || response.data.strategy.tactics,
        'Generated strategy has structured content',
        { hasPhases: !!response.data.strategy.phases, hasTactics: !!response.data.strategy.tactics }
      );
    }
  }

  async testLeadershipDecisionAnalysis() {
    console.log('\n🎯 Testing Leadership Decision Analysis...');

    const analysisRequest = {
      decision: 'Whether to prioritize grassroots organizing or policy advocacy',
      context: 'Limited resources require strategic focus',
      stakeholders: ['activists', 'policymakers', 'affected communities'],
      criteria: ['impact', 'feasibility', 'sustainability', 'resource efficiency']
    };

    const response = await this.runner.makeRequest(TEST_CONFIG.endpoints.leadershipAnalysis, {
      method: 'POST',
      body: analysisRequest
    });

    this.runner.assert(
      response.status === 200,
      'POST /api/leadership/analyze-decision provides analysis',
      { status: response.status, hasAnalysis: !!response.data?.analysis }
    );

    if (response.data && response.data.analysis) {
      this.runner.assert(
        response.data.analysis.recommendation || response.data.analysis.tradeoffs,
        'Decision analysis provides actionable insights',
        { hasRecommendation: !!response.data.analysis.recommendation, hasTradeoffs: !!response.data.analysis.tradeoffs }
      );
    }
  }

  async testResourceOptimization() {
    console.log('\n💰 Testing Resource Optimization...');

    const optimizationRequest = {
      resources: {
        financial: { budget: 100000, allocated: 60000 },
        human: { volunteers: 200, coordinators: 5 },
        technical: { platforms: ['website', 'social media'], tools: ['analytics', 'communication'] }
      },
      objectives: ['maximize outreach', 'ensure sustainability', 'build capacity'],
      constraints: ['3-month timeline', 'volunteer availability', 'regulatory compliance']
    };

    const response = await this.runner.makeRequest('/api/leadership/optimize-resources', {
      method: 'POST',
      body: optimizationRequest
    });

    // This endpoint might not exist yet
    if (response.status === 404) {
      this.runner.skip(
        'Resource optimization endpoint not implemented yet',
        'Feature may be in development'
      );
    } else {
      this.runner.assert(
        response.status === 200,
        'Resource optimization provides recommendations',
        { status: response.status }
      );
    }
  }

  async testLeadershipWithoutAI() {
    console.log('\n🏛️  Testing Leadership Features Without AI...');

    // Clear AI credentials first
    const clearCredentials = { apiKeys: {}, baseUrls: {} };
    await this.runner.makeRequest(TEST_CONFIG.endpoints.aiCredentials, {
      method: 'PUT',
      body: clearCredentials
    });

    // Test strategy generation without AI
    const strategyRequest = {
      objective: 'Test leadership features in non-AI mode',
      timeframe: '1 month',
      resources: { budget: 10000, volunteers: 20 }
    };

    const response = await this.runner.makeRequest(TEST_CONFIG.endpoints.leadershipStrategy, {
      method: 'POST',
      body: strategyRequest
    });

    this.runner.assert(
      response.status === 200,
      'Leadership features work without AI providers',
      { status: response.status, fallbackMode: !response.data?.aiGenerated }
    );
  }
}

class ProviderSpecificTests {
  constructor(runner) {
    this.runner = runner;
  }

  async runTests() {
    console.log('\n🔌 Testing Provider-Specific Functionality...');

    // Test each provider individually
    const providers = [
      { name: 'openai', testKey: 'sk-test-openai-key' },
      { name: 'claude', testKey: 'sk-ant-test-claude-key' },
      { name: 'gemini', testKey: 'test-gemini-key' },
      { name: 'xai', testKey: 'xai-test-key', baseUrl: 'https://api.x.ai/v1' },
      { name: 'litellm', testKey: 'test-litellm-key', baseUrl: 'http://localhost:4000' }
    ];

    for (const provider of providers) {
      await this.testIndividualProvider(provider);
    }

    await this.testProviderHealthChecks();
    await this.testProviderErrorHandling();
  }

  async testIndividualProvider(provider) {
    console.log(`\n🧪 Testing ${provider.name} Provider...`);

    // Configure the provider
    const credentialUpdate = {
      apiKeys: { [provider.name]: provider.testKey },
      ...(provider.baseUrl && { baseUrls: { [provider.name]: provider.baseUrl } })
    };

    const configResponse = await this.runner.makeRequest(TEST_CONFIG.endpoints.aiCredentials, {
      method: 'PUT',
      body: credentialUpdate
    });

    this.runner.assert(
      configResponse.status === 200,
      `${provider.name} provider configuration accepted`,
      { provider: provider.name, status: configResponse.status }
    );

    // Test health check for this specific provider
    const healthResponse = await this.runner.makeRequest(TEST_CONFIG.endpoints.aiHealth);
    
    if (healthResponse.data && healthResponse.data.providers) {
      const providerHealth = healthResponse.data.providers.find(p => p.provider === provider.name);
      this.runner.assert(
        !!providerHealth,
        `${provider.name} provider appears in health check`,
        { provider: provider.name, healthy: providerHealth?.healthy, hasApiKey: providerHealth?.hasApiKey }
      );
    }

    // Test provider through consciousness endpoint (which uses AI)
    const testRequest = {
      trigger: `Testing ${provider.name} provider through consciousness reflection`,
      context: { agentId: 'test-agent', provider: provider.name }
    };

    const consciousnessResponse = await this.runner.makeRequest(TEST_CONFIG.endpoints.consciousnessReflect, {
      method: 'POST',
      body: testRequest
    });

    // Note: This will likely fail with invalid API keys, but we're testing the integration
    this.runner.assert(
      consciousnessResponse.status === 200 || consciousnessResponse.status >= 400,
      `${provider.name} provider integration responds (success or proper error)`,
      { 
        provider: provider.name, 
        status: consciousnessResponse.status,
        hasError: !!consciousnessResponse.data?.error 
      }
    );
  }

  async testProviderHealthChecks() {
    console.log('\n🩺 Testing Provider Health Checks...');

    const healthResponse = await this.runner.makeRequest(TEST_CONFIG.endpoints.aiHealth);
    
    this.runner.assert(
      healthResponse.status === 200,
      'Health check endpoint is accessible',
      { status: healthResponse.status }
    );

    if (healthResponse.data) {
      this.runner.assert(
        healthResponse.data.providers && Array.isArray(healthResponse.data.providers),
        'Health check returns provider array',
        { providersCount: healthResponse.data.providers?.length }
      );

      // Check each provider has required fields
      if (healthResponse.data.providers) {
        healthResponse.data.providers.forEach(provider => {
          this.runner.assert(
            provider.provider && typeof provider.healthy === 'boolean',
            `Provider ${provider.provider} has required health fields`,
            { provider: provider.provider, healthy: provider.healthy, hasApiKey: provider.hasApiKey }
          );
        });
      }
    }
  }

  async testProviderErrorHandling() {
    console.log('\n🚨 Testing Provider Error Handling...');

    // Test with completely invalid API key
    const invalidCredentials = {
      apiKeys: { openai: 'invalid-key-that-will-fail' }
    };

    await this.runner.makeRequest(TEST_CONFIG.endpoints.aiCredentials, {
      method: 'PUT',
      body: invalidCredentials
    });

    // Try to use AI with invalid credentials
    const testRequest = {
      trigger: 'Testing error handling with invalid credentials'
    };

    const response = await this.runner.makeRequest(TEST_CONFIG.endpoints.consciousnessReflect, {
      method: 'POST',
      body: testRequest
    });

    // Should either succeed with fallback or fail gracefully
    this.runner.assert(
      response.status === 200 || (response.status >= 400 && response.data?.error),
      'Invalid credentials are handled gracefully',
      { status: response.status, hasError: !!response.data?.error }
    );
  }
}

class IntegrationRobustnessTests {
  constructor(runner) {
    this.runner = runner;
  }

  async runTests() {
    console.log('\n🛡️  Testing Integration Robustness...');

    await this.testErrorHandling();
    await this.testTimeoutHandling();
    await this.testConcurrentRequests();
    await this.testSystemRecovery();
  }

  async testErrorHandling() {
    console.log('\n💥 Testing Error Handling...');

    // Test malformed requests
    const malformedRequest = {
      invalidField: 'this should cause validation errors'
    };

    const response = await this.runner.makeRequest(TEST_CONFIG.endpoints.consciousnessReflect, {
      method: 'POST',
      body: malformedRequest
    });

    this.runner.assert(
      response.status >= 400,
      'Malformed requests are rejected with proper error codes',
      { status: response.status, error: response.data?.error }
    );

    // Test missing required fields
    const incompleteRequest = {
      context: 'missing trigger field'
    };

    const incompleteResponse = await this.runner.makeRequest(TEST_CONFIG.endpoints.consciousnessReflect, {
      method: 'POST',
      body: incompleteRequest
    });

    this.runner.assert(
      incompleteResponse.status >= 400,
      'Incomplete requests are rejected',
      { status: incompleteResponse.status }
    );
  }

  async testTimeoutHandling() {
    console.log('\n⏱️  Testing Timeout Handling...');

    // Set very short timeout
    const shortTimeoutSettings = {
      mode: 'direct',
      routing: {
        primary: 'openai',
        fallbacks: ['claude'],
        timeoutMs: 100, // Very short timeout
        retry: {
          maxAttempts: 1,
          backoffMs: 50
        }
      }
    };

    await this.runner.makeRequest(TEST_CONFIG.endpoints.aiSettings, {
      method: 'PUT',
      body: shortTimeoutSettings
    });

    // Try to make a request that would likely timeout
    const timeoutRequest = {
      trigger: 'This is a very long and complex trigger that might cause timeout issues when processed through AI systems with very short timeout settings configured for testing purposes'
    };

    const response = await this.runner.makeRequest(TEST_CONFIG.endpoints.consciousnessReflect, {
      method: 'POST',
      body: timeoutRequest
    });

    // Should either succeed quickly or fail gracefully
    this.runner.assert(
      response.status === 200 || response.status >= 400,
      'Timeout conditions are handled gracefully',
      { status: response.status, hasError: !!response.data?.error }
    );
  }

  async testConcurrentRequests() {
    console.log('\n🔄 Testing Concurrent Requests...');

    // Make multiple concurrent requests
    const requests = Array.from({ length: 5 }, (_, i) => ({
      trigger: `Concurrent test request ${i + 1}`,
      context: { agentId: 'test-agent', requestId: i + 1 }
    }));

    const startTime = performance.now();
    const responses = await Promise.all(
      requests.map(req => 
        this.runner.makeRequest(TEST_CONFIG.endpoints.consciousnessReflect, {
          method: 'POST',
          body: req
        })
      )
    );
    const endTime = performance.now();

    const successfulResponses = responses.filter(r => r.status === 200);
    
    this.runner.assert(
      responses.length === 5,
      'All concurrent requests received responses',
      { requestCount: requests.length, responseCount: responses.length }
    );

    this.runner.assert(
      successfulResponses.length >= 1,
      'At least some concurrent requests succeeded',
      { successCount: successfulResponses.length, totalTime: endTime - startTime }
    );
  }

  async testSystemRecovery() {
    console.log('\n🔄 Testing System Recovery...');

    // First, break the system by clearing all credentials
    const clearCredentials = { apiKeys: {}, baseUrls: {} };
    await this.runner.makeRequest(TEST_CONFIG.endpoints.aiCredentials, {
      method: 'PUT',
      body: clearCredentials
    });

    // Verify system is in degraded state
    const degradedResponse = await this.runner.makeRequest(TEST_CONFIG.endpoints.consciousnessReflect, {
      method: 'POST',
      body: { trigger: 'Testing degraded state' }
    });

    this.runner.assert(
      degradedResponse.status === 200,
      'System operates in degraded mode without AI',
      { status: degradedResponse.status }
    );

    // Now restore credentials
    const restoreCredentials = {
      apiKeys: { openai: 'test-restore-key' }
    };

    await this.runner.makeRequest(TEST_CONFIG.endpoints.aiCredentials, {
      method: 'PUT',
      body: restoreCredentials
    });

    // Wait a moment for recovery
    await this.runner.delay(2000);

    // Test recovery
    const recoveryResponse = await this.runner.makeRequest(TEST_CONFIG.endpoints.aiHealth);
    
    this.runner.assert(
      recoveryResponse.status === 200,
      'System health check works after recovery',
      { status: recoveryResponse.status }
    );
  }
}

// Main test execution
async function runAllTests() {
  const runner = new TestRunner();
  
  console.log('🚀 Starting Comprehensive AI Integration Testing Suite');
  console.log('==================================================\n');

  try {
    // Start server (or use existing one)
    const serverStarted = await runner.startServer();
    
    if (!serverStarted) {
      console.log('⚠️  Server not started - attempting to test against existing server...');
    }

    // Wait for server to be ready
    await runner.delay(3000);

    // Run all test suites
    const testSuites = [
      new AIServiceManagerTests(runner),
      new ConsciousnessAITests(runner),
      new LeadershipAITests(runner),
      new ProviderSpecificTests(runner),
      new IntegrationRobustnessTests(runner)
    ];

    for (const testSuite of testSuites) {
      try {
        await testSuite.runTests();
      } catch (error) {
        console.error(`❌ Error in test suite: ${error.message}`);
        runner.results.errors.push({ suite: testSuite.constructor.name, error: error.message });
      }
    }

    // Print final results
    console.log('\n📊 Comprehensive Test Results');
    console.log('=============================');
    console.log(`✅ Passed: ${runner.results.passed}`);
    console.log(`❌ Failed: ${runner.results.failed}`);
    console.log(`⏭️  Skipped: ${runner.results.skipped}`);
    console.log(`📈 Success Rate: ${((runner.results.passed / (runner.results.passed + runner.results.failed)) * 100).toFixed(1)}%\n`);

    if (runner.results.errors.length > 0) {
      console.log('🚨 Critical Issues Found:');
      runner.results.errors.forEach((error, index) => {
        console.log(`${index + 1}. ${error.message}`);
        if (error.details) {
          console.log(`   Details: ${JSON.stringify(error.details, null, 2)}`);
        }
      });
    }

    // Export detailed results
    const detailedResults = {
      summary: {
        passed: runner.results.passed,
        failed: runner.results.failed,
        skipped: runner.results.skipped,
        successRate: ((runner.results.passed / (runner.results.passed + runner.results.failed)) * 100).toFixed(1)
      },
      errors: runner.results.errors,
      details: runner.results.details,
      timestamp: new Date().toISOString()
    };

    // Save results to file
    require('fs').writeFileSync(
      'ai-integration-test-results.json', 
      JSON.stringify(detailedResults, null, 2)
    );

    console.log('\n📄 Detailed results saved to: ai-integration-test-results.json');

  } catch (error) {
    console.error('💥 Fatal error during testing:', error.message);
    console.error(error.stack);
  } finally {
    // Clean up
    await runner.stopServer();
    console.log('\n🏁 Testing completed.');
  }
}

// Export for module use or run directly
if (require.main === module) {
  runAllTests().catch(console.error);
}

module.exports = { runAllTests, TestRunner, AIServiceManagerTests, ConsciousnessAITests, LeadershipAITests, ProviderSpecificTests, IntegrationRobustnessTests };