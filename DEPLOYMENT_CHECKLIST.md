# ✅ GitHub Pages Deployment Checklist

## Quick Deployment Steps

### 1️⃣ Commit and Push (5 minutes)

```bash
# Check status
git status

# Add all files
git add .

# Commit with message
git commit -m "Deploy to GitHub Pages with remote API"

# Push to GitHub
git push origin main
```

**Expected output:**
```
To github.com:mapdevsaikat/quantaroute-maps.git
   [hash]...[hash]  main -> main
```

---

### 2️⃣ Enable GitHub Pages (2 minutes)

1. Visit: https://github.com/mapdevsaikat/quantaroute-maps/settings/pages

2. Under **"Build and deployment"**:
   - **Source**: Deploy from a branch
   - **Branch**: `main`
   - **Folder**: `/ (root)`

3. Click **"Save"**

4. GitHub will show:
   ```
   ✅ Your site is live at https://mapdevsaikat.github.io/quantaroute-maps/
   ```

---

### 3️⃣ Wait for Deployment (1-2 minutes)

Watch for the deployment:
- Go to: https://github.com/mapdevsaikat/quantaroute-maps/actions
- You'll see a workflow running: **"pages build and deployment"**
- Wait for green checkmark ✅

---

### 4️⃣ Test Your Live Site (2 minutes)

1. **Visit**: https://mapdevsaikat.github.io/quantaroute-maps/

2. **Should see**: Redirect to `/frontend/` automatically

3. **Open Console** (F12 → Console tab)

4. **Verify remote mode**:
   ```javascript
   🔧 QuantaRoute Demo Configuration: {
     mode: 'remote',
     displayName: '🌐 Production API',
     apiBaseUrl: 'https://routing.api.quantaroute.com/v1'
   }
   ```

5. **Test routing**:
   - Click map → Green marker (start)
   - Click again → Red marker (destination)
   - Select mode (🚗 car)
   - Click "Calculate Route"
   - ✅ See route with directions!

---

## ✅ Verification Checklist

### Before Deployment
- [ ] All changes committed (`git status` shows clean)
- [ ] Latest code pushed to GitHub (`git push`)
- [ ] No sensitive data in code (API key is demo key)
- [ ] `.gitignore` in place (no logs committed)

### GitHub Pages Setup
- [ ] Settings → Pages accessed
- [ ] Branch set to `main`
- [ ] Folder set to `/ (root)`
- [ ] "Save" button clicked
- [ ] Green success message shown

### Deployment Status
- [ ] Actions tab shows workflow running
- [ ] Workflow completed successfully (green checkmark)
- [ ] No errors in workflow logs

### Live Site Testing
- [ ] URL accessible: `https://mapdevsaikat.github.io/quantaroute-maps/`
- [ ] Redirects to `/frontend/` automatically
- [ ] Map loads correctly
- [ ] Console shows `mode: 'remote'`
- [ ] Can set start/end points on map
- [ ] Route calculation works
- [ ] Turn-by-turn directions display
- [ ] Alternative routes available
- [ ] Mobile responsive (test on phone)

### API Connectivity
- [ ] Health check succeeds
- [ ] Routing requests work
- [ ] Alternative routes work
- [ ] No CORS errors in console
- [ ] Authorization header sent correctly

---

## 🐛 Quick Troubleshooting

### Site shows 404
- **Wait**: Give it 2-3 minutes after enabling Pages
- **Check**: Actions tab for deployment status
- **Verify**: Settings → Pages shows green success

### Map not loading
- **Hard refresh**: Ctrl+Shift+R (or Cmd+Shift+R on Mac)
- **Check Console**: Look for JavaScript errors
- **Verify**: Network tab shows resources loading

### API not working
- **Check Console**: Look for API error messages
- **Verify URL**: Should use `https://routing.api.quantaroute.com/v1`
- **Test manually**:
  ```bash
  curl -H "Authorization: Bearer demo_enterprise_api_key_quantaroute_2024" \
       https://routing.api.quantaroute.com/health
  ```

### Wrong mode (showing local instead of remote)
- **Force remote**: Add `?mode=remote` to URL
- **Clear storage**: 
  ```javascript
  localStorage.clear()
  location.reload()
  ```

---

## 🔄 Future Updates

To update your live site:

```bash
# 1. Make changes to code
# 2. Commit
git add .
git commit -m "Update: description of changes"

# 3. Push
git push origin main

# 4. Wait 1-2 minutes
# 5. Hard refresh your browser (Ctrl+Shift+R)
```

---

## 📊 Expected Timeline

| Step | Time |
|------|------|
| Commit & Push | 1 min |
| Enable GitHub Pages | 1 min |
| GitHub Deployment | 1-2 min |
| DNS Propagation | Instant |
| Testing | 2 min |
| **Total** | **5-7 minutes** |

---

## 🎉 Success!

When everything works:

✅ Live URL: https://mapdevsaikat.github.io/quantaroute-maps/  
✅ Routing powered by remote API  
✅ No backend server needed  
✅ Mobile responsive  
✅ Share with anyone!

---

**Need help?** Check `GITHUB_PAGES_SETUP.md` for detailed instructions.

