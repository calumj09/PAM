#!/bin/bash

# PAM Android App Launch Script
# This script helps launch the Android app in emulator

echo "🚀 Launching PAM Android App..."

# Check if ANDROID_HOME is set
if [ -z "$ANDROID_HOME" ]; then
    echo "⚠️  Warning: ANDROID_HOME is not set. Trying common locations..."
    
    # Try common Android SDK locations
    if [ -d "$HOME/Library/Android/sdk" ]; then
        export ANDROID_HOME="$HOME/Library/Android/sdk"
    elif [ -d "$HOME/Android/Sdk" ]; then
        export ANDROID_HOME="$HOME/Android/Sdk"
    else
        echo "❌ Error: Android SDK not found. Please install Android Studio."
        exit 1
    fi
fi

# Navigate to Android directory
cd android

# Check if gradlew exists
if [ ! -f "gradlew" ]; then
    echo "🔨 Creating Gradle wrapper..."
    gradle wrapper
fi

# Make gradlew executable
chmod +x gradlew

# Check for running emulators
echo "📱 Checking for running Android emulators..."
running_emulators=$($ANDROID_HOME/platform-tools/adb devices | grep emulator | wc -l)

if [ $running_emulators -eq 0 ]; then
    echo "📱 No emulator running. Available AVDs:"
    $ANDROID_HOME/emulator/emulator -list-avds
    
    echo ""
    echo "💡 To start an emulator, run:"
    echo "   $ANDROID_HOME/emulator/emulator -avd <AVD_NAME>"
    echo ""
    echo "Or launch one from Android Studio"
    echo ""
    read -p "Press Enter when emulator is ready..."
fi

# Build the app
echo ""
echo "🔨 Building PAM Android app..."
./gradlew assembleDebug

if [ $? -eq 0 ]; then
    echo "✅ Build successful!"
    echo "📲 Installing app on device..."
    
    # Install the APK
    $ANDROID_HOME/platform-tools/adb install -r app/build/outputs/apk/debug/app-debug.apk
    
    if [ $? -eq 0 ]; then
        echo "✅ Installation successful!"
        echo "🚀 Launching PAM app..."
        
        # Launch the app
        $ANDROID_HOME/platform-tools/adb shell am start -n com.pam.mobile/.MainActivity
        
        echo ""
        echo "✨ PAM Android app is running!"
        echo "📧 Demo login: demo@example.com"
        echo "🔑 Password: password"
    else
        echo "❌ Installation failed. Please check your device/emulator."
        exit 1
    fi
else
    echo "❌ Build failed. Please check the error messages above."
    exit 1
fi