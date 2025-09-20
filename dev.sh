#!/bin/bash

# Development script to run both API server and Vite frontend
echo "🚀 Starting AI Agent Leadership Platform Development Environment"

# Kill any existing processes
pkill -f "tsx server/app.ts" 2>/dev/null || true
pkill -f "vite" 2>/dev/null || true

# Start API server in background
echo "📊 Starting API server on port 3001..."
npx tsx server/app.ts &
API_PID=$!

# Give the API server time to start
sleep 3

# Start Vite frontend in background
echo "🌐 Starting Vite frontend on port 8080..."
npm run dev &
VITE_PID=$!

# Print status
echo ""
echo "✅ Development servers started!"
echo "📊 API Server: http://localhost:3001"
echo "🌐 Frontend: http://localhost:8080"
echo ""
echo "Press Ctrl+C to stop both servers"

# Function to cleanup on exit
cleanup() {
    echo ""
    echo "🛑 Stopping development servers..."
    kill $API_PID 2>/dev/null || true
    kill $VITE_PID 2>/dev/null || true
    pkill -f "tsx server/app.ts" 2>/dev/null || true
    pkill -f "vite" 2>/dev/null || true
    echo "✅ Cleanup complete"
    exit 0
}

# Set up trap to handle Ctrl+C
trap cleanup INT TERM

# Wait for both processes
wait