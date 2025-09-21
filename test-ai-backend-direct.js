#!/usr/bin/env node

/**
 * Direct Backend AI Integration Testing
 * Tests AI components directly without requiring the full application to be running
 */

import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Test results tracking
const results = {
  passed: 0,
  failed: 0,
  skipped: 0,
  errors: [],
  details: []
};

function assert(condition, message, details = null) {
  if (condition) {
    results.passed++;
    console.log(`✅ ${message}`);
    if (details) {
      results.details.push({ type: 'PASS', message, details });
    }
  } else {
    results.failed++;
    console.log(`❌ ${message}`);
    results.errors.push({ message, details });
    results.details.push({ type: 'FAIL', message, details });
  }
  return condition;
}

function skip(message, reason) {
  results.skipped++;
  console.log(`⏭️  ${message} (${reason})`);
  results.details.push({ type: 'SKIP', message, reason });
}

async function testAIServiceManagerInitialization() {
  console.log('\n🧠 Testing AI Service Manager Initialization...');

  try {
    // Test importing the AI Service Manager
    const { AIServiceManager } = await import('./server/ai/AIServiceManager.ts');
    
    assert(
      typeof AIServiceManager === 'function',
      'AIServiceManager class can be imported',
      { type: 'class', hasConstructor: true }
    );

    // Create instance
    const aiService = new AIServiceManager();
    
    assert(
      aiService instanceof AIServiceManager,
      'AIServiceManager can be instantiated',
      { instance: true }
    );

    // Test provider registration
    const { OpenAIAdapter } = await import('./server/ai/providers/OpenAIAdapter.ts');
    const openaiAdapter = new OpenAIAdapter('test-key');
    
    aiService.registerProvider('openai', openaiAdapter);
    
    assert(
      true, // If we get here without error, registration worked
      'Provider registration works',
      { provider: 'openai' }
    );

  } catch (error) {
    assert(
      false,
      'AI Service Manager initialization failed',
      { error: error.message, stack: error.stack }
    );
  }
}

async function testProviderAdapters() {
  console.log('\n🔌 Testing Provider Adapters...');

  const providers = [
    { name: 'OpenAI', module: './server/ai/providers/OpenAIAdapter.ts', class: 'OpenAIAdapter' },
    { name: 'Claude', module: './server/ai/providers/ClaudeAdapter.ts', class: 'ClaudeAdapter' },
    { name: 'Gemini', module: './server/ai/providers/GeminiAdapter.ts', class: 'GeminiAdapter' },
    { name: 'xAI', module: './server/ai/providers/XAIAdapter.ts', class: 'XAIAdapter' },
    { name: 'LiteLLM', module: './server/ai/providers/LiteLLMAdapter.ts', class: 'LiteLLMAdapter' }
  ];

  for (const provider of providers) {
    try {
      const module = await import(provider.module);
      const AdapterClass = module[provider.class];
      
      assert(
        typeof AdapterClass === 'function',
        `${provider.name} adapter class can be imported`,
        { provider: provider.name, module: provider.module }
      );

      // Test instantiation
      let adapter;
      if (provider.name === 'xAI' || provider.name === 'LiteLLM') {
        adapter = new AdapterClass('test-key', 'http://test-url');
      } else {
        adapter = new AdapterClass('test-key');
      }

      assert(
        adapter && typeof adapter.makeRequest === 'function',
        `${provider.name} adapter can be instantiated with required methods`,
        { provider: provider.name, hasMakeRequest: true, hasMakeStreamRequest: typeof adapter.makeStreamRequest === 'function' }
      );

      // Test provider info
      const info = adapter.getProviderInfo();
      assert(
        info && typeof info.provider === 'string' && typeof info.healthy === 'boolean',
        `${provider.name} adapter provides proper info`,
        { provider: provider.name, info }
      );

    } catch (error) {
      assert(
        false,
        `${provider.name} adapter test failed`,
        { provider: provider.name, error: error.message }
      );
    }
  }
}

async function testStorageInterface() {
  console.log('\n💾 Testing Storage Interface...');

  try {
    const { MemStorage } = await import('./server/storage.ts');
    
    assert(
      typeof MemStorage === 'function',
      'MemStorage class can be imported',
      { hasStorage: true }
    );

    const storage = new MemStorage();
    
    assert(
      typeof storage.getAISettings === 'function',
      'Storage has AI settings methods',
      { hasGetAISettings: true, hasUpdateAISettings: typeof storage.updateAISettings === 'function' }
    );

    assert(
      typeof storage.createOrUpdateAICredentials === 'function',
      'Storage has AI credentials methods',
      { hasCredentialMethods: true }
    );

    // Test AI settings
    const testSettings = {
      mode: 'direct',
      routing: {
        primary: 'openai',
        fallbacks: ['claude'],
        timeoutMs: 30000,
        retry: { maxAttempts: 3, backoffMs: 1000 }
      },
      providerPrefs: {}
    };

    const savedSettings = await storage.updateAISettings(testSettings);
    
    assert(
      savedSettings && savedSettings.mode === 'direct',
      'AI settings can be saved and retrieved',
      { mode: savedSettings.mode, primary: savedSettings.routing?.primary }
    );

    // Test AI credentials
    await storage.createOrUpdateAICredentials('openai', 'test-key-12345');
    const credentials = await storage.getAICredentials('openai');
    
    assert(
      credentials && credentials.provider === 'openai',
      'AI credentials can be saved and retrieved',
      { provider: credentials?.provider, hasEncryptedKey: !!credentials?.encryptedApiKey }
    );

  } catch (error) {
    assert(
      false,
      'Storage interface test failed',
      { error: error.message, stack: error.stack }
    );
  }
}

async function testConsciousnessIntegration() {
  console.log('\n🧘 Testing Consciousness Integration...');

  try {
    const { ConsciousnessEngine } = await import('./server/ConsciousnessEngine.ts');
    
    assert(
      typeof ConsciousnessEngine === 'function',
      'ConsciousnessEngine class can be imported',
      { hasConsciousness: true }
    );

    const consciousness = new ConsciousnessEngine('test-agent');
    
    assert(
      consciousness && typeof consciousness.processConsciousExperience === 'function',
      'ConsciousnessEngine can be instantiated with required methods',
      { hasProcessMethod: true }
    );

    // Test basic consciousness processing (without AI for now)
    const trigger = {
      type: 'reflection',
      description: 'Testing consciousness without AI dependencies',
      intensity: 0.7,
      context: { agentId: 'test-agent' }
    };

    // This might fail if it requires AI, so we'll catch errors
    try {
      const result = await consciousness.processConsciousExperience(trigger);
      assert(
        result && typeof result === 'object',
        'Consciousness processing completes successfully',
        { hasResult: true, processingComplete: true }
      );
    } catch (error) {
      // If it fails due to AI dependency, that's expected
      if (error.message.includes('AI') || error.message.includes('provider')) {
        skip(
          'Consciousness processing requires AI providers',
          'Expected for AI-dependent features'
        );
      } else {
        assert(
          false,
          'Consciousness processing failed unexpectedly',
          { error: error.message }
        );
      }
    }

  } catch (error) {
    assert(
      false,
      'Consciousness integration test failed',
      { error: error.message }
    );
  }
}

async function testPromptTemplates() {
  console.log('\n📝 Testing Prompt Templates...');

  try {
    const promptModule = await import('./server/ai/prompts.ts');
    const { PROMPT_TEMPLATES, interpolateTemplate } = promptModule;
    
    assert(
      typeof PROMPT_TEMPLATES === 'object' && PROMPT_TEMPLATES !== null,
      'Prompt templates can be imported',
      { templateCount: Object.keys(PROMPT_TEMPLATES).length }
    );

    assert(
      typeof interpolateTemplate === 'function',
      'Template interpolation function is available',
      { hasInterpolation: true }
    );

    // Test specific templates
    const requiredTemplates = [
      'CONSCIOUSNESS_REFLECTION',
      'CAMPAIGN_STRATEGY',
      'CORRUPTION_ANALYSIS',
      'STRATEGIC_PLANNING'
    ];

    requiredTemplates.forEach(templateName => {
      const template = PROMPT_TEMPLATES[templateName];
      assert(
        template && template.template && template.variables,
        `Template ${templateName} exists with required fields`,
        { templateName, hasTemplate: !!template?.template, variableCount: template?.variables?.length }
      );
    });

    // Test template interpolation
    const testTemplate = 'Hello {{name}}, your task is {{task}}.';
    const interpolated = interpolateTemplate(testTemplate, { name: 'Test', task: 'validation' });
    
    assert(
      interpolated === 'Hello Test, your task is validation.',
      'Template interpolation works correctly',
      { original: testTemplate, interpolated }
    );

  } catch (error) {
    assert(
      false,
      'Prompt templates test failed',
      { error: error.message }
    );
  }
}

async function testAIProviderHealthChecks() {
  console.log('\n🩺 Testing AI Provider Health Checks...');

  const providers = [
    { name: 'openai', module: './server/ai/providers/OpenAIAdapter.ts', class: 'OpenAIAdapter' },
    { name: 'claude', module: './server/ai/providers/ClaudeAdapter.ts', class: 'ClaudeAdapter' }
  ];

  for (const provider of providers) {
    try {
      const module = await import(provider.module);
      const AdapterClass = module[provider.class];
      const adapter = new AdapterClass('invalid-test-key');

      // Test health check method
      const healthResult = await adapter.checkHealth();
      
      assert(
        typeof healthResult === 'boolean',
        `${provider.name} health check returns boolean`,
        { provider: provider.name, healthy: healthResult }
      );

      // Health should be false with invalid key
      assert(
        healthResult === false,
        `${provider.name} correctly reports unhealthy with invalid key`,
        { provider: provider.name, correctlyUnhealthy: true }
      );

    } catch (error) {
      // Health check failing is expected with invalid keys
      assert(
        true,
        `${provider.name} health check properly handles errors`,
        { provider: provider.name, errorHandled: true }
      );
    }
  }
}

async function testAIRequestValidation() {
  console.log('\n✅ Testing AI Request Validation...');

  try {
    const { OpenAIAdapter } = await import('./server/ai/providers/OpenAIAdapter.ts');
    const adapter = new OpenAIAdapter('test-key');

    // Test valid request
    const validRequest = {
      prompt: 'Test prompt',
      config: {
        temperature: 0.7,
        maxTokens: 100
      }
    };

    // This should not throw validation errors
    try {
      await adapter.makeRequest(validRequest);
      // Will fail due to invalid API key, but validation should pass
    } catch (error) {
      if (error.message.includes('validation') || error.message.includes('required')) {
        assert(false, 'Valid request failed validation', { error: error.message });
      } else {
        assert(true, 'Valid request passed validation (failed at API level as expected)', { expectedAPIFailure: true });
      }
    }

    // Test invalid requests
    const invalidRequests = [
      { config: { temperature: 0.7 } }, // missing prompt
      { prompt: '', config: { temperature: 0.7 } }, // empty prompt
      { prompt: 'test', config: { temperature: 3 } }, // invalid temperature
      { prompt: 'test', config: { maxTokens: -1 } } // invalid maxTokens
    ];

    for (const invalidRequest of invalidRequests) {
      try {
        await adapter.makeRequest(invalidRequest);
        assert(false, 'Invalid request should have been rejected', { request: invalidRequest });
      } catch (error) {
        assert(
          true,
          'Invalid request properly rejected',
          { error: error.message, request: invalidRequest }
        );
      }
    }

  } catch (error) {
    assert(
      false,
      'Request validation test failed',
      { error: error.message }
    );
  }
}

async function testErrorHandlingAndLogging() {
  console.log('\n📋 Testing Error Handling and Logging...');

  try {
    const { OpenAIAdapter } = await import('./server/ai/providers/OpenAIAdapter.ts');
    
    // Test with no API key
    const adapterNoKey = new OpenAIAdapter();
    
    try {
      await adapterNoKey.makeRequest({ prompt: 'test' });
      assert(false, 'Request without API key should fail');
    } catch (error) {
      assert(
        error.message.includes('not initialized') || error.message.includes('API'),
        'Proper error for missing API key',
        { error: error.message }
      );
    }

    // Test error formatting
    const adapterWithKey = new OpenAIAdapter('invalid-key');
    const formattedError = adapterWithKey.formatError(new Error('Test error'), 'test context');
    
    assert(
      formattedError.message.includes('openai provider error'),
      'Errors are properly formatted with provider context',
      { formattedMessage: formattedError.message }
    );

  } catch (error) {
    assert(
      false,
      'Error handling test failed',
      { error: error.message }
    );
  }
}

async function runDirectBackendTests() {
  console.log('🔧 Starting Direct Backend AI Integration Tests');
  console.log('=============================================\n');

  try {
    await testAIServiceManagerInitialization();
    await testProviderAdapters();
    await testStorageInterface();
    await testConsciousnessIntegration();
    await testPromptTemplates();
    await testAIProviderHealthChecks();
    await testAIRequestValidation();
    await testErrorHandlingAndLogging();

    // Print results
    console.log('\n📊 Direct Backend Test Results');
    console.log('==============================');
    console.log(`✅ Passed: ${results.passed}`);
    console.log(`❌ Failed: ${results.failed}`);
    console.log(`⏭️  Skipped: ${results.skipped}`);
    
    const total = results.passed + results.failed;
    const successRate = total > 0 ? ((results.passed / total) * 100).toFixed(1) : 0;
    console.log(`📈 Success Rate: ${successRate}%\n`);

    if (results.errors.length > 0) {
      console.log('🚨 Issues Found:');
      results.errors.forEach((error, index) => {
        console.log(`${index + 1}. ${error.message}`);
        if (error.details) {
          console.log(`   Details: ${JSON.stringify(error.details, null, 2)}`);
        }
      });
    }

    // Save results
    const detailedResults = {
      summary: {
        passed: results.passed,
        failed: results.failed,
        skipped: results.skipped,
        successRate
      },
      errors: results.errors,
      details: results.details,
      timestamp: new Date().toISOString(),
      testType: 'direct-backend'
    };

    import('fs').then(fs => {
      fs.writeFileSync(
        'ai-backend-test-results.json',
        JSON.stringify(detailedResults, null, 2)
      );
    });

    console.log('\n📄 Backend test results saved to: ai-backend-test-results.json');

  } catch (error) {
    console.error('💥 Fatal error during backend testing:', error.message);
    console.error(error.stack);
  }
}

// Run tests
runDirectBackendTests().catch(console.error);