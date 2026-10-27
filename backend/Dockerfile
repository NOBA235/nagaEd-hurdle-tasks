# Multi-stage production container for NagaEd Express API
FROM node:20-alpine AS production

WORKDIR /app

# Set production environment
ENV NODE_ENV=production

# Install dependencies (only production packages)
COPY package*.json ./
RUN npm ci --omit=dev

# Copy application source code
COPY src/ ./src/
COPY sql/ ./sql/

# Switch to non-root user for container security
USER node

# Expose API port
EXPOSE 5000

# Start server with graceful shutdown handling
CMD ["node", "src/server.js"]

