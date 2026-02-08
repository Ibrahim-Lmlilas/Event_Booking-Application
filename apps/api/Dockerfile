# Stage 1: Build
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files for API
COPY apps/api/package*.json ./apps/api/

# Copy shared folder
COPY shared ./shared/

# Install dependencies
WORKDIR /app/apps/api
RUN npm ci

# Copy API source code
COPY apps/api ./

# Build the application
RUN npm run build

# Stage 2: Production
FROM node:20-alpine

WORKDIR /app

# Copy package files
COPY apps/api/package*.json ./

# Install production dependencies only
RUN npm ci --only=production

# Copy built application from builder
COPY --from=builder /app/apps/api/dist ./dist

# Expose port
EXPOSE 3001

# Start the application
CMD ["node", "dist/apps/api/src/main.js"]
