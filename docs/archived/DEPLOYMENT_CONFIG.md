# 🌐 Demo App Deployment Configuration

**Auto-Detection of Local vs Production API**

---

## ✅ How It Works

Your frontend (`demo-config.js`) **automatically detects** the environment:

### 🏠 **Local Development**
When running on `localhost` or `127.0.0.1`:
```javascript
apiBaseUrl: 'http://localhost:8080/v1'
```

### 🌐 **Production Deployment**
When deployed (GitHub Pages, Vercel, Netlify, etc.):
```javascript
apiBaseUrl: 'https://routing.api.quantaroute.com/v1'
```

**Auto-detection logic:**
- Checks `window.location.hostname`
- If `localhost` or `127.0.0.1` → uses local API
- If any other domain (github.io, your-domain.com) → uses production API

---

## 🔧 Setting Your Production API URL

### **Option 1: Environment Variable (Recommended)**

Set the production API URL via environment variable before deployment:

```javascript
// In demo-config.js (line 64):
apiBaseUrl: window.QUANTAROUTE_API_URL || 'https://routing.api.quantaroute.com/v1'
```

**For deployment platforms:**

#### **Vercel/Netlify:**
```bash
# .env.production
QUANTAROUTE_API_URL=https://your-api-domain.com/v1
```

#### **Docker:**
```bash
docker run -e QUANTAROUTE_API_URL=https://your-api-domain.com/v1 ...
```

#### **GitHub Pages:**
Add to your HTML before loading demo-config.js:
```html
<script>
  window.QUANTAROUTE_API_URL = 'https://your-api-domain.com/v1';
</script>
```

### **Option 2: Direct Configuration**

Edit `/Users/saikat.maiti/Documents/sssp/demo-app/static/js/demo-config.js`:

```javascript
remote: {
    apiBaseUrl: 'https://your-actual-api-domain.com/v1',  // ← Change this
    displayName: '🌐 Production API',
    description: 'Using QuantaRoute Production API',
    authRequired: true,
    apiKey: window.QUANTAROUTE_API_KEY || 'your_production_api_key',
    healthCheck: true
}
```

---

## 🎯 Current Configuration

### **Local Mode** (localhost testing):
```
API URL: http://localhost:8080/v1
API Key: demo_enterprise_api_key_quantaroute_2024
Health Check: http://localhost:8080/health
```

### **Remote Mode** (production deployment):
```
API URL: https://routing.api.quantaroute.com/v1  ← UPDATE THIS
API Key: Set via window.QUANTAROUTE_API_KEY or hardcode
Health Check: https://routing.api.quantaroute.com/health
```

---

## 🔐 API Key Configuration

### **For Production:**

You have two options:

#### **1. Environment Variable (Most Secure):**
```javascript
// Set before page loads
window.QUANTAROUTE_API_KEY = 'your_production_api_key_here';
```

#### **2. Hardcode (Less Secure):**
```javascript
// In demo-config.js line 68
apiKey: 'your_production_api_key_here',
```

**⚠️ Security Note:** 
- For public demos, use a limited demo API key
- For internal apps, use environment variables
- Never commit production API keys to git

---

## 🧪 Testing Mode Switching

### **Manual Mode Override:**

You can force a specific mode using URL parameters:

```
# Force local mode (even when deployed)
https://your-demo-site.com/?mode=local

# Force remote mode (even on localhost)
http://localhost:3000/?mode=remote
```

### **JavaScript Console:**

```javascript
// Check current mode
console.log(window.demoConfig.getDisplayInfo());

// Switch to remote mode
window.demoConfig.setMode('remote');

// Switch to local mode
window.demoConfig.setMode('local');
```

---

## 📋 Pre-Deployment Checklist

Before deploying to production:

- [ ] **Set Production API URL** in `demo-config.js` line 64
- [ ] **Set Production API Key** (via environment or hardcode)
- [ ] **Test Remote Mode** locally: `http://localhost:3000/?mode=remote`
- [ ] **Verify API Endpoints**:
  - `/health` - Health check
  - `/v1/routing/` - Basic routing
  - `/v1/routing/alternatives` - Alternative routes
  - `/v1/routing/turn-by-turn` - Turn-by-turn directions
- [ ] **Test CORS Settings** on production API
- [ ] **Update README** with production URL

---

## 🚀 Deployment Examples

### **Example 1: GitHub Pages**

1. Update `demo-config.js`:
```javascript
apiBaseUrl: 'https://api.your-domain.com/v1',
```

2. Deploy to GitHub Pages:
```bash
git add demo-app/
git commit -m "Deploy demo with production API"
git push origin main
```

3. Enable GitHub Pages in repository settings

### **Example 2: Vercel**

1. Create `vercel.json` in demo-app/:
```json
{
  "env": {
    "QUANTAROUTE_API_URL": "https://api.your-domain.com/v1",
    "QUANTAROUTE_API_KEY": "@quantaroute-api-key"
  }
}
```

2. Deploy:
```bash
cd demo-app
vercel deploy --prod
```

### **Example 3: Netlify**

1. Create `netlify.toml` in demo-app/:
```toml
[build.environment]
  QUANTAROUTE_API_URL = "https://api.your-domain.com/v1"
```

2. Deploy:
```bash
netlify deploy --prod --dir=demo-app
```

### **Example 4: Docker + AWS**

```dockerfile
FROM nginx:alpine
COPY demo-app/ /usr/share/nginx/html/
ENV QUANTAROUTE_API_URL=https://api.your-aws-domain.com/v1
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

---

## 🔍 Debugging

### **Check Current Configuration:**

Open browser console on your demo page:

```javascript
// View current config
console.log(window.demoConfig.getDisplayInfo());

// Test API health
window.demoConfig.checkHealth().then(console.log);

// View all headers being sent
console.log(window.demoConfig.getHeaders());
```

### **Common Issues:**

**Issue:** Demo uses localhost even when deployed
- **Fix:** Check `window.location.hostname` detection in `demo-config.js:23-25`

**Issue:** API calls fail with CORS errors
- **Fix:** Ensure production API has CORS enabled for your demo domain

**Issue:** 401 Unauthorized errors
- **Fix:** Verify API key is set correctly via `window.QUANTAROUTE_API_KEY`

---

## ✅ Summary

Your demo app is **already configured** for dual-mode operation:

| Environment | API URL | Auto-Detected |
|-------------|---------|---------------|
| **Local Testing** | `http://localhost:8080/v1` | ✅ Yes |
| **Production** | `https://routing.api.quantaroute.com/v1` | ✅ Yes |

**Next Steps:**
1. Update production API URL in `demo-config.js` line 64
2. Set production API key
3. Test with `?mode=remote` parameter
4. Deploy to your hosting platform

**No manual switching needed** - the frontend automatically detects the environment! 🎉

---

**Last Updated:** October 19, 2025

