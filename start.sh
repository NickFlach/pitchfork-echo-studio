#!/bin/bash

# Kill any existing processes on port 5000
pkill -f ":5000" 2>/dev/null || true
pkill -f "serve" 2>/dev/null || true

# Build the application
echo "Building application..."
npm run build

# Start the static server
echo "Starting server on port 5000..."
npx serve -s dist -l 5000
