#!/bin/bash

# Script to generate self-signed certificates for mTLS demo
# This creates a Certificate Authority (CA) and client/server certificates

CERTS_DIR="/app/certs"
mkdir -p "$CERTS_DIR"
cd "$CERTS_DIR"

echo "╔════════════════════════════════════════════════════════╗"
echo "║     Generating Certificates for mTLS Demo             ║"
echo "╚════════════════════════════════════════════════════════╝"

# 1. Generate CA (Certificate Authority)
echo -e "\n[1/5] Generating CA private key..."
openssl genrsa -out ca-key.pem 4096

echo "[2/5] Generating CA certificate..."
openssl req -new -x509 -days 365 -key ca-key.pem -out ca-cert.pem \
  -subj "/C=US/ST=State/L=City/O=LearningOrg/OU=IT/CN=Learning-CA"

# 2. Generate Server Certificate
echo -e "\n[3/5] Generating server private key..."
openssl genrsa -out server-key.pem 4096

echo "[4/5] Generating server certificate signing request..."
openssl req -new -key server-key.pem -out server-csr.pem \
  -subj "/C=US/ST=State/L=City/O=LearningOrg/OU=IT/CN=cert-auth-server"

echo "[5/5] Signing server certificate with CA..."
openssl x509 -req -days 365 -in server-csr.pem -CA ca-cert.pem -CAkey ca-key.pem \
  -CAcreateserial -out server-cert.pem

# 3. Generate Client Certificate
echo -e "\n[6/8] Generating client private key..."
openssl genrsa -out client-key.pem 4096

echo "[7/8] Generating client certificate signing request..."
openssl req -new -key client-key.pem -out client-csr.pem \
  -subj "/C=US/ST=State/L=City/O=LearningOrg/OU=IT/CN=authorized-client"

echo "[8/8] Signing client certificate with CA..."
openssl x509 -req -days 365 -in client-csr.pem -CA ca-cert.pem -CAkey ca-key.pem \
  -CAcreateserial -out client-cert.pem

# Clean up CSR files
rm -f server-csr.pem client-csr.pem ca-cert.srl

echo -e "\n✓ Certificate generation complete!"
echo -e "\nGenerated files:"
echo "  ca-cert.pem       - CA certificate (trusted root)"
echo "  ca-key.pem        - CA private key"
echo "  server-cert.pem   - Server certificate"
echo "  server-key.pem    - Server private key"
echo "  client-cert.pem   - Client certificate"
echo "  client-key.pem    - Client private key"

echo -e "\n=== CERTIFICATE INFO ==="
echo -e "\nCA Certificate:"
openssl x509 -in ca-cert.pem -noout -subject -issuer -dates

echo -e "\nServer Certificate:"
openssl x509 -in server-cert.pem -noout -subject -issuer -dates

echo -e "\nClient Certificate:"
openssl x509 -in client-cert.pem -noout -subject -issuer -dates

echo -e "\n╔════════════════════════════════════════════════════════╗"
echo "║     Certificates Ready for mTLS Demo                   ║"
echo "╚════════════════════════════════════════════════════════╝"
