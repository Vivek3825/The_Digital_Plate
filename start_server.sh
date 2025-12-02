#!/bin/bash

# The Digital Plate - Development Server
# Works for both laptop (HTTP) and mobile (HTTPS) testing

echo "🍽️  The Digital Plate - Development Server"
echo "============================================"
echo ""

# Check for command line arguments
MODE="auto"
if [ "$1" == "--http" ] || [ "$1" == "-h" ]; then
    MODE="http"
elif [ "$1" == "--https" ] || [ "$1" == "-s" ]; then
    MODE="https"
elif [ "$1" == "--help" ]; then
    echo "Usage: ./start_server.sh [OPTION]"
    echo ""
    echo "Options:"
    echo "  --http, -h    Force HTTP mode (laptop only)"
    echo "  --https, -s   Force HTTPS mode (mobile testing)"
    echo "  (no option)   Auto-detect based on network"
    echo ""
    exit 0
fi

# Try different ports if 8000 is busy
PORT=8000

echo "🔍 Checking port $PORT..."
if lsof -Pi :$PORT -sTCP:LISTEN -t >/dev/null 2>&1 ; then
    echo "⚠️  Port $PORT is busy, trying 8080..."
    PORT=8080
fi

if lsof -Pi :$PORT -sTCP:LISTEN -t >/dev/null 2>&1 ; then
    echo "⚠️  Port $PORT is busy, trying 3000..."
    PORT=3000
fi

# Get local IP addresses for mobile testing info
LOCAL_IPS=$(hostname -I 2>/dev/null | tr ' ' '\n' | grep -E '^[0-9]+\.[0-9]+\.[0-9]+\.[0-9]+$' | head -3)

# Auto-detect mode: use HTTPS if multiple network interfaces detected (likely mobile connected)
if [ "$MODE" == "auto" ]; then
    IP_COUNT=$(echo "$LOCAL_IPS" | wc -l)
    if [ "$IP_COUNT" -gt 1 ]; then
        echo "📱 Multiple network interfaces detected - enabling HTTPS for mobile testing"
        MODE="https"
    else
        MODE="http"
    fi
fi

echo ""

if [ "$MODE" == "https" ]; then
    # HTTPS Mode for mobile testing
    CERT_DIR="$HOME/.local/share/the-digital-plate/certs"
    CERT_FILE="$CERT_DIR/cert.pem"
    KEY_FILE="$CERT_DIR/key.pem"

    # Generate SSL certificates if needed
    if [ ! -f "$CERT_FILE" ] || [ ! -f "$KEY_FILE" ]; then
        echo "🔐 Generating SSL certificate for mobile testing..."
        mkdir -p "$CERT_DIR"
        openssl req -x509 -newkey rsa:2048 -nodes \
            -keyout "$KEY_FILE" \
            -out "$CERT_FILE" \
            -days 365 \
            -subj "/CN=localhost" 2>/dev/null
        
        if [ $? -ne 0 ]; then
            echo "❌ Failed to create certificate. Falling back to HTTP."
            MODE="http"
        else
            echo "✅ Certificate created!"
        fi
        echo ""
    fi
fi

if [ "$MODE" == "https" ]; then
    echo "✅ HTTPS Server (Mobile + Laptop)"
    echo "=================================="
    echo ""
    echo "💻 Laptop:  https://localhost:$PORT"
    echo ""
    
    if [ ! -z "$LOCAL_IPS" ]; then
        echo "📱 Mobile testing URLs:"
        for IP in $LOCAL_IPS; do
            echo "   🔗 https://$IP:$PORT"
        done
        echo ""
        echo "📋 Mobile setup:"
        echo "   1. Connect phone via USB tethering OR same WiFi"
        echo "   2. Open URL in phone browser"
        echo "   3. Accept security warning (tap Advanced → Proceed)"
        echo "   4. AR features will work! 🎉"
    fi
    
    echo ""
    echo "Press Ctrl+C to stop the server"
    echo "============================================"
    echo ""

    # Python HTTPS server
    python3 << PYEOF
import http.server
import ssl

class CORSHandler(http.server.SimpleHTTPRequestHandler):
    def end_headers(self):
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Permissions-Policy', 'camera=*, microphone=*')
        super().end_headers()

server = http.server.HTTPServer(('0.0.0.0', $PORT), CORSHandler)
context = ssl.SSLContext(ssl.PROTOCOL_TLS_SERVER)
context.load_cert_chain('$CERT_FILE', '$KEY_FILE')
server.socket = context.wrap_socket(server.socket, server_side=True)
print(f"Serving HTTPS on 0.0.0.0 port $PORT...")
server.serve_forever()
PYEOF

else
    # HTTP Mode for laptop only
    echo "✅ HTTP Server (Laptop only)"
    echo "============================"
    echo ""
    echo "💻 Open: http://localhost:$PORT"
    echo ""
    echo "💡 For mobile testing, run: ./start_server.sh --https"
    echo ""
    echo "Press Ctrl+C to stop the server"
    echo "============================================"
    echo ""

    python3 -m http.server $PORT
fi
