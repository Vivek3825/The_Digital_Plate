#!/bin/bash

# The Digital Plate - Local Server Starter
# This script starts a local HTTP server for AR functionality

echo "🍽️  The Digital Plate - Starting Local Server..."
echo "================================================"
echo ""

# Try different ports if 8000 is busy
PORT=8000

echo "� Checking port $PORT..."
if lsof -Pi :$PORT -sTCP:LISTEN -t >/dev/null 2>&1 ; then
    echo "⚠️  Port $PORT is busy, trying 8080..."
    PORT=8080
fi

if lsof -Pi :$PORT -sTCP:LISTEN -t >/dev/null 2>&1 ; then
    echo "⚠️  Port $PORT is busy, trying 3000..."
    PORT=3000
fi

echo ""
echo "✅ Server will be available at: http://localhost:$PORT"
echo "🎥 AR features require this local server to access camera"
echo ""
echo "📌 Open your browser and navigate to: http://localhost:$PORT"
echo ""
echo "Press Ctrl+C to stop the server"
echo "================================================"
echo ""

# Start Python HTTP server
python3 -m http.server $PORT
