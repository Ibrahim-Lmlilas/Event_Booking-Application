#!/bin/bash
# Build script for Render deployment
set -e

echo "Installing dependencies..."
npm install

echo "Building application..."
npm run build

echo "Build completed successfully!"
