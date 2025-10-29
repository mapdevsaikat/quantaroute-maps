# 🔍 Debug Authorization Headers

## 📊 Debug Logging Added

I've added comprehensive debug logging to help diagnose the Authorization header issue.

---

## 🧪 How to Test

### **Step 1: Open Your App**
Visit: https://mapdevsaikat.github.io/quantaroute-maps/

### **Step 2: Open Browser Console**
- **Chrome/Edge**: Press `F12` or `Ctrl+Shift+J` (Windows) / `Cmd+Option+J` (Mac)
- **Firefox**: Press `F12` or `Ctrl+Shift+K`
- **Safari**: Enable Developer Menu → `Cmd+Option+C`

### **Step 3: Check Debug Logs**

Look for these logs in the console:

#### **1. Config Initialization** 🔧
```
🔧 DemoConfig initialized: {
  mode: "remote",
  apiBaseUrl: "https://routing.api.quantaroute.com/v1",
  authRequired: true,
  apiKey: "demo_enterprise_api_..."
}
```

**Expected Values:**
- `mode`: Should be `"remote"` (NOT `"local"`)
- `apiBaseUrl`: Should be `"https://routing.api.quantaroute.com/v1"`
- `authRequired`: Should be `true`
- `apiKey`: Should show first 20 characters of your API key

---

#### **2. Headers Generation** 🔑

**If Authorization header is added:**
```
✅ Authorization header added for remote mode
```

**If Authorization header is NOT added:**
```
⚠️ No Authorization header added: {
  mode: "local",
  authRequired: false,
  hasApiKey: false
}
```

**This tells you WHY the header wasn't added!**

---

#### **3. Health Check** 🏥
```
🏥 Checking health at: https://routing.api.quantaroute.com/health
🔑 Headers being sent: {
  Content-Type: "application/json",
  Authorization: "Bearer demo_enterprise_api_key_quantaroute_2024"
}
🌍 Current mode: remote
```

**What to check:**
- Health URL should NOT have `/v1` prefix
- Headers should include `Authorization` with `Bearer` token
- Mode should be `"remote"`

---

#### **4. API Calls (Routing, Alternatives)** 📡
```
📡 API Call to: routing
🔗 Full URL: https://routing.api.quantaroute.com/v1/routing/
🔑 Headers: {
  Content-Type: "application/json",
  Authorization: "Bearer demo_enterprise_api_key_quantaroute_2024"
}
🌍 Mode: remote
```

**What to check:**
- Full URL should have `/v1` prefix
- Headers should include `Authorization` with `Bearer` token
- Mode should be `"remote"`

---

## 🚨 Common Issues & Fixes

### **Issue 1: Mode is "local" instead of "remote"**

**Symptoms:**
```
🔧 DemoConfig initialized: {
  mode: "local",    ← WRONG!
  ...
}
```

**Cause:** You might be testing locally or mode detection failed

**Fix:** Force remote mode by adding to URL:
```
https://mapdevsaikat.github.io/quantaroute-maps/?mode=remote
```

Or open browser console and run:
```javascript
localStorage.setItem('quantaroute_demo_mode', 'remote');
location.reload();
```

---

### **Issue 2: No Authorization header**

**Symptoms:**
```
⚠️ No Authorization header added: {
  mode: "remote",
  authRequired: false,    ← WRONG!
  hasApiKey: false
}
```

**Cause:** Config is not detecting required values

**Fix:** Check `demo-config.js` line 52-61 for remote config

---

### **Issue 3: Headers not being sent**

**Symptoms:**
- Config shows correct values
- `getHeaders()` logs show Authorization added
- But backend still returns 401 Unauthorized

**Cause:** Browser might be blocking headers or CORS issue

**Fix:** 
1. Check Network tab in DevTools
2. Click on the failing request
3. Check "Request Headers" section
4. Verify `Authorization` header is present

---

## 📸 What to Share

If the issue persists, share these screenshots:

1. **Console logs** showing the 4 debug sections above
2. **Network tab** → Click on failing request → "Headers" tab
3. **Request Headers** section showing what was actually sent

---

## 🔧 Manual Test in Console

You can also manually test the config in browser console:

```javascript
// Check current config
console.log('Mode:', window.demoConfig.mode);
console.log('Config:', window.demoConfig.config);
console.log('Headers:', window.demoConfig.getHeaders());

// Force remote mode
localStorage.setItem('quantaroute_demo_mode', 'remote');
location.reload();

// Clear stored mode
localStorage.removeItem('quantaroute_demo_mode');
location.reload();
```

---

## ✅ Expected Console Output (Working Correctly)

When everything is working, you should see:

```
🔧 DemoConfig initialized: {
  mode: "remote",
  apiBaseUrl: "https://routing.api.quantaroute.com/v1",
  authRequired: true,
  apiKey: "demo_enterprise_api_..."
}

✅ Authorization header added for remote mode

🏥 Checking health at: https://routing.api.quantaroute.com/health
🔑 Headers being sent: {
  Content-Type: "application/json",
  Authorization: "Bearer demo_enterprise_api_key_quantaroute_2024"
}
🌍 Current mode: remote

✅ Server ready: {status: "healthy", message: "QuantaRoute API v1.0.0", ...}
```

---

## 🚀 Next Steps

After reviewing the console logs:

1. **If headers are being sent correctly** → Backend CORS or auth issue
2. **If headers are missing** → Share console logs for further debugging
3. **If mode is wrong** → Use fixes above to force remote mode

---

**Deployed:** ✅ Yes (commit `fd93514`)  
**Live in:** 1-2 minutes  
**Test at:** https://mapdevsaikat.github.io/quantaroute-maps/

Check your browser console and share what you see! 🔍

