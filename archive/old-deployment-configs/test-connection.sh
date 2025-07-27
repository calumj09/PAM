#!/bin/bash

echo "🔍 PAM App Connection Diagnostics"
echo "================================="

echo "✅ Server Status:"
if lsof -ti:8080 > /dev/null; then
    echo "   Server is running on port 8080"
else
    echo "   ❌ No server found on port 8080"
fi

echo ""
echo "🌐 Network Tests:"
echo "   Testing localhost:8080..."
if curl -s --max-time 5 http://localhost:8080 > /dev/null; then
    echo "   ✅ localhost:8080 - SUCCESS"
else
    echo "   ❌ localhost:8080 - FAILED"
fi

echo "   Testing 127.0.0.1:8080..."
if curl -s --max-time 5 http://127.0.0.1:8080 > /dev/null; then
    echo "   ✅ 127.0.0.1:8080 - SUCCESS"
else
    echo "   ❌ 127.0.0.1:8080 - FAILED"
fi

echo "   Testing network IP:8080..."
if curl -s --max-time 5 http://192.168.50.136:8080 > /dev/null; then
    echo "   ✅ 192.168.50.136:8080 - SUCCESS"
else
    echo "   ❌ 192.168.50.136:8080 - FAILED"
fi

echo ""
echo "🔧 System Info:"
echo "   macOS Version: $(sw_vers -productVersion)"
echo "   Node Version: $(node --version)"
echo "   Network Interface:"
ifconfig en0 | grep inet

echo ""
echo "💡 Try these URLs in your browser:"
echo "   1. http://localhost:8080"
echo "   2. http://127.0.0.1:8080" 
echo "   3. http://192.168.50.136:8080"
echo ""
echo "If none work, check:"
echo "   - System Preferences > Security & Privacy > Firewall"
echo "   - Terminal permission in System Preferences > Security & Privacy > Privacy"
echo "   - Try running: 'open http://localhost:8080' in Terminal"