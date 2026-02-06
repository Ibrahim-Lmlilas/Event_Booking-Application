#!/bin/bash
# Build script for Render deployment
set -e

echo "Installing dependencies..."
npm install

echo "Building Next.js application..."
npm run build

echo "Build completed successfully!"
