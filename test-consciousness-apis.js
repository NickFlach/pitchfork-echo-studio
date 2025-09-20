// Comprehensive consciousness system testing
const { spawn } = require('child_process');
const http = require('http');

// Test configuration
const API_BASE = 'http://localhost:3001';
const AGENT_ID = 'default-agent';

// Test results tracking
let testResults = {
  total: 0,
  passed: 0,
  failed: 0,
  errors: []
};

// Helper function to make HTTP requests
function makeRequest(path, options = {}) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, API_BASE);
    const requestOptions = {
      hostname: url.hostname,
      port: url.port,
      path: url.pathname + url.search,
      method: options.method || 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      }
    };

    const req = http.request(requestOptions, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const parsedData = JSON.parse(data);
          resolve({ statusCode: res.statusCode, data: parsedData });
        } catch (e) {
          resolve({ statusCode: res.statusCode, data: data });
        }
      });
    });

    req.on('error', reject);
    
    if (options.body) {
      req.write(options.body);
    }
    
    req.end();
  });
}

// Test runner
async function runTest(name, testFn) {
  testResults.total++;
  console.log(`\n🧪 Testing: ${name}`);
  
  try {
    const result = await testFn();
    if (result.success) {
      testResults.passed++;
      console.log(`✅ ${name}: PASSED`);
      if (result.details) console.log(`   Details: ${result.details}`);
    } else {
      testResults.failed++;
      console.log(`❌ ${name}: FAILED - ${result.error}`);
      testResults.errors.push({ test: name, error: result.error });
    }
  } catch (error) {
    testResults.failed++;
    console.log(`💥 ${name}: ERROR - ${error.message}`);
    testResults.errors.push({ test: name, error: error.message });
  }
}

// Individual test functions
async function testHealthEndpoint() {
  const response = await makeRequest('/health');
  return {
    success: response.statusCode === 200 && response.data.status === 'OK',
    details: `Status: ${response.statusCode}, Response: ${JSON.stringify(response.data)}`,
    error: response.statusCode !== 200 ? `Expected 200, got ${response.statusCode}` : null
  };
}

async function testConsciousnessStatesRetrieval() {
  const response = await makeRequest(`/api/consciousness-states/${AGENT_ID}`);
  return {
    success: response.statusCode === 200 && Array.isArray(response.data),
    details: `Found ${response.data?.length || 0} consciousness states`,
    error: response.statusCode !== 200 ? `Expected 200, got ${response.statusCode}` : 
           !Array.isArray(response.data) ? 'Response is not an array' : null
  };
}

async function testConsciousnessStateCreation() {
  const newState = {
    agentId: AGENT_ID,
    state: 'testing',
    awarenessLevel: 0.8,
    recursionDepth: 1,
    emergentInsights: ['Test insight'],
    activePatternsRecognized: ['test-pattern'],
    orderChaosBalance: 0.5,
    connectedStates: [],
    contextLayers: ['test-layer'],
    questioningLoops: [],
    transitionTrigger: 'integration-test'
  };

  const response = await makeRequest('/api/consciousness-states', {
    method: 'POST',
    body: JSON.stringify(newState)
  });

  return {
    success: response.statusCode === 201 && response.data.id,
    details: `Created state with ID: ${response.data?.id}`,
    error: response.statusCode !== 201 ? `Expected 201, got ${response.statusCode}` : null
  };
}

async function testDecisionRecordsRetrieval() {
  const response = await makeRequest(`/api/decisions/${AGENT_ID}`);
  return {
    success: response.statusCode === 200 && Array.isArray(response.data),
    details: `Found ${response.data?.length || 0} decision records`,
    error: response.statusCode !== 200 ? `Expected 200, got ${response.statusCode}` : 
           !Array.isArray(response.data) ? 'Response is not an array' : null
  };
}

async function testReflectionLogsRetrieval() {
  const response = await makeRequest(`/api/reflections/${AGENT_ID}`);
  return {
    success: response.statusCode === 200 && Array.isArray(response.data),
    details: `Found ${response.data?.length || 0} reflection logs`,
    error: response.statusCode !== 200 ? `Expected 200, got ${response.statusCode}` : null
  };
}

async function testLearningCyclesRetrieval() {
  const response = await makeRequest(`/api/learning-cycles/${AGENT_ID}`);
  return {
    success: response.statusCode === 200 && Array.isArray(response.data),
    details: `Found ${response.data?.length || 0} learning cycles`,
    error: response.statusCode !== 200 ? `Expected 200, got ${response.statusCode}` : null
  };
}

async function testComplexityMapsRetrieval() {
  const response = await makeRequest('/api/complexity-maps');
  return {
    success: response.statusCode === 200 && Array.isArray(response.data),
    details: `Found ${response.data?.length || 0} complexity maps`,
    error: response.statusCode !== 200 ? `Expected 200, got ${response.statusCode}` : null
  };
}

async function testConsciousnessProcessDecision() {
  const decisionData = {
    context: 'Integration test decision processing',
    options: [
      { id: 'option1', description: 'Test option 1' },
      { id: 'option2', description: 'Test option 2' }
    ]
  };

  const response = await makeRequest('/api/consciousness/process-decision', {
    method: 'POST',
    body: JSON.stringify(decisionData)
  });

  return {
    success: response.statusCode === 200,
    details: `Decision processing result: ${response.statusCode}`,
    error: response.statusCode !== 200 ? `Expected 200, got ${response.statusCode}` : null
  };
}

async function testConsciousnessReflect() {
  const reflectionData = {
    trigger: 'Integration test reflection trigger'
  };

  const response = await makeRequest('/api/consciousness/reflect', {
    method: 'POST',
    body: JSON.stringify(reflectionData)
  });

  return {
    success: response.statusCode === 200,
    details: `Reflection processing result: ${response.statusCode}`,
    error: response.statusCode !== 200 ? `Expected 200, got ${response.statusCode}` : null
  };
}

async function testMultiscaleDemo() {
  const response = await makeRequest('/api/demo/multiscale-decision-demo', {
    method: 'POST',
    body: JSON.stringify({})
  });

  return {
    success: response.statusCode === 200,
    details: `Demo execution result: ${response.statusCode}`,
    error: response.statusCode !== 200 ? `Expected 200, got ${response.statusCode}` : null
  };
}

// Start backend server and run tests
async function startServerAndTest() {
  console.log('🚀 Starting consciousness API integration tests...\n');
  
  // Start the backend server
  console.log('📡 Starting backend server...');
  const serverProcess = spawn('npx', ['tsx', 'app.ts'], { 
    cwd: './server',
    detached: false,
    stdio: ['ignore', 'pipe', 'pipe']
  });

  // Wait for server to start
  await new Promise(resolve => setTimeout(resolve, 3000));

  // Run all tests
  await runTest('Health Endpoint', testHealthEndpoint);
  await runTest('Consciousness States Retrieval', testConsciousnessStatesRetrieval);
  await runTest('Consciousness State Creation', testConsciousnessStateCreation);
  await runTest('Decision Records Retrieval', testDecisionRecordsRetrieval);
  await runTest('Reflection Logs Retrieval', testReflectionLogsRetrieval);
  await runTest('Learning Cycles Retrieval', testLearningCyclesRetrieval);
  await runTest('Complexity Maps Retrieval', testComplexityMapsRetrieval);
  await runTest('Consciousness Process Decision', testConsciousnessProcessDecision);
  await runTest('Consciousness Reflect', testConsciousnessReflect);
  await runTest('Multiscale Demo', testMultiscaleDemo);

  // Clean up
  serverProcess.kill();

  // Print results
  console.log('\n' + '='.repeat(60));
  console.log('🎯 CONSCIOUSNESS API INTEGRATION TEST RESULTS');
  console.log('='.repeat(60));
  console.log(`📊 Total Tests: ${testResults.total}`);
  console.log(`✅ Passed: ${testResults.passed}`);
  console.log(`❌ Failed: ${testResults.failed}`);
  console.log(`📈 Success Rate: ${((testResults.passed / testResults.total) * 100).toFixed(1)}%`);

  if (testResults.errors.length > 0) {
    console.log('\n🔍 Detailed Error Report:');
    testResults.errors.forEach((error, index) => {
      console.log(`${index + 1}. ${error.test}: ${error.error}`);
    });
  }

  const success = testResults.failed === 0;
  console.log(success ? '\n🎉 All tests passed! Consciousness APIs are fully functional.' : '\n⚠️  Some tests failed. Review errors above.');
  
  return success;
}

// Run if called directly
if (require.main === module) {
  startServerAndTest().catch(console.error);
}

module.exports = { startServerAndTest, testResults };