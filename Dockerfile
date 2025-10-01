# Multi-stage build for Pitchfork Protocol
# Stage 1: Build frontend
FROM node:20-alpine AS frontend-builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --production=false

# Copy source code
COPY . .

# Build frontend
RUN npm run build

# Stage 2: Build backend
FROM node:20-alpine AS backend-builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --production=false

# Copy backend code
COPY server ./server
COPY shared ./shared

# Compile TypeScript
RUN npx tsc --project server/tsconfig.json || true

# Stage 3: Production image
FROM node:20-alpine AS production

WORKDIR /app

# Install production dependencies only
COPY package*.json ./
RUN npm ci --production

# Copy built frontend
COPY --from=frontend-builder /app/dist ./dist

# Copy backend files
COPY --from=backend-builder /app/server ./server
COPY shared ./shared

# Copy contracts for blockchain integration
COPY contracts ./contracts

# Create non-root user for security
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001 && \
    chown -R nodejs:nodejs /app

USER nodejs

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD node -e "require('http').get('http://localhost:${API_PORT:-3001}/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

# Expose ports (API and Frontend)
EXPOSE 3001 8080

# Start application
CMD ["node", "server/simple-server.mjs"]
