FROM node:25.5.0-slim

WORKDIR /app

# Install OpenSSL for Prisma, build tools for native modules, and gosu for user switching
RUN apt-get update && apt-get install -y openssl python3 make g++ gosu && rm -rf /var/lib/apt/lists/*

# Copy package files and install dependencies (includes native module compilation)
COPY package*.json ./
RUN npm ci

# Copy prisma schema and generate client
COPY prisma ./prisma/
COPY prisma.config.ts ./
RUN npx prisma generate

# Copy source code and build
COPY src ./src/
COPY tsconfig.json ./
COPY vite.config.mts ./
RUN npm run compile

# Create data directory for SQLite database (will be mounted as volume)
RUN mkdir -p data

# Copy entrypoint script and fix Windows line endings
COPY docker-entrypoint.sh ./
RUN sed -i 's/\r$//' docker-entrypoint.sh && chmod +x docker-entrypoint.sh

# Data volume for persistent storage
VOLUME /app/data

# Container starts as root, entrypoint will switch to USER_ID:GROUP_ID
ENTRYPOINT ["./docker-entrypoint.sh"]
