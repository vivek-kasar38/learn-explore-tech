# Quick Start Guide

## 🚀 Getting Started in 3 Steps

### Step 1: Build and Start All Services
```bash
docker compose up --build
```

This will:
- Build Docker images for all 6 services (3 servers + 3 clients)
- Generate certificates automatically for mTLS demo
- Start all services in the correct order
- Run automated tests showing each authentication method

### Step 2: Watch the Output
You'll see three different authentication demonstrations running simultaneously:

#### Simple Auth (Port 3000)
```
✓ Public endpoint accessible
✓ Protected endpoint rejects without credentials
✓ Protected endpoint accepts valid Basic Auth
✓ Shows how username:password is base64 encoded
```

#### JWT Auth (Port 3001)
```
✓ Login endpoint returns JWT token
✓ Protected endpoint rejects without token
✓ Protected endpoint accepts valid JWT
✓ Shows token structure (header.payload.signature)
✓ Token can be revoked (logout)
```

#### Certificate Auth (Port 3002)
```
✓ Certificates generated automatically
✓ mTLS handshake authenticates client
✓ Protected endpoint requires valid certificate
✓ Shows certificate-based authentication flow
```

### Step 3: Stop All Services
```bash
docker compose down
```

## 🎯 Run Individual Examples

### Just Basic Authentication
```bash
docker compose up simple-auth-server simple-auth-client
```

### Just JWT Authentication
```bash
docker compose up jwt-auth-server jwt-auth-client
```

### Just Certificate Authentication
```bash
docker compose up cert-auth-server cert-auth-client
```

## 🔍 Manual Testing

### Test Basic Auth
```bash
# Public endpoint (no auth)
curl http://localhost:3000/

# Protected endpoint (with Basic Auth)
curl -u admin:password123 http://localhost:3000/protected
```

### Test JWT Auth
```bash
# Login to get token
TOKEN=$(curl -s -X POST http://localhost:3001/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"password123"}' | jq -r '.token')

# Use token to access protected endpoint
curl http://localhost:3001/protected \
  -H "Authorization: Bearer $TOKEN"
```

### Test Certificate Auth
```bash
# Access protected endpoint with client certificate
docker exec cert-auth-client curl https://cert-auth-server:3002/protected \
  --cert /app/certs/client-cert.pem \
  --key /app/certs/client-key.pem \
  --cacert /app/certs/ca-cert.pem
```

## 📊 View Logs

```bash
# All services
docker compose logs

# Specific service
docker compose logs simple-auth-client
docker compose logs jwt-auth-server
docker compose logs cert-auth-client

# Follow logs in real-time
docker compose logs -f
```

## 🧹 Cleanup

```bash
# Stop and remove containers
docker compose down

# Remove volumes (certificates)
docker compose down -v

# Remove everything including images
docker compose down -v --rmi all
```

## 📚 What You'll Learn

### 1. Basic Authentication
- Simplest HTTP authentication
- Username:password in base64 encoding
- Sent with every request
- **Use case**: Internal APIs, simple tools

### 2. JWT Authentication
- Token-based authentication
- Login once, get a signed token
- Token contains user information
- **Use case**: Web/mobile apps, modern APIs

### 3. Certificate Authentication (mTLS)
- Most secure authentication
- Uses public key cryptography
- No passwords involved
- **Use case**: Service-to-service, enterprise security

## 🎓 Learning Path

1. **Start with Basic Auth** - Understand the fundamentals
2. **Move to JWT** - Learn modern authentication
3. **Explore Certificates** - Master enterprise security

## 💡 Tips

- Watch the server startup messages - they explain each auth method
- Read the client output - it shows test scenarios
- Check the README.md for detailed explanations
- Try modifying the code to experiment

## 🐛 Troubleshooting

### Build takes too long
```bash
# Use pre-built images or be patient - first build downloads dependencies
```

### Port conflicts
```bash
# Check what's using the ports
lsof -i :3000
lsof -i :3001
lsof -i :3002
```

### Certificate errors
```bash
# Regenerate certificates
docker compose down -v
docker volume rm learn-explore-tech_cert-data
docker compose up --build
```

## 🎉 Success Criteria

You'll know it's working when you see:
- ✓ All 6 containers start successfully
- ✓ Test clients complete their test suites
- ✓ Each authentication method is demonstrated
- ✓ Educational output explains what's happening

**Happy Learning! 🚀**
