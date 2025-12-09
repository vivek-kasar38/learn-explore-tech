const axios = require('axios');

const SERVER_URL = process.env.SERVER_URL || 'http://simple-auth-server:3000';

// Test credentials
const credentials = {
  valid: { username: 'admin', password: 'password123' },
  invalid: { username: 'admin', password: 'wrongpassword' }
};

function createBasicAuthHeader(username, password) {
  const credentials = `${username}:${password}`;
  const base64Credentials = Buffer.from(credentials).toString('base64');
  return `Basic ${base64Credentials}`;
}

async function testPublicEndpoint() {
  console.log('\n=== TEST 1: Public Endpoint (No Auth Required) ===');
  try {
    const response = await axios.get(`${SERVER_URL}/`);
    console.log('✓ Success! Response:', response.data);
  } catch (error) {
    console.error('✗ Error:', error.response?.data || error.message);
  }
}

async function testProtectedEndpointWithoutAuth() {
  console.log('\n=== TEST 2: Protected Endpoint WITHOUT Auth ===');
  try {
    const response = await axios.get(`${SERVER_URL}/protected`);
    console.log('✗ Unexpected success:', response.data);
  } catch (error) {
    if (error.response?.status === 401) {
      console.log('✓ Correctly rejected! Status:', error.response.status);
      console.log('Response:', error.response.data);
    } else {
      console.error('✗ Unexpected error:', error.message);
    }
  }
}

async function testProtectedEndpointWithValidAuth() {
  console.log('\n=== TEST 3: Protected Endpoint WITH Valid Auth ===');
  try {
    const authHeader = createBasicAuthHeader(
      credentials.valid.username,
      credentials.valid.password
    );
    console.log(`Using credentials: ${credentials.valid.username}/${credentials.valid.password}`);
    console.log(`Auth header: Authorization: ${authHeader}`);
    
    const response = await axios.get(`${SERVER_URL}/protected`, {
      headers: {
        'Authorization': authHeader
      }
    });
    console.log('✓ Success! Response:', response.data);
  } catch (error) {
    console.error('✗ Error:', error.response?.data || error.message);
  }
}

async function testProtectedEndpointWithInvalidAuth() {
  console.log('\n=== TEST 4: Protected Endpoint WITH Invalid Auth ===');
  try {
    const authHeader = createBasicAuthHeader(
      credentials.invalid.username,
      credentials.invalid.password
    );
    console.log(`Using credentials: ${credentials.invalid.username}/${credentials.invalid.password}`);
    
    const response = await axios.get(`${SERVER_URL}/protected`, {
      headers: {
        'Authorization': authHeader
      }
    });
    console.log('✗ Unexpected success:', response.data);
  } catch (error) {
    if (error.response?.status === 401) {
      console.log('✓ Correctly rejected! Status:', error.response.status);
      console.log('Response:', error.response.data);
    } else {
      console.error('✗ Unexpected error:', error.message);
    }
  }
}

async function testUserInfo() {
  console.log('\n=== TEST 5: Get User Info ===');
  try {
    const authHeader = createBasicAuthHeader(
      credentials.valid.username,
      credentials.valid.password
    );
    
    const response = await axios.get(`${SERVER_URL}/info`, {
      headers: {
        'Authorization': authHeader
      }
    });
    console.log('✓ Success! User Info:', response.data);
  } catch (error) {
    console.error('✗ Error:', error.response?.data || error.message);
  }
}

async function runTests() {
  console.log('╔════════════════════════════════════════════════════════╗');
  console.log('║     SIMPLE BASIC AUTHENTICATION CLIENT DEMO           ║');
  console.log('╚════════════════════════════════════════════════════════╝');
  console.log(`\nConnecting to server: ${SERVER_URL}`);
  
  // Wait a bit for server to be ready
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  try {
    await testPublicEndpoint();
    await testProtectedEndpointWithoutAuth();
    await testProtectedEndpointWithValidAuth();
    await testProtectedEndpointWithInvalidAuth();
    await testUserInfo();
    
    console.log('\n╔════════════════════════════════════════════════════════╗');
    console.log('║                   TESTS COMPLETED                      ║');
    console.log('╚════════════════════════════════════════════════════════╝');
    console.log('\n=== KEY LEARNINGS ===');
    console.log('1. Basic Auth encodes username:password in base64');
    console.log('2. Credentials are sent with EVERY request');
    console.log('3. Simple to implement but less secure');
    console.log('4. Should always use HTTPS in production');
    console.log('5. No session management - stateless authentication');
  } catch (error) {
    console.error('\nFatal error:', error.message);
  }
}

// Run tests
runTests();
