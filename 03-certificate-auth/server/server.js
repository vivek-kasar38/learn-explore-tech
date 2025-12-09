const https = require('https');
const fs = require('fs');
const express = require('express');
const app = express();
const PORT = process.env.PORT || 3002;

// Middleware
app.use(express.json());

// Public endpoint (accessible without certificate)
app.get('/', (req, res) => {
  res.json({
    message: 'Welcome to Certificate-based Authentication Server!',
    authMethod: 'mTLS (Mutual TLS)',
    info: 'This server requires client certificates for authentication',
    endpoints: {
      '/': 'Public endpoint (no cert required in this demo)',
      '/protected': 'Protected endpoint (requires valid client certificate)',
      '/user': 'Get certificate info (requires valid client certificate)'
    },
    note: 'In production mTLS, even the root endpoint would require a certificate'
  });
});

// Protected endpoint - requires valid client certificate
app.get('/protected', (req, res) => {
  const cert = req.socket.getPeerCertificate();
  
  if (!req.client.authorized) {
    return res.status(401).json({
      error: 'Client certificate required',
      details: 'Valid client certificate signed by trusted CA is required'
    });
  }

  res.json({
    message: `Hello ${cert.subject.CN}! You have successfully authenticated with your certificate.`,
    data: 'This is protected data accessible only with valid client certificate.',
    certificateInfo: {
      commonName: cert.subject.CN,
      organization: cert.subject.O,
      validFrom: cert.valid_from,
      validTo: cert.valid_to
    },
    timestamp: new Date().toISOString()
  });
});

// Certificate info endpoint
app.get('/user', (req, res) => {
  const cert = req.socket.getPeerCertificate();
  
  if (!req.client.authorized) {
    return res.status(401).json({
      error: 'Client certificate required'
    });
  }

  res.json({
    authenticated: true,
    authMethod: 'mTLS (Mutual TLS Certificate)',
    certificate: {
      subject: cert.subject,
      issuer: cert.issuer,
      validFrom: cert.valid_from,
      validTo: cert.valid_to,
      serialNumber: cert.serialNumber,
      fingerprint: cert.fingerprint
    },
    explanation: 'Certificate-based auth uses public key cryptography. Your identity is proven by your certificate signed by a trusted CA.',
    security: 'Much more secure than passwords - private key never transmitted over network'
  });
});

// HTTPS server options with client certificate verification
const httpsOptions = {
  key: fs.readFileSync('/app/certs/server-key.pem'),
  cert: fs.readFileSync('/app/certs/server-cert.pem'),
  ca: fs.readFileSync('/app/certs/ca-cert.pem'),
  requestCert: true,  // Request client certificate
  // NOTE: rejectUnauthorized is set to false for demo purposes to allow custom middleware
  // to handle authorization logic and provide educational error messages.
  // In production, set this to true for automatic TLS-level rejection.
  rejectUnauthorized: false  // We'll handle authorization in middleware for demo clarity
};

// Create HTTPS server
https.createServer(httpsOptions, app).listen(PORT, () => {
  console.log(`Certificate Auth Server running on https://localhost:${PORT}`);
  console.log('\n=== WHAT IS CERTIFICATE-BASED AUTHENTICATION (mTLS)? ===');
  console.log('mTLS (Mutual TLS) uses X.509 certificates for authentication.');
  console.log('- Both client and server have certificates');
  console.log('- Certificates are signed by a trusted CA (Certificate Authority)');
  console.log('- Private keys prove identity without transmitting secrets');
  console.log('- Server verifies client certificate during TLS handshake');
  console.log('\n=== WHY USE CERTIFICATE AUTHENTICATION? ===');
  console.log('✓ Most secure authentication method');
  console.log('✓ No passwords to steal or crack');
  console.log('✓ Private key never leaves client machine');
  console.log('✓ Perfect for machine-to-machine communication');
  console.log('✓ Can\'t be phished or brute-forced');
  console.log('✓ Built into TLS protocol');
  console.log('✗ More complex to set up and manage');
  console.log('✗ Certificate management overhead (renewal, revocation)');
  console.log('✗ Requires PKI (Public Key Infrastructure)');
  console.log('\n=== CERTIFICATE CHAIN OF TRUST ===');
  console.log('1. CA (Certificate Authority) signs certificates');
  console.log('2. Server trusts CA certificate');
  console.log('3. Client presents certificate signed by CA');
  console.log('4. Server verifies certificate against CA');
  console.log('5. If valid, client is authenticated');
  console.log('\n✓ Server started and ready for mTLS connections!\n');
});
