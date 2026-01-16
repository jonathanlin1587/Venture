#!/bin/bash

# QuestList - Easy Run Script
# Usage: ./run.sh [ios|android|web|tunnel|clear]

set -e

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${BLUE}🚀 QuestList App Runner${NC}"
echo ""

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo -e "${YELLOW}⚠️  node_modules not found. Installing dependencies...${NC}"
    npm install
    echo ""
fi

# Parse command line argument
case "${1:-}" in
    ios)
        echo -e "${GREEN}📱 Starting Expo on iOS...${NC}"
        npm run ios
        ;;
    android)
        echo -e "${GREEN}🤖 Starting Expo on Android...${NC}"
        npm run android
        ;;
    web)
        echo -e "${GREEN}🌐 Starting Expo on Web...${NC}"
        npm run web
        ;;
    tunnel)
        echo -e "${GREEN}🔗 Starting Expo with tunnel (for testing on physical devices)...${NC}"
        npm run tunnel
        ;;
    clear)
        echo -e "${GREEN}🧹 Clearing cache and starting Expo...${NC}"
        npm run clear
        ;;
    *)
        echo -e "${GREEN}▶️  Starting Expo dev server...${NC}"
        echo ""
        echo "Available options:"
        echo "  Press 'i' for iOS simulator"
        echo "  Press 'a' for Android emulator"
        echo "  Press 'w' for web browser"
        echo "  Or scan the QR code with Expo Go app"
        echo ""
        npm start
        ;;
esac

