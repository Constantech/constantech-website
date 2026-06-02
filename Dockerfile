# Stage 1: Build the React frontend and bundle the Express server
FROM node:22-alpine AS builder
WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm ci

# Copy source files and build
COPY . .
RUN npm run build

# Stage 2: Run-time production environment
FROM node:22-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production

# Install only production dependencies
COPY package*.json ./
RUN npm ci --only=production

# Copy built assets and server from builder stage
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/data ./data

# Expose server port 
EXPOSE 3000

# Run compiled CommonJS server bundle
CMD ["node", "dist/server.cjs"]
