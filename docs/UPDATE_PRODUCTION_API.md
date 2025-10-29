# 🚀 Update Production API URL - Quick Guide

**When you're ready to deploy, update this ONE line:**

---

## 📍 File to Edit

```
/Users/saikat.maiti/Documents/sssp/demo-app/static/js/demo-config.js
```

**Line 64:**

```javascript
apiBaseUrl: window.QUANTAROUTE_API_URL || 'https://routing.api.quantaroute.com/v1',
```

---

## ✏️ What to Change

### **Option 1: Update Default URL (Recommended)**

Change the fallback URL to your actual production API:

```javascript
// BEFORE:
apiBaseUrl: window.QUANTAROUTE_API_URL || 'https://routing.api.quantaroute.com/v1',

// AFTER:
apiBaseUrl: window.QUANTAROUTE_API_URL || 'https://your-actual-api.com/v1',
```

**Examples:**
```javascript
// AWS Deployment
apiBaseUrl: window.QUANTAROUTE_API_URL || 'https://api-prod.quantaroute.aws.com/v1',

// Azure Deployment
apiBaseUrl: window.QUANTAROUTE_API_URL || 'https://quantaroute-api.azurewebsites.net/v1',

// DigitalOcean
apiBaseUrl: window.QUANTAROUTE_API_URL || 'https://quantaroute-api.do.com/v1',

// Custom Domain
apiBaseUrl: window.QUANTAROUTE_API_URL || 'https://api.yourdomain.com/v1',
```

### **Option 2: Set Environment Variable**

Keep the code as-is and set the environment variable at deployment:

```bash
# Set this in your deployment platform
QUANTAROUTE_API_URL=https://your-actual-api.com/v1
```

---

## ✅ How Auto-Detection Works

The frontend automatically detects where it's running:

| Running On | Uses API |
|------------|----------|
| `localhost` or `127.0.0.1` | `http://localhost:8080/v1` |
| Any other domain | Your production URL |

**Example:**
- Testing locally: `http://localhost:3000` → uses `localhost:8080`
- Production: `https://demo.quantaroute.com` → uses production API
- GitHub Pages: `https://username.github.io/demo` → uses production API

---

## 🔑 Also Update API Key (Optional)

**Line 68:**

```javascript
apiKey: window.QUANTAROUTE_API_KEY || 'demo_enterprise_api_key_quantaroute_2024',
```

**For production:**
```javascript
apiKey: window.QUANTAROUTE_API_KEY || 'your_production_api_key_here',
```

---

## 🧪 Test Before Deploying

### **1. Test Remote Mode Locally**

Force your local demo to use production API:

```bash
# Open in browser with mode parameter
http://localhost:3000/?mode=remote
```

This tests the production API without deploying.

### **2. Verify in Console**

Open browser console:

```javascript
// Check which API it's using
console.log(window.demoConfig.getDisplayInfo());

// Expected output:
// {
//   mode: "remote",
//   apiBaseUrl: "https://your-actual-api.com/v1",
//   ...
// }
```

### **3. Test API Connectivity**

```javascript
// Run in browser console
window.demoConfig.checkHealth().then(result => {
    console.log('API Health:', result);
});
```

---

## 📋 Pre-Deploy Checklist

- [ ] Update production API URL (line 64)
- [ ] Update production API key (line 68) if needed
- [ ] Test with `?mode=remote` parameter locally
- [ ] Verify API returns data
- [ ] Check CORS settings on production API
- [ ] Verify health check endpoint works

---

## 🎯 That's It!

**You only need to update ONE line** (line 64) before deploying.

The frontend will automatically:
- ✅ Use localhost when testing locally
- ✅ Use production API when deployed
- ✅ Handle authentication with API keys
- ✅ Show appropriate error messages

---

**See `DEPLOYMENT_CONFIG.md` for detailed deployment guides.**

