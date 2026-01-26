#!/usr/bin/env node

/**
 * Test script to verify backend API connectivity
 * Usage: node test-api.js [API_URL]
 * Example: node test-api.js https://your-backend.railway.app
 */

const API_URL = process.argv[2] || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

console.log('='.repeat(60));
console.log('YakGo API Connection Test');
console.log('='.repeat(60));
console.log(`Testing API: ${API_URL}`);
console.log('');

async function testEndpoint(name, url, options = {}) {
  try {
    console.log(`[${name}] Testing ${url}...`);
    const response = await fetch(url, options);
    const data = await response.json();

    if (response.ok) {
      console.log(`✅ [${name}] SUCCESS (${response.status})`);
      console.log(`   Response:`, JSON.stringify(data, null, 2));
      return { success: true, data };
    } else {
      console.log(`❌ [${name}] FAILED (${response.status})`);
      console.log(`   Error:`, JSON.stringify(data, null, 2));
      return { success: false, error: data };
    }
  } catch (error) {
    console.log(`❌ [${name}] ERROR`);
    console.log(`   ${error.message}`);
    return { success: false, error: error.message };
  } finally {
    console.log('');
  }
}

async function runTests() {
  const results = {
    passed: 0,
    failed: 0,
    total: 0,
  };

  // Test 1: Basic health check
  const health = await testEndpoint(
    'Health Check',
    `${API_URL}/health`
  );
  results.total++;
  if (health.success) results.passed++;
  else results.failed++;

  // Test 2: Detailed health check
  const detailedHealth = await testEndpoint(
    'Detailed Health',
    `${API_URL}/health/detailed`
  );
  results.total++;
  if (detailedHealth.success) results.passed++;
  else results.failed++;

  // Test 3: Try to get profile without auth (should fail with 401)
  console.log('[Auth Test] Testing without credentials (should fail)...');
  const noAuth = await testEndpoint(
    'Profile (No Auth)',
    `${API_URL}/api/users/profile`
  );
  results.total++;
  // This should fail with 401, which is expected
  if (!noAuth.success && noAuth.error?.error === 'No authorization data provided') {
    console.log('✅ [Auth Test] Correctly rejected unauthenticated request');
    results.passed++;
  } else {
    console.log('❌ [Auth Test] Expected 401 error');
    results.failed++;
  }
  console.log('');

  // Summary
  console.log('='.repeat(60));
  console.log('Test Summary');
  console.log('='.repeat(60));
  console.log(`Total tests: ${results.total}`);
  console.log(`Passed: ${results.passed} ✅`);
  console.log(`Failed: ${results.failed} ❌`);
  console.log('');

  if (health.success && detailedHealth.success) {
    console.log('🎉 Backend is running and responding correctly!');
    console.log('');
    console.log('Database status:', detailedHealth.data?.database?.connection ? '✅ Connected' : '❌ Not connected');
    console.log('Users in database:', detailedHealth.data?.database?.users || 0);
    console.log('');
  } else {
    console.log('⚠️  Backend has issues:');
    if (!health.success) {
      console.log('  - Basic health check failed');
      console.log('  - Make sure backend is running');
      console.log('  - Check if URL is correct');
    }
    console.log('');
  }

  // Return exit code
  process.exit(results.failed > 0 ? 1 : 0);
}

runTests().catch(error => {
  console.error('Test script failed:', error);
  process.exit(1);
});
