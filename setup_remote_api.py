#!/usr/bin/env python3
"""
Quick setup script to configure remote API for demo-app
"""

import sys
import re
from pathlib import Path

def validate_url(url):
    """Validate API URL format"""
    pattern = r'https?://[\w\-.]+(:\d+)?(/.*)?'
    return re.match(pattern, url) is not None

def update_demo_config(api_url, api_key):
    """Update demo-config.js with new API URL and key"""
    config_file = Path(__file__).parent / 'static/js/demo-config.js'
    
    if not config_file.exists():
        print(f"❌ Error: {config_file} not found!")
        return False
    
    # Read current config
    content = config_file.read_text()
    
    # Update API URL
    content = re.sub(
        r"apiBaseUrl:\s*window\.QUANTAROUTE_API_URL\s*\|\|\s*'[^']*'",
        f"apiBaseUrl: window.QUANTAROUTE_API_URL || '{api_url}'",
        content
    )
    
    # Update API key
    content = re.sub(
        r"apiKey:\s*window\.QUANTAROUTE_API_KEY\s*\|\|\s*'[^']*'",
        f"apiKey: window.QUANTAROUTE_API_KEY || '{api_key}'",
        content
    )
    
    # Write back
    config_file.write_text(content)
    return True

def main():
    print("🔧 QuantaRoute Demo - Remote API Setup")
    print("=" * 60)
    print()
    
    # Get API URL
    print("📍 Step 1: Enter your deployed API URL")
    print("   ⚠️  Important: Use /v1 endpoint for FastAPI")
    print()
    print("   ✅ Correct format:")
    print("      https://routing.api.quantaroute.com/v1 (Production)")
    print("      https://your-app.up.railway.app/v1 (Custom deployment)")
    print()
    print("   ❌ Incorrect (will be auto-corrected):")
    print("      https://routing.api.quantaroute.com/api/v1")
    print("      https://routing.api.quantaroute.com")
    print()
    
    api_url = input("   API URL: ").strip()
    
    if not api_url:
        print("❌ Error: API URL is required!")
        sys.exit(1)
    
    if not validate_url(api_url):
        print("❌ Error: Invalid URL format!")
        sys.exit(1)
    
    # Auto-correct URL format
    api_url = api_url.rstrip('/')
    if '/api/v1' in api_url:
        api_url = api_url.replace('/api/v1', '/v1')
        print(f"   ℹ️  Corrected to: {api_url}")
    elif '/api' in api_url and '/v1' not in api_url:
        api_url = api_url.replace('/api', '/v1')
        print(f"   ℹ️  Corrected to: {api_url}")
    elif not api_url.endswith('/v1'):
        api_url = f"{api_url}/v1"
        print(f"   ℹ️  Added /v1 endpoint: {api_url}")
    
    # Get API Key
    print()
    print("🔑 Step 2: Enter your API key")
    print("   Authentication: Authorization: Bearer <token>")
    print("   (Press Enter to use demo key)")
    print()
    
    api_key = input("   API Key [demo_enterprise_api_key_quantaroute_2024]: ").strip()
    
    if not api_key:
        api_key = "demo_enterprise_api_key_quantaroute_2024"
        print("   ✅ Using demo key...")
    
    # Update configuration
    print()
    print("⚙️  Updating configuration...")
    
    if update_demo_config(api_url, api_key):
        print("✅ Configuration updated successfully!")
        print()
        print("📝 Summary:")
        print(f"   API URL: {api_url}")
        print(f"   API Key: {api_key[:20]}...")
        print(f"   Auth Method: Bearer Token")
        print(f"   Trailing Slashes: Auto-added for FastAPI")
        print()
        print("🚀 Next steps:")
        print("   1. Start the demo: python start_simple_demo.py")
        print("   2. Open browser: http://localhost:8000")
        print("   3. Click 'Switch to Remote' to use production API")
        print("   4. Or open: http://localhost:8000?mode=remote")
        print()
        print("🔄 To switch back to local mode:")
        print("   - Click 'Switch to Local' in the browser")
        print("   - Or add ?mode=local to URL")
        print()
        print("📊 Expected API calls (Remote mode):")
        print(f"   POST {api_url}/routing/")
        print(f"   POST {api_url}/routing/alternatives/")
        print(f"   Headers: Authorization: Bearer {api_key[:20]}...")
        print()
    else:
        print("❌ Error: Failed to update configuration!")
        sys.exit(1)

if __name__ == "__main__":
    main()

