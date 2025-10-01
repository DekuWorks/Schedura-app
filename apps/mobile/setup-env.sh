#!/bin/bash

# Setup script for mobile app environment variables
echo "Setting up environment variables for Schedura mobile app..."

# Create .env file from example
if [ ! -f .env ]; then
    echo "Creating .env file from env.example..."
    cp env.example .env
    echo "✅ .env file created"
else
    echo "⚠️  .env file already exists"
fi

# Check if environment variables are set
echo ""
echo "Checking environment variables..."

if [ -f .env ]; then
    echo "📋 Current environment variables:"
    echo "EXPO_PUBLIC_SUPABASE_URL: $(grep EXPO_PUBLIC_SUPABASE_URL .env | cut -d'=' -f2)"
    echo "EXPO_PUBLIC_SUPABASE_ANON_KEY: $(grep EXPO_PUBLIC_SUPABASE_ANON_KEY .env | cut -d'=' -f2 | cut -c1-20)..."
    echo "EXPO_PUBLIC_APP_URL: $(grep EXPO_PUBLIC_APP_URL .env | cut -d'=' -f2)"
else
    echo "❌ .env file not found"
fi

echo ""
echo "🚀 Environment setup complete!"
echo ""
echo "Next steps:"
echo "1. Review the .env file and update values if needed"
echo "2. Run 'pnpm install' to install dependencies"
echo "3. Run 'pnpm dev' to start the development server"
