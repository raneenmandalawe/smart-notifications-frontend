#!/bin/bash

# E2E Testing Setup Script
# This script helps set up the E2E testing environment

set -e

echo "🎭 Smart Notifications - E2E Test Setup"
echo "========================================"

# Check if node is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18+ first."
    exit 1
fi

echo "✅ Node.js $(node --version) detected"

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed."
    exit 1
fi

echo "✅ npm $(npm --version) detected"

# Install dependencies if needed
if [ ! -d "node_modules" ]; then
    echo "📦 Installing npm dependencies..."
    npm install
else
    echo "✅ npm dependencies already installed"
fi

# Install Playwright browsers
echo "🌐 Installing Playwright browsers..."
npx playwright install --with-deps chromium firefox

echo ""
echo "✅ Setup complete!"
echo ""
echo "Next steps:"
echo "1. Start your frontend: npm run dev"
echo "2. (Optional) Start ngrok: ngrok http 3000"
echo "3. Run tests: npm run test:e2e"
echo "   or with UI: npm run test:e2e:ui"
echo ""
echo "For CI/CD with Ngrok:"
echo "  export NGROK_URL=https://your-url.ngrok-free.app"
echo "  npm run test:e2e"
