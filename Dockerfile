# Use an official Node.js runtime as a parent image
FROM node:22-alpine AS builder

# Set the working directory to /app
WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install all dependencies (including devDependencies needed for build)
RUN npm ci

# Copy the rest of your application's code
COPY . .

# Build the application
RUN npm run build

# Stage 2: Serve the app
FROM node:22-alpine

WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install only production dependencies
RUN npm ci --omit=dev

# Copy the built output from the builder stage
COPY --from=builder /app/dist ./dist
# Copy the public / default content folders if needed (if your app copies them automatically or needs them mounted)
COPY --from=builder /app/src ./src

# Create needed directories for runtime
RUN mkdir -p /app/data /app/public/uploads

# Expose port (Cloud Run defaults to 8080, but this app listens on 3000)
# Express binds to 3000 usually unless process.env.PORT is respected
EXPOSE 3000

# Set NODE_ENV to production to avoid Vite dev server mode
ENV NODE_ENV=production

# Start the application
CMD ["npm", "start"]
