const express = require('express');
const jwt = require('jsonwebtoken');
const app = express();
const PORT = process.env.PORT || 3001;

// Secret key for JWT (In production, use environment variable and keep it secret!)
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
const JWT_EXPIRY = '1h'; // Token expires in 1 hour

// Middleware
app.use(express.json());

// Simple in-memory user store (for demo purposes only)
const users = {
  'admin': { password: 'password123', role: 'admin' },
  'user': { password: 'mypassword', role: 'user' }
};

// In-memory token blacklist (for logout functionality)
const tokenBlacklist = new Set();

// Middleware to verify JWT token
function authenticateToken(req, res, next) {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    return res.status(401).json({ 
      error: 'Access token required',
      hint: 'Use Authorization: Bearer <token> header'
    });
  }

  // Check if token is blacklisted
  if (tokenBlacklist.has(token)) {
    return res.status(401).json({ 
      error: 'Token has been revoked',
      hint: 'Please login again to get a new token'
    });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ 
        error: 'Invalid or expired token',
        details: err.message
      });
    }
    req.user = user;
    next();
  });
}

// Public endpoint
app.get('/', (req, res) => {
  res.json({
    message: 'Welcome to JWT Authentication Server!',
    endpoints: {
      'POST /login': 'Login with username/password to get JWT token',
      'GET /protected': 'Protected endpoint (requires valid JWT)',
      'GET /user': 'Get user info (requires valid JWT)',
      'POST /logout': 'Logout (invalidate token)'
    },
    instructions: 'First login to get a token, then use it in Authorization: Bearer <token> header',
    testUsers: 'admin/password123 or user/mypassword'
  });
});

// Login endpoint - returns JWT token
// NOTE: In production, add rate limiting to prevent brute force attacks
// For demo/learning purposes, rate limiting is omitted for simplicity
app.post('/login', (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ 
      error: 'Username and password required',
      example: { username: 'admin', password: 'password123' }
    });
  }

  // Verify credentials
  const user = users[username];
  if (!user || user.password !== password) {
    return res.status(401).json({ 
      error: 'Invalid credentials',
      hint: 'Valid users: admin/password123, user/mypassword'
    });
  }

  // Create JWT token
  const token = jwt.sign(
    { 
      username: username,
      role: user.role,
      iat: Math.floor(Date.now() / 1000)
    },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRY }
  );

  res.json({
    message: 'Login successful!',
    token: token,
    tokenType: 'Bearer',
    expiresIn: JWT_EXPIRY,
    usage: `Authorization: Bearer ${token}`,
    user: {
      username: username,
      role: user.role
    }
  });
});

// Protected endpoint
app.get('/protected', authenticateToken, (req, res) => {
  res.json({
    message: `Hello ${req.user.username}! You have successfully authenticated with JWT.`,
    data: 'This is protected data accessible only with valid JWT token.',
    yourToken: {
      username: req.user.username,
      role: req.user.role,
      issuedAt: new Date(req.user.iat * 1000).toISOString()
    },
    timestamp: new Date().toISOString()
  });
});

// User info endpoint
app.get('/user', authenticateToken, (req, res) => {
  res.json({
    username: req.user.username,
    role: req.user.role,
    tokenIssuedAt: new Date(req.user.iat * 1000).toISOString(),
    message: 'JWT authentication is working correctly!',
    authMethod: 'JSON Web Token (JWT)',
    explanation: 'JWT tokens contain encoded user information and are signed to prevent tampering. The token is sent with each request instead of credentials.'
  });
});

// Logout endpoint - blacklist the token
app.post('/logout', authenticateToken, (req, res) => {
  const token = req.headers.authorization.split(' ')[1];
  tokenBlacklist.add(token);
  
  res.json({
    message: 'Logout successful!',
    info: 'Your token has been invalidated. You will need to login again.',
    note: 'In production, use a proper token blacklist with expiry (like Redis)'
  });
});

app.listen(PORT, () => {
  console.log(`JWT Auth Server running on http://localhost:${PORT}`);
  console.log('\n=== WHAT IS JWT AUTHENTICATION? ===');
  console.log('JWT (JSON Web Token) is a compact, self-contained token format.');
  console.log('- User logs in with credentials once');
  console.log('- Server returns a signed JWT token');
  console.log('- Client sends token with subsequent requests');
  console.log('- Server verifies token signature and expiry');
  console.log('- Token contains user info (username, role, etc.)');
  console.log('\n=== WHY USE JWT? ===');
  console.log('✓ Stateless - no session storage needed');
  console.log('✓ Credentials sent only during login');
  console.log('✓ Token contains user info (no database lookup)');
  console.log('✓ Can set expiry time');
  console.log('✓ Good for APIs and microservices');
  console.log('✗ Token size larger than session ID');
  console.log('✗ Cannot revoke easily (need blacklist)');
  console.log('✗ Token data visible (but signed)');
  console.log('\nTest users: admin/password123 or user/mypassword\n');
});
