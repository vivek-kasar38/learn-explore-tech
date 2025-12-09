# Authentication Learning Environment 🔐

A comprehensive hands-on learning environment to understand and explore three fundamental authentication methods through practical client-server simulations running locally with Docker.

## 🎯 What You'll Learn

This project demonstrates three authentication methods with working client-server implementations:

1. **Simple Basic Authentication** - The simplest HTTP authentication
2. **JWT (JSON Web Token) Authentication** - Modern stateless authentication
3. **Certificate-based Authentication (mTLS)** - Most secure authentication using public key cryptography

Each example includes:
- ✅ A fully functional server implementation
- ✅ An interactive client that demonstrates the authentication flow
- ✅ Detailed explanations of how and why each method works
- ✅ Docker containers for easy local deployment
- ✅ Educational console output showing what's happening

## 🏗️ Project Structure

```
.
├── 01-simple-auth/          # Basic Authentication Example
│   ├── server/              # Express server with Basic Auth
│   │   ├── server.js
│   │   ├── package.json
│   │   └── Dockerfile
│   └── client/              # Test client
│       ├── client.js
│       ├── package.json
│       └── Dockerfile
│
├── 02-jwt-auth/             # JWT Authentication Example
│   ├── server/              # Express server with JWT
│   │   ├── server.js
│   │   ├── package.json
│   │   └── Dockerfile
│   └── client/              # Test client
│       ├── client.js
│       ├── package.json
│       └── Dockerfile
│
├── 03-certificate-auth/     # Certificate Authentication Example
│   ├── certs/               # Certificate generation
│   │   └── generate-certs.sh
│   ├── server/              # HTTPS server with mTLS
│   │   ├── server.js
│   │   ├── package.json
│   │   └── Dockerfile
│   └── client/              # Test client with certificates
│       ├── client.js
│       ├── package.json
│       └── Dockerfile
│
└── docker-compose.yml       # Orchestrates all services
```

## 🚀 Quick Start

### Prerequisites

- Docker and Docker Compose installed
- Basic understanding of HTTP and client-server architecture

### Running All Examples

1. **Clone the repository:**
   ```bash
   git clone <repository-url>
   cd learn-explore-tech
   ```

2. **Start all authentication demos:**
   ```bash
   docker-compose up --build
   ```

3. **Watch the output!** Each client will automatically run tests against its server, showing you exactly how each authentication method works.

4. **Stop all services:**
   ```bash
   docker-compose down
   ```

### Running Individual Examples

**Basic Authentication:**
```bash
docker-compose up simple-auth-server simple-auth-client
```

**JWT Authentication:**
```bash
docker-compose up jwt-auth-server jwt-auth-client
```

**Certificate Authentication:**
```bash
docker-compose up cert-auth-server cert-auth-client
```

## 📚 Authentication Methods Explained

### 1. Basic Authentication (Port 3000)

**How it works:**
- Client sends username and password with EVERY request
- Credentials are base64 encoded (NOT encrypted!)
- Format: `Authorization: Basic base64(username:password)`

**Why it exists:**
- ✅ Extremely simple to implement
- ✅ Widely supported by all HTTP clients
- ✅ No session management needed
- ✅ Good for internal tools and APIs

**Limitations:**
- ❌ Credentials sent with every request (higher risk)
- ❌ Base64 is encoding, not encryption (MUST use HTTPS)
- ❌ No built-in logout mechanism
- ❌ Not suitable for user-facing applications

**Test it manually:**
```bash
# Public endpoint
curl http://localhost:3000/

# Protected endpoint (will fail without auth)
curl http://localhost:3000/protected

# With authentication
curl -u admin:password123 http://localhost:3000/protected
```

### 2. JWT Authentication (Port 3001)

**How it works:**
- Client logs in ONCE with credentials
- Server returns a signed JWT token
- Client includes token in subsequent requests
- Token contains user info and is cryptographically signed

**Token Structure:**
```
Header.Payload.Signature
```
- **Header:** Algorithm and token type
- **Payload:** User data (username, role, expiry)
- **Signature:** Ensures token hasn't been tampered with

**Why it exists:**
- ✅ Stateless - no session storage needed
- ✅ Credentials sent only during login
- ✅ Token can carry user information
- ✅ Can set expiration time
- ✅ Perfect for APIs and microservices
- ✅ Scales well (no session sharing)

**Limitations:**
- ❌ Token size larger than session ID
- ❌ Hard to revoke before expiry (need blacklist)
- ❌ Token data is visible (though signed)

**Test it manually:**
```bash
# Login to get token
curl -X POST http://localhost:3001/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"password123"}'

# Use token (replace TOKEN with actual token from login)
curl http://localhost:3001/protected \
  -H "Authorization: Bearer TOKEN"
```

### 3. Certificate-based Authentication / mTLS (Port 3002)

**How it works:**
- Client and server both have X.509 certificates
- Certificates are signed by a trusted Certificate Authority (CA)
- During TLS handshake, both parties verify each other's certificates
- Private keys prove identity without being transmitted

**Certificate Chain:**
```
CA (Certificate Authority)
├── Signs Server Certificate
└── Signs Client Certificate
```

**Why it exists:**
- ✅ Most secure authentication method
- ✅ No passwords to steal, crack, or phish
- ✅ Private key never leaves the client
- ✅ Perfect for machine-to-machine (service-to-service)
- ✅ Built into TLS protocol
- ✅ Cannot be brute-forced

**Limitations:**
- ❌ More complex to set up and manage
- ❌ Certificate lifecycle management (renewal, revocation)
- ❌ Requires PKI (Public Key Infrastructure)
- ❌ Not suitable for end-user applications

**Certificate Generation:**
The demo automatically generates self-signed certificates:
- **CA Certificate** - The trusted root
- **Server Certificate** - Identifies the server
- **Client Certificate** - Identifies the client

**Test it manually:**
```bash
# Requires certificates (generated during build)
docker exec cert-auth-client curl https://cert-auth-server:3002/protected \
  --cert /app/certs/client-cert.pem \
  --key /app/certs/client-key.pem \
  --cacert /app/certs/ca-cert.pem
```

## 🔍 Comparison Table

| Feature | Basic Auth | JWT | Certificate (mTLS) |
|---------|-----------|-----|-------------------|
| **Security Level** | Low-Medium | Medium-High | Very High |
| **Complexity** | Very Simple | Simple | Complex |
| **Credentials Sent** | Every request | Login only | Never sent |
| **Stateless** | Yes | Yes | Yes |
| **Session Storage** | No | No | No |
| **Primary Use Case** | Internal APIs | Web/Mobile Apps | Service-to-Service |
| **Revocation** | Immediate | Complex (blacklist) | CRL/OCSP |
| **User Experience** | Simple | Good | Transparent |
| **Scalability** | Excellent | Excellent | Excellent |
| **Infrastructure Needs** | None | None | PKI Required |

## 🎓 Learning Path

### For Beginners:
1. Start with **Basic Authentication** - understand the fundamentals
2. Move to **JWT** - learn about tokens and modern authentication
3. Explore **Certificates** - understand enterprise-grade security

### Key Takeaways:

**When to use Basic Auth:**
- Internal tools and scripts
- Simple APIs with HTTPS
- Development/testing environments

**When to use JWT:**
- Web applications
- Mobile applications
- RESTful APIs
- Microservices architectures

**When to use Certificate Auth:**
- Service-to-service communication
- Enterprise security requirements
- IoT device authentication
- API gateways and zero-trust networks

## 🔧 Advanced: Manual Testing

### Access Server Containers

```bash
# Basic Auth Server
docker exec -it simple-auth-server sh

# JWT Auth Server
docker exec -it jwt-auth-server sh

# Certificate Auth Server
docker exec -it cert-auth-server sh
```

### View Logs

```bash
# All services
docker-compose logs

# Specific service
docker-compose logs simple-auth-client
docker-compose logs jwt-auth-client
docker-compose logs cert-auth-client
```

### Inspect Certificates

```bash
# View generated certificates
docker exec cert-auth-server ls -la /app/certs/

# View certificate details
docker exec cert-auth-server openssl x509 -in /app/certs/client-cert.pem -text -noout
```

## 🛠️ Customization

### Add Your Own Users

Edit the user stores in the server files:
- `01-simple-auth/server/server.js`
- `02-jwt-auth/server/server.js`

### Change JWT Expiry

Modify `JWT_EXPIRY` in:
- `02-jwt-auth/server/server.js`

### Generate New Certificates

Modify certificate parameters in:
- `03-certificate-auth/certs/generate-certs.sh`

## 🐛 Troubleshooting

**Port already in use:**
```bash
# Check what's using the ports
lsof -i :3000
lsof -i :3001
lsof -i :3002

# Or change ports in docker-compose.yml
```

**Containers won't start:**
```bash
# Clean rebuild
docker-compose down -v
docker-compose build --no-cache
docker-compose up
```

**Certificate errors:**
```bash
# Regenerate certificates
docker-compose down -v
docker volume rm learn-explore-tech_cert-data
docker-compose up --build
```

## 📖 Additional Resources

### Authentication Concepts:
- [OWASP Authentication Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Authentication_Cheat_Sheet.html)
- [JWT.io - JSON Web Tokens](https://jwt.io/)
- [OAuth 2.0 Simplified](https://aaronparecki.com/oauth-2-simplified/)

### TLS/Certificates:
- [How HTTPS Works](https://howhttps.works/)
- [Let's Encrypt - Free SSL/TLS Certificates](https://letsencrypt.org/)
- [Understanding X.509 Certificates](https://www.ssl.com/faqs/what-is-an-x-509-certificate/)

## 🤝 Contributing

This is a learning project! Feel free to:
- Add more authentication methods (OAuth, SAML, etc.)
- Improve documentation
- Add more test scenarios
- Create interactive tutorials

## 📝 License

This project is for educational purposes. Feel free to use and modify it for learning.

## 🎯 Next Steps

After completing this tutorial, you should:
1. Understand when to use each authentication method
2. Be able to implement basic authentication in your projects
3. Understand the security implications of each method
4. Know how to debug authentication issues

**Happy Learning! 🚀**