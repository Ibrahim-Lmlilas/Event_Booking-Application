# Production Dockerfile - works with context = apps/api (Render)
# Fetches shared from repo via git clone
ARG GIT_REPO=https://github.com/Ibrahim-Lmlilas/Event_Booking-Application
ARG GIT_BRANCH=preprod

# Stage 1: Build
FROM node:20-alpine AS builder

ARG GIT_REPO
ARG GIT_BRANCH

WORKDIR /app

# Copy API contents (context = apps/api)
COPY . ./apps/api/

# Get shared from repo (not in context when context = apps/api)
RUN apk add --no-cache git && \
  git clone --depth 1 --single-branch --branch "${GIT_BRANCH}" "${GIT_REPO}" /tmp/repo && \
  cp -r /tmp/repo/shared ./shared && \
  rm -rf /tmp/repo

# Install and build
WORKDIR /app/apps/api
RUN npm ci && npm run build

# Stage 2: Production
FROM node:20-alpine

WORKDIR /app

# Copy package files and production node_modules
COPY package*.json ./apps/api/
RUN cd apps/api && npm ci --only=production

# Copy built app from builder (Nest output: dist/apps/api/src/main.js)
COPY --from=builder /app/apps/api/dist ./apps/api/dist

EXPOSE 3001
CMD ["node", "apps/api/dist/apps/api/src/main.js"]
