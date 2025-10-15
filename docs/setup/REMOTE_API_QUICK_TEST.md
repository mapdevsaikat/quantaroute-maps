# 🚀 Quick Test Guide - Remote API Integration

## ⚡ **60-Second Test**

### **Step 1: Start the Demo (Local Mode)**

```bash
cd demo-app
python start_simple_demo.py
```

Wait for: `✅ Backend is ready!`

### **Step 2: Open Browser**

```
http://localhost:8000
```

You should see: **🏠 Local Demo** indicator in top-right

### **Step 3: Switch to Remote Mode**

Click the **"Switch to Remote"** button in the mode indicator

### **Step 4: Test Production API**

1. Click on map to set **start point** (green marker)
2. Click again to set **end point** (red marker)
3. Click **"Calculate Route"**
4. Route should be calculated using **production API**! ✅

## 🔍 **What to Look For**

### **✅ Success Indicators**

1. **Mode Indicator Shows**:
   ```
   🌐 Production API
   Using QuantaRoute Cloud API (routing.api.quantaroute.com)
   🔐 API Key: Active
   ```

2. **Console Shows**:
   ```javascript
   POST https://routing.api.quantaroute.com/v1/routing/
   Headers: Authorization: Bearer demo_enterprise_api_key_quantaroute_2024
   Status: 200 OK
   ```

3. **Network Tab Shows**:
   - Request URL: `https://routing.api.quantaroute.com/v1/routing/`
   - Status: **200 OK** (not 403 Forbidden)
   - Response: Real route data with turn-by-turn instructions

4. **Map Shows**:
   - Blue route line following actual Bengaluru streets
   - Distance and duration calculated by production API
   - Instructions panel with real turn-by-turn directions

### **❌ Failure Indicators**

If you see these, something is wrong:

1. **403 Forbidden**: Authentication issue (check Bearer token format)
2. **307 Redirect**: Missing trailing slash (should auto-add)
3. **CORS Error**: Wrong domain configuration
4. **Network Error**: Production API unreachable

## 🧪 **Test Both Modes**

### **Local Mode Test**

```
URL: http://localhost:8000?mode=local
Expected: 🏠 Local Demo
API: http://localhost:8000/api
Auth: None
```

Calculate a route → Should work with local backend ✅

### **Remote Mode Test**

```
URL: http://localhost:8000?mode=remote
Expected: 🌐 Production API
API: https://routing.api.quantaroute.com/v1
Auth: Bearer token
```

Calculate a route → Should work with production API ✅

## 📊 **Expected API Calls**

### **Local Mode**

```http
POST http://localhost:8000/api/route
Content-Type: application/json

{
  "start": {"lat": 12.9716, "lon": 77.5946},
  "end": {"lat": 12.9365, "lon": 77.6910},
  "profile": "car"
}
```

### **Remote Mode**

```http
POST https://routing.api.quantaroute.com/v1/routing/
Authorization: Bearer demo_enterprise_api_key_quantaroute_2024
Content-Type: application/json

{
  "start": {"lat": 12.9716, "lon": 77.5946},
  "end": {"lat": 12.9365, "lon": 77.6910},
  "profile": "car"
}
```

**Notice the differences:**
- Remote: `/v1/routing/` (with trailing slash)
- Remote: `Authorization: Bearer <token>` header
- Local: `/api/route` (no trailing slash, no auth)

## 🎯 **Quick Troubleshooting**

### **Issue: 403 Forbidden in Remote Mode**

**Check:**
1. Browser console for auth header
2. Should see: `Authorization: Bearer demo_enterprise_api_key_quantaroute_2024`
3. NOT: `X-API-Key: ...`

**Fix:**
- Clear browser cache
- Hard reload (Cmd+Shift+R / Ctrl+Shift+F5)
- Check `demo-config.js` for correct `getHeaders()` method

### **Issue: Route Not Calculating**

**Check:**
1. Backend console for errors
2. Network tab for failed requests
3. Mode indicator showing correct API

**Fix:**
- Restart backend: `python start_simple_demo.py`
- Check internet connection (for remote mode)
- Try switching modes

### **Issue: Mode Not Switching**

**Check:**
1. localStorage in browser dev tools
2. Key: `quantaroute_demo_mode`
3. Value: `local` or `remote`

**Fix:**
- Clear localStorage
- Reload page
- Try URL parameter: `?mode=remote`

## 🔄 **Testing Checklist**

- [ ] Local mode works (calculate route)
- [ ] Remote mode works (calculate route)
- [ ] Mode switching works (button click)
- [ ] Mode indicator shows correct info
- [ ] Auth header correct in remote mode (Bearer token)
- [ ] Trailing slashes added in remote mode
- [ ] localStorage saves preference
- [ ] Page reload maintains mode
- [ ] URL parameter overrides mode
- [ ] Both single and alternative routes work

## 🎉 **Success Criteria**

When everything works, you should be able to:

1. ✅ Start demo in local mode
2. ✅ Calculate routes using localhost backend
3. ✅ Click "Switch to Remote"
4. ✅ Calculate routes using production API
5. ✅ Refresh page → still in remote mode
6. ✅ Click "Switch to Local"
7. ✅ Calculate routes using localhost again
8. ✅ Close browser → reopen → mode persists

**All working? You're ready to deploy! 🚀**

## 📝 **Next Steps**

1. **For Local Development**: Keep testing with local mode
2. **For Production**: Deploy frontend to Vercel/Netlify
3. **For Users**: Set default mode to `remote` in deployed version
4. **For Monitoring**: Track API usage via dashboard

See `DEPLOYMENT_QUICK_REFERENCE.md` for deployment instructions!

