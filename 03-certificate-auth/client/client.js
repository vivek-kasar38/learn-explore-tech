const https = require('https');
const fs = require('fs');
const axios = require('axios');

const SERVER_URL = process.env.SERVER_URL || 'https://cert-auth-server:3002';

// Configure axios to use client certificate
const httpsAgent = new https.Agent({
  cert: fs.readFileSync('/app/certs/client-cert.pem'),
  key: fs.readFileSync('/app/certs/client-key.pem'),
  ca: fs.readFileSync('/app/certs/ca-cert.pem'),
  rejectUnauthorized: true  // Verify server certificate
});

const axiosWithCert = axios.create({
  httpsAgent: httpsAgent
});

const axiosWithoutCert = axios.create({
  httpsAgent: new https.Agent({
    ca: fs.readFileSync('/app/certs/ca-cert.pem'),
    rejectUnauthorized: true
  })
});

async function testPublicEndpoint() {
  console.log('\n=== TEST 1: Public Endpoint (Connecting with Certificate) ===');
  try {
    const response = await axiosWithCert.get(`${SERVER_URL}/`);
    console.log('✓ Success! Response:', response.data);
  } catch (error) {
    console.error('✗ Error:', error.response?.data || error.message);
  }
}

async function testProtectedWithoutCertificate() {
  console.log('\n=== TEST 2: Protected Endpoint WITHOUT Client Certificate ===');
  try {
    const response = await axiosWithoutCert.get(`${SERVER_URL}/protected`);
    console.log('✗ Unexpected success (should require certificate):', response.data);
  } catch (error) {
    if (error.code === 'ECONNRESET' || error.message.includes('socket hang up')) {
      console.log('✓ Connection rejected! Server requires client certificate.');
      console.log('This is expected - server closed connection during TLS handshake');
    } else if (error.response?.status === 401) {
      console.log('✓ Correctly rejected! Status:', error.response.status);
      console.log('Response:', error.response.data);
    } else {
      console.error('✗ Error:', error.message);
    }
  }
}

async function testProtectedWithCertificate() {
  console.log('\n=== TEST 3: Protected Endpoint WITH Valid Certificate ===');
  try {
    console.log('Presenting client certificate to server...');
    const response = await axiosWithCert.get(`${SERVER_URL}/protected`);
    console.log('✓ Success! Authentication via certificate worked!');
    console.log('Response:', response.data);
  } catch (error) {
    console.error('✗ Error:', error.response?.data || error.message);
  }
}

async function testGetCertificateInfo() {
  console.log('\n=== TEST 4: Get Certificate Information ===');
  try {
    const response = await axiosWithCert.get(`${SERVER_URL}/user`);
    console.log('✓ Success! Certificate details:');
    console.log(JSON.stringify(response.data, null, 2));
  } catch (error) {
    console.error('✗ Error:', error.response?.data || error.message);
  }
}

async function displayCertificateInfo() {
  console.log('\n=== CLIENT CERTIFICATE DETAILS ===');
  try {
    const cert = fs.readFileSync('/app/certs/client-cert.pem', 'utf8');
    console.log('Certificate loaded successfully');
    console.log('Location: /app/certs/client-cert.pem');
    console.log('\nThis certificate proves our identity to the server.');
    console.log('The server verifies it was signed by the trusted CA.');
  } catch (error) {
    console.error('Could not read certificate:', error.message);
  }
}

async function runTests() {
  console.log('╔════════════════════════════════════════════════════════╗');
  console.log('║    CERTIFICATE-BASED AUTHENTICATION CLIENT DEMO       ║');
  console.log('║                  (mTLS - Mutual TLS)                   ║');
  console.log('╚════════════════════════════════════════════════════════╝');
  console.log(`\nConnecting to server: ${SERVER_URL}`);
  
  await displayCertificateInfo();
  
  // Wait a bit for server to be ready
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  try {
    await testPublicEndpoint();
    await testProtectedWithoutCertificate();
    await testProtectedWithCertificate();
    await testGetCertificateInfo();
    
    console.log('\n╔════════════════════════════════════════════════════════╗');
    console.log('║                   TESTS COMPLETED                      ║');
    console.log('╚════════════════════════════════════════════════════════╝');
    console.log('\n=== KEY LEARNINGS ===');
    console.log('1. Certificate authentication uses public key cryptography');
    console.log('2. Client certificate proves identity to server');
    console.log('3. Private key never transmitted - only used for signing');
    console.log('4. Server verifies certificate against trusted CA');
    console.log('5. Most secure auth method - no passwords involved');
    console.log('6. Perfect for machine-to-machine communication');
    console.log('7. TLS handshake handles authentication automatically');
    console.log('\n=== COMPARISON OF ALL THREE METHODS ===');
    console.log('\n┌─────────────────┬──────────────┬──────────────┬─────────────────┐');
    console.log('│ Feature         │ Basic Auth   │ JWT          │ Certificate     │');
    console.log('├─────────────────┼──────────────┼──────────────┼─────────────────┤');
    console.log('│ Security        │ Low-Medium   │ Medium-High  │ Very High       │');
    console.log('│ Complexity      │ Very Simple  │ Simple       │ Complex         │');
    console.log('│ Credentials     │ Every req    │ Login only   │ Never sent      │');
    console.log('│ Stateless       │ Yes          │ Yes          │ Yes             │');
    console.log('│ Session Storage │ No           │ No           │ No              │');
    console.log('│ Use Case        │ Internal API │ Web/Mobile   │ Service-to-Svc  │');
    console.log('│ Revocation      │ Immediate    │ Complex      │ CRL/OCSP        │');
    console.log('└─────────────────┴──────────────┴──────────────┴─────────────────┘');
    console.log('\n🎓 You now understand three fundamental authentication methods!');
  } catch (error) {
    console.error('\nFatal error:', error.message);
  }
}

// Run tests
runTests();
