const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware to parse JSON
app.use(express.json());

// Simple in-memory user store (for demo purposes only)
const users = {
  'admin': 'password123',
  'user': 'mypassword'
};

// Middleware to check Basic Authentication
function basicAuth(req, res, next) {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Basic ')) {
    res.setHeader('WWW-Authenticate', 'Basic realm="Simple Auth Demo"');
    return res.status(401).json({ 
      error: 'Authentication required',
      hint: 'Use Basic Authentication with username:password'
    });
  }

  // Decode the base64 encoded credentials
  const base64Credentials = authHeader.split(' ')[1];
  const credentials = Buffer.from(base64Credentials, 'base64').toString('utf-8');
  const [username, password] = credentials.split(':');

  // Verify credentials
  if (users[username] && users[username] === password) {
    req.user = username;
    next();
  } else {
    res.setHeader('WWW-Authenticate', 'Basic realm="Simple Auth Demo"');
    return res.status(401).json({ 
      error: 'Invalid credentials',
      hint: 'Valid users: admin/password123, user/mypassword'
    });
  }
}

// Public endpoint (no authentication required)
app.get('/', (req, res) => {
  res.json({
    message: 'Welcome to Simple Auth Server!',
    endpoints: {
      '/': 'Public endpoint (no auth)',
      '/protected': 'Protected endpoint (requires Basic Auth)',
      '/info': 'Get user info (requires Basic Auth)'
    },
    instructions: 'Use Basic Authentication header with format: Authorization: Basic <base64(username:password)>',
    testUsers: 'admin/password123 or user/mypassword'
  });
});

// Protected endpoint
app.get('/protected', basicAuth, (req, res) => {
  res.json({
    message: `Hello ${req.user}! You have successfully authenticated.`,
    data: 'This is protected data that only authenticated users can see.',
    timestamp: new Date().toISOString()
  });
});

// User info endpoint
app.get('/info', basicAuth, (req, res) => {
  res.json({
    username: req.user,
    message: 'Your authentication is working correctly!',
    authMethod: 'Basic Authentication',
    explanation: 'Basic Auth sends credentials in base64 encoding with each request. It\'s simple but should only be used over HTTPS in production.'
  });
});

app.listen(PORT, () => {
  console.log(`Simple Auth Server running on http://localhost:${PORT}`);
  console.log('\n=== WHAT IS BASIC AUTHENTICATION? ===');
  console.log('Basic Authentication is the simplest HTTP authentication scheme.');
  console.log('- Client sends username:password encoded in base64');
  console.log('- Format: Authorization: Basic <base64(username:password)>');
  console.log('- Credentials sent with EVERY request');
  console.log('- Easy to implement but less secure without HTTPS');
  console.log('\n=== WHY USE IT? ===');
  console.log('✓ Simple to implement');
  console.log('✓ Widely supported');
  console.log('✓ Good for internal tools and quick prototypes');
  console.log('✗ Credentials sent with every request');
  console.log('✗ No built-in logout mechanism');
  console.log('✗ MUST use HTTPS in production');
  console.log('\nTest users: admin/password123 or user/mypassword\n');
});
