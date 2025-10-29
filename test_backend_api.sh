#!/bin/bash
# Test Backend API Configuration

API_URL="https://routing.api.quantaroute.com"
API_KEY="demo_key"

echo "🧪 Testing QuantaRoute Backend API"
echo "=================================="
echo ""

# Test 1: SSL Certificate
echo "1️⃣ Testing SSL Certificate..."
curl -I "$API_URL/health" 2>&1 | head -1
echo ""

# Test 2: Health Endpoint
echo "2️⃣ Testing Health Endpoint..."
curl -s -H "Authorization: Bearer $API_KEY" "$API_URL/health" | jq '.' || echo "Response not JSON or jq not installed"
echo ""

# Test 3: CORS Headers
echo "3️⃣ Testing CORS Headers..."
curl -s -I -H "Origin: https://mapdevsaikat.github.io" \
     -H "Authorization: Bearer $API_KEY" \
     "$API_URL/health" | grep -i "access-control"
echo ""

# Test 4: Bengaluru Bounds
echo "4️⃣ Testing Bengaluru Bounds Endpoint..."
curl -s -H "Authorization: Bearer $API_KEY" \
     "$API_URL/v1/bengaluru-bounds/" | jq '.' || echo "Endpoint not responding"
echo ""

# Test 5: OPTIONS Preflight
echo "5️⃣ Testing OPTIONS Preflight..."
curl -s -I -X OPTIONS \
     -H "Origin: https://mapdevsaikat.github.io" \
     -H "Access-Control-Request-Method: POST" \
     -H "Access-Control-Request-Headers: Content-Type, Authorization" \
     "$API_URL/v1/routing/" | grep -i "access-control"
echo ""

echo "✅ Tests Complete!"
echo ""
echo "Expected Results:"
echo "  1. SSL: Should show HTTP/2 200 or HTTP/1.1 200"
echo "  2. Health: Should return JSON with status"
echo "  3. CORS: Should show Access-Control-Allow-Origin header"
echo "  4. Bounds: Should return Bengaluru boundary coordinates"
echo "  5. OPTIONS: Should show CORS preflight headers"

