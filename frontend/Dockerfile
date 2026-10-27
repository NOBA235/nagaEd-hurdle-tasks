# Stage 1: Build the React application
FROM node:20-alpine AS builder

WORKDIR /app

# Build arguments for browser-facing API endpoints
ARG VITE_API_BASE_URL=http://localhost:5000/api
ARG VITE_AI_SERVICE_URL=http://localhost:8000/api

ENV VITE_API_BASE_URL=$VITE_API_BASE_URL
ENV VITE_AI_SERVICE_URL=$VITE_AI_SERVICE_URL

COPY package*.json ./
RUN npm ci

COPY . ./
RUN npm run build

# Stage 2: Serve the production build using lightweight Nginx
FROM nginx:alpine AS runner

COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]

