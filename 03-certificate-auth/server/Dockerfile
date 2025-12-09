FROM node:18-alpine

# Install OpenSSL for certificate generation
RUN apk add --no-cache openssl bash

WORKDIR /app

# Copy certificate generation script
COPY certs/generate-certs.sh /app/
RUN chmod +x /app/generate-certs.sh

# Generate certificates at build time
RUN /app/generate-certs.sh

COPY server/package*.json ./
RUN npm install

COPY server/ .

EXPOSE 3002

CMD ["npm", "start"]
