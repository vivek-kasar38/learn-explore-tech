const axios = require('axios');

const SERVER_URL = process.env.SERVER_URL || 'http://jwt-auth-server:3001';

// Test credentials
const credentials = {
  valid: { username: 'admin', password: 'password123' },
  invalid: { username: 'admin', password: 'wrongpassword' }
};

let authToken = null;

async function testPublicEndpoint() {
  console.log('\n=== TEST 1: Public Endpoint (No Auth Required) ===');
  try {
    const response = await axios.get(`${SERVER_URL}/`);
    console.log('✓ Success! Response:', response.data);
  } catch (error) {
    console.error('✗ Error:', error.response?.data || error.message);
  }
}

async function testProtectedWithoutToken() {
  console.log('\n=== TEST 2: Protected Endpoint WITHOUT Token ===');
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

async function testLoginWithInvalidCredentials() {
  console.log('\n=== TEST 3: Login WITH Invalid Credentials ===');
  try {
    const response = await axios.post(`${SERVER_URL}/login`, credentials.invalid);
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

async function testLoginWithValidCredentials() {
  console.log('\n=== TEST 4: Login WITH Valid Credentials ===');
  try {
    console.log(`Attempting login with: ${credentials.valid.username}/${credentials.valid.password}`);
    const response = await axios.post(`${SERVER_URL}/login`, credentials.valid);
    console.log('✓ Login successful!');
    console.log('Token received:', response.data.token);
    console.log('User info:', response.data.user);
    console.log('Token expires in:', response.data.expiresIn);
    
    // Store the token for subsequent requests
    authToken = response.data.token;
    
    // Decode and display JWT parts (for educational purposes)
    const parts = authToken.split('.');
    console.log('\n--- JWT Token Structure ---');
    console.log('Header (part 1):', Buffer.from(parts[0], 'base64').toString());
    console.log('Payload (part 2):', Buffer.from(parts[1], 'base64').toString());
    console.log('Signature (part 3):', parts[2], '(used for verification)');
    
  } catch (error) {
    console.error('✗ Error:', error.response?.data || error.message);
  }
}

async function testProtectedWithValidToken() {
  console.log('\n=== TEST 5: Protected Endpoint WITH Valid Token ===');
  if (!authToken) {
    console.log('✗ No token available. Login first.');
    return;
  }
  
  try {
    const response = await axios.get(`${SERVER_URL}/protected`, {
      headers: {
        'Authorization': `Bearer ${authToken}`
      }
    });
    console.log('✓ Success! Response:', response.data);
  } catch (error) {
    console.error('✗ Error:', error.response?.data || error.message);
  }
}

async function testGetUserInfo() {
  console.log('\n=== TEST 6: Get User Info ===');
  if (!authToken) {
    console.log('✗ No token available. Login first.');
    return;
  }
  
  try {
    const response = await axios.get(`${SERVER_URL}/user`, {
      headers: {
        'Authorization': `Bearer ${authToken}`
      }
    });
    console.log('✓ Success! User Info:', response.data);
  } catch (error) {
    console.error('✗ Error:', error.response?.data || error.message);
  }
}

async function testLogout() {
  console.log('\n=== TEST 7: Logout (Revoke Token) ===');
  if (!authToken) {
    console.log('✗ No token available. Login first.');
    return;
  }
  
  try {
    const response = await axios.post(`${SERVER_URL}/logout`, {}, {
      headers: {
        'Authorization': `Bearer ${authToken}`
      }
    });
    console.log('✓ Logout successful!');
    console.log('Response:', response.data);
  } catch (error) {
    console.error('✗ Error:', error.response?.data || error.message);
  }
}

async function testProtectedAfterLogout() {
  console.log('\n=== TEST 8: Protected Endpoint AFTER Logout ===');
  if (!authToken) {
    console.log('✗ No token available.');
    return;
  }
  
  try {
    const response = await axios.get(`${SERVER_URL}/protected`, {
      headers: {
        'Authorization': `Bearer ${authToken}`
      }
    });
    console.log('✗ Unexpected success (token should be revoked):', response.data);
  } catch (error) {
    if (error.response?.status === 401) {
      console.log('✓ Correctly rejected! Token was revoked.');
      console.log('Response:', error.response.data);
    } else {
      console.error('✗ Unexpected error:', error.message);
    }
  }
}

async function runTests() {
  console.log('╔════════════════════════════════════════════════════════╗');
  console.log('║        JWT AUTHENTICATION CLIENT DEMO                  ║');
  console.log('╚════════════════════════════════════════════════════════╝');
  console.log(`\nConnecting to server: ${SERVER_URL}`);
  
  // Wait a bit for server to be ready
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  try {
    await testPublicEndpoint();
    await testProtectedWithoutToken();
    await testLoginWithInvalidCredentials();
    await testLoginWithValidCredentials();
    await testProtectedWithValidToken();
    await testGetUserInfo();
    await testLogout();
    await testProtectedAfterLogout();
    
    console.log('\n╔════════════════════════════════════════════════════════╗');
    console.log('║                   TESTS COMPLETED                      ║');
    console.log('╚════════════════════════════════════════════════════════╝');
    console.log('\n=== KEY LEARNINGS ===');
    console.log('1. JWT tokens are obtained by logging in with credentials');
    console.log('2. Token contains encoded user data (but is not encrypted)');
    console.log('3. Token is signed to prevent tampering');
    console.log('4. Credentials sent only once during login');
    console.log('5. Token sent with each subsequent request');
    console.log('6. Tokens can expire and can be revoked');
    console.log('7. Stateless - server doesn\'t need to store session');
    console.log('\n=== JWT vs Basic Auth ===');
    console.log('Basic Auth: Credentials with every request');
    console.log('JWT: Credentials once, token for subsequent requests');
    console.log('JWT is more secure and scalable for modern applications');
  } catch (error) {
    console.error('\nFatal error:', error.message);
  }
}

// Run tests
runTests();
