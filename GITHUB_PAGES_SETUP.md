# 🚀 GitHub Pages Deployment Guide

## 📋 Overview

Deploy your QuantaRoute demo to **GitHub Pages** with **remote API** backend. No local server needed!

**Live URL**: `https://mapdevsaikat.github.io/quantaroute-maps/`

---

## ✅ What's Already Configured

Your project is **ready for GitHub Pages** with these changes:

### 📁 File Structure
```
quantaroute-maps/
├── index.html                      # ✨ NEW: Redirect to /frontend/
├── .nojekyll                       # ✨ NEW: GitHub Pages config
├── frontend/
│   ├── index.html                  # ✅ Your full app (unchanged)
│   └── static/
│       ├── css/demo.css
│       └── js/
│           ├── demo.js
│           ├── demo-config.js      # ✨ UPDATED: Auto-detects GitHub Pages
│           └── exploration_visualizer.js
├── .gitignore                      # ✨ NEW: Ignores logs, etc.
└── README.md
```

### 🔧 Configuration Updates

1. **Root `index.html`**: Auto-redirects visitors to `/frontend/`
2. **`.nojekyll`**: Allows GitHub Pages to serve all files properly
3. **`demo-config.js`**: Auto-detects GitHub Pages and uses remote API
4. **`.gitignore`**: Prevents committing logs and temp files

---

## 🌐 Step-by-Step Deployment

### **Step 1: Commit Your Changes**

```bash
# Check what's changed
git status

# Add all files
git add .

# Commit
git commit -m "Configure for GitHub Pages with remote API"

# Push to GitHub
git push origin main
```

### **Step 2: Enable GitHub Pages**

1. Go to your repository: **https://github.com/mapdevsaikat/quantaroute-maps**

2. Click **Settings** (top menu)

3. Scroll down to **Pages** (left sidebar)

4. Under **Source**, select:
   - Branch: **main**
   - Folder: **/ (root)**

5. Click **Save**

6. Wait 1-2 minutes for deployment

7. Your site will be live at:
   ```
   https://mapdevsaikat.github.io/quantaroute-maps/
   ```

---

## 🔑 Remote API Configuration

### **Current Configuration**

Your app is configured to use the **QuantaRoute Cloud API**:

```javascript
// In static/js/demo-config.js
remote: {
    apiBaseUrl: 'https://routing.api.quantaroute.com/v1',
    apiKey: 'demo_enterprise_api_key_quantaroute_2024',
    authRequired: true,
    requiresTrailingSlash: true
}
```

### **API Endpoints Used**

| Endpoint | URL | Method |
|----------|-----|--------|
| Routing | `https://routing.api.quantaroute.com/v1/routing/` | POST |
| Alternatives | `https://routing.api.quantaroute.com/v1/routing/alternatives/` | POST |
| Health | `https://routing.api.quantaroute.com/health` | GET |
| Bounds | `https://routing.api.quantaroute.com/v1/bengaluru-bounds/` | GET |

### **Authentication**

All API requests include:
```
Authorization: Bearer demo_enterprise_api_key_quantaroute_2024
```

---

## ✅ How It Works

### **On GitHub Pages (Production)**
1. User visits: `https://mapdevsaikat.github.io/quantaroute-maps/`
2. Root `index.html` redirects to `/frontend/`
3. App detects **GitHub Pages** hostname
4. Automatically switches to **remote mode**
5. All routing powered by **QuantaRoute Cloud API**
6. **No backend server needed** ✨

### **On Localhost (Development)**
1. User visits: `http://localhost:3000/frontend/`
2. App detects **localhost** hostname
3. Uses **local mode** (if backend running)
4. Falls back to **remote mode** if no local backend

---

## 🎯 Testing Your Deployment

### **After GitHub Pages is enabled:**

1. **Visit your live site:**
   ```
   https://mapdevsaikat.github.io/quantaroute-maps/
   ```

2. **Open browser console** (F12)

3. **Check for:**
   ```
   🔧 QuantaRoute Demo Configuration: {
     mode: 'remote',
     displayName: '🌐 Production API',
     apiBaseUrl: 'https://routing.api.quantaroute.com/v1',
     authRequired: true
   }
   ```

4. **Test routing:**
   - Click on map to set start point (green marker)
   - Click again for destination (red marker)
   - Choose transport mode (🚗 🚲 🚶)
   - Click "Calculate Route"
   - See route with turn-by-turn directions!

---

## 🔄 Mode Switching

Your app supports **manual mode switching**:

### **Force Remote Mode:**
```
https://mapdevsaikat.github.io/quantaroute-maps/?mode=remote
```

### **Force Local Mode** (for testing localhost):
```
http://localhost:3000/frontend/?mode=local
```

### **Via Browser Console:**
```javascript
// Switch to remote
window.demoConfig.setMode('remote')

// Switch to local
window.demoConfig.setMode('local')
```

---

## 🛠️ Updating Your Live Site

Every time you push to GitHub, your site updates automatically:

```bash
# Make changes to your code
git add .
git commit -m "Update feature XYZ"
git push origin main

# Wait 1-2 minutes, then refresh your live site
```

---

## 🔧 Custom Domain (Optional)

Want to use your own domain? (e.g., `demo.quantaroute.com`)

1. Go to **Settings → Pages** on GitHub
2. Under **Custom domain**, enter: `demo.quantaroute.com`
3. Add DNS records at your domain provider:
   ```
   Type: CNAME
   Name: demo
   Value: mapdevsaikat.github.io
   ```
4. Enable **Enforce HTTPS** (recommended)

---

## 📊 Features Available on GitHub Pages

✅ **Full Navigation Interface**
- Interactive map (Bengaluru region)
- POI search functionality
- Multi-profile routing (car, bicycle, walking, motorcycle, transit)
- Alternative routes
- Turn-by-turn directions
- Elevation profiles

✅ **All Powered by Remote API**
- No backend server required
- Fast, reliable routing
- Professional API infrastructure
- Automatic authentication

✅ **Mobile Responsive**
- Works on phones and tablets
- Touch-friendly controls
- Responsive layout

---

## 🐛 Troubleshooting

### **Issue: Site shows 404**
- **Solution**: Wait 1-2 minutes after enabling Pages
- **Check**: GitHub Settings → Pages shows green checkmark

### **Issue: API requests failing**
- **Check Console**: Look for CORS errors
- **Verify API Key**: Make sure it's valid
- **Test API directly**:
  ```bash
  curl -H "Authorization: Bearer demo_enterprise_api_key_quantaroute_2024" \
       https://routing.api.quantaroute.com/health
  ```

### **Issue: Map not loading**
- **Check Console**: Look for JavaScript errors
- **Verify**: Leaflet CSS/JS loading correctly
- **Clear Cache**: Hard refresh (Ctrl+Shift+R)

### **Issue: Remote mode not activating**
- **Check Console**: Should show "mode: 'remote'"
- **Force Remote**: Add `?mode=remote` to URL
- **Clear localStorage**:
  ```javascript
  localStorage.clear()
  location.reload()
  ```

---

## 📝 Environment Variables (Not Needed for GitHub Pages)

GitHub Pages doesn't support backend environment variables, but your frontend JavaScript uses these defaults:

```javascript
// Hardcoded in demo-config.js (safe for frontend)
QUANTAROUTE_API_URL = 'https://routing.api.quantaroute.com/v1'
QUANTAROUTE_API_KEY = 'demo_enterprise_api_key_quantaroute_2024'
```

**Note**: API keys in frontend JavaScript are visible to users. The demo key has rate limits. For production with sensitive keys, use a backend proxy.

---

## 🎉 Success Checklist

- ✅ Code committed and pushed to GitHub
- ✅ GitHub Pages enabled (Settings → Pages)
- ✅ Site live at `https://mapdevsaikat.github.io/quantaroute-maps/`
- ✅ Root URL redirects to `/frontend/`
- ✅ App loads and shows map
- ✅ Console shows `mode: 'remote'`
- ✅ Can calculate routes using remote API
- ✅ Turn-by-turn directions working
- ✅ Alternative routes available

---

## 🚀 Next Steps

1. **Share your demo**: Send the GitHub Pages URL to anyone!
2. **No installation required**: Users just visit the URL
3. **Powered by cloud**: Fast, reliable routing via remote API
4. **Mobile-friendly**: Works on all devices

---

**🌟 Your QuantaRoute demo is now live on the internet! 🎉**

**Live URL**: https://mapdevsaikat.github.io/quantaroute-maps/

