# Stage 1: Install production dependencies cleanly
FROM node:20-alpine AS dependencies

WORKDIR /app
COPY package*.json ./
RUN npm ci --omit=dev && npm cache clean --force

# Stage 2: Minimal production runtime image
FROM node:20-alpine AS production

WORKDIR /app
ENV NODE_ENV=production

# Copy pruned node_modules from dependencies stage
COPY --from=dependencies /app/node_modules ./node_modules
COPY package*.json ./
COPY src/ ./src/
COPY sql/ ./sql/

# Run as non-root user
USER node

EXPOSE 5000

CMD ["node", "src/server.js"]
