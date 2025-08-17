#!/bin/bash

# PAM iOS App Launch Script
# This script helps launch the iOS app in Xcode simulator

echo "🚀 Launching PAM iOS App..."

# Check if running on macOS
if [[ "$OSTYPE" != "darwin"* ]]; then
    echo "❌ Error: This script requires macOS to run iOS simulator"
    exit 1
fi

# Check if Xcode is installed
if ! command -v xcodebuild &> /dev/null; then
    echo "❌ Error: Xcode is not installed. Please install Xcode from the App Store."
    exit 1
fi

# Navigate to iOS directory
cd ios

# Check if project exists
if [ ! -d "PAMMobile.xcodeproj" ]; then
    echo "❌ Error: iOS project not found. Make sure you're in the correct directory."
    exit 1
fi

# List available simulators
echo "📱 Available iOS Simulators:"
xcrun simctl list devices available | grep -E "iPhone|iPad"

# Build and run the app
echo ""
echo "🔨 Building PAM iOS app..."
xcodebuild -project PAMMobile.xcodeproj \
           -scheme PAMMobile \
           -destination 'platform=iOS Simulator,name=iPhone 15,OS=latest' \
           -configuration Debug \
           build

if [ $? -eq 0 ]; then
    echo "✅ Build successful!"
    echo "📱 Launching in simulator..."
    
    # Open the simulator
    open -a Simulator
    
    # Install and launch the app
    xcrun simctl install booted build/Debug-iphonesimulator/PAMMobile.app
    xcrun simctl launch booted com.pam.mobile
    
    echo ""
    echo "✨ PAM iOS app is running!"
    echo "📧 Demo login: demo@example.com"
    echo "🔑 Password: password"
else
    echo "❌ Build failed. Please check the error messages above."
    exit 1
fi