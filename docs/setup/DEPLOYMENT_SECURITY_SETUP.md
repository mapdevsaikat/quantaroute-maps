# 🔐 Secure API Key Deployment Setup

This guide shows how to securely deploy your demo app to GitHub Pages with a **masked API key** that won't be exposed in your source code.

---

## 🎯 Overview

**Problem:** API keys should not be committed to public repositories  
**Solution:** Use GitHub Secrets to inject the API key during deployment

### How It Works:
1. ✅ Your source code contains **dummy/placeholder** API key
2. ✅ GitHub Actions reads **real API key** from GitHub Secrets  
3. ✅ During deployment, real key is injected into `api-config.js`
4. ✅ Real key is **never in your repository**, only in deployed site

---

## 📋 Setup Steps

### **Step 1: Add API Key to GitHub Secrets**

1. Go to your GitHub repository
2. Navigate to: **Settings** → **Secrets and variables** → **Actions**
3. Click **"New repository secret"**
4. Add the secret:
   ```
   Name: QUANTAROUTE_API_KEY
   Value: <your_actual_production_api_key>
   ```
5. Click **"Add secret"**

### **Step 2: Verify GitHub Actions Workflow**

The workflow file `.github/workflows/deploy.yml` is already set up. It will:
- ✅ Automatically trigger on pushes to `main` branch
- ✅ Read the API key from GitHub Secrets
- ✅ Inject it into `api-config.js` during build
- ✅ Deploy to GitHub Pages

### **Step 3: Enable GitHub Pages**

1. Go to: **Settings** → **Pages**
2. Under **Source**, select: **GitHub Actions**
3. Click **Save**

### **Step 4: Push Your Changes**

```bash
git add .
git commit -m "Add secure API key deployment"
git push origin main
```

The GitHub Action will automatically:
- Build the site
- Inject the real API key from secrets
- Deploy to GitHub Pages

---

## 🔍 How to Verify

### Check the Deployment:

1. Go to **Actions** tab in your GitHub repository
2. You should see a workflow run called "Deploy to GitHub Pages"
3. Click on it to see the build logs
4. Once complete, visit your GitHub Pages URL

### Check the API Configuration:

Open browser console on your deployed site and run:

```javascript
// Should show: "remote" mode with production API
console.log(window.demoConfig.getDisplayInfo());

// API key should be present (but keep it private!)
console.log('API Key loaded:', !!window.QUANTAROUTE_API_KEY);
```

---

## 📁 File Structure

```
demo-app/
├── .github/
│   └── workflows/
│       └── deploy.yml          # ✅ GitHub Actions workflow
├── api-config.js               # Dummy key (committed to repo)
├── frontend/
│   └── index.html             # Loads api-config.js first
└── static/
    └── js/
        └── demo-config.js     # Uses window.QUANTAROUTE_API_KEY
```

### What's Committed vs Deployed:

| File | In Repository | In Deployment |
|------|---------------|---------------|
| `api-config.js` | Dummy key | ✅ Real key (from secrets) |
| `.github/workflows/deploy.yml` | ✅ Yes | N/A |
| Other files | ✅ Yes | ✅ Yes |

---

## 🔄 Workflow Diagram

```
┌─────────────────┐
│  Push to main   │
└────────┬────────┘
         │
         ▼
┌─────────────────────────────┐
│  GitHub Actions Triggered   │
└────────┬────────────────────┘
         │
         ▼
┌─────────────────────────────────────┐
│  Read QUANTAROUTE_API_KEY secret    │
└────────┬────────────────────────────┘
         │
         ▼
┌──────────────────────────────────────┐
│  Create api-config.js with real key  │
└────────┬─────────────────────────────┘
         │
         ▼
┌─────────────────────┐
│  Build & Deploy     │
└────────┬────────────┘
         │
         ▼
┌──────────────────────────────┐
│  Site live on GitHub Pages   │
│  with real API key            │
└───────────────────────────────┘
```

---

## 🔐 Security Features

### ✅ What's Protected:
- Real API key is **only** in GitHub Secrets
- Key is **not** in git history
- Key is **not** in source code
- Key is **not** visible in public repository

### ⚠️ Important Notes:

1. **Client-Side Limitation:**  
   The API key **will be visible** in browser DevTools after deployment. This is unavoidable for client-side apps. To fully protect it, you'd need a backend proxy.

2. **GitHub Secrets Security:**  
   - Only repository admins can view/edit secrets
   - Secrets are encrypted at rest
   - Not exposed in workflow logs

3. **Best Practice:**  
   Use an API key that has:
   - Rate limiting enabled
   - Domain restrictions (if supported)
   - Monitoring/alerts for unusual usage

---

## 🔄 Updating the API Key

If you need to change the API key:

1. Go to **Settings** → **Secrets and variables** → **Actions**
2. Click on **QUANTAROUTE_API_KEY**
3. Click **"Update secret"**
4. Enter new value and save
5. Re-run the deployment:
   - Go to **Actions** tab
   - Click on latest workflow
   - Click **"Re-run all jobs"**

---

## 🧪 Testing Locally

For local development, the app uses the dummy key from `api-config.js`:

```bash
# Start local server
python start_demo.py

# Open http://localhost:3000
# App will use dummy key for testing
```

Console will show:
```
🔧 Local development mode - using dummy API key
```

---

## 🚨 Troubleshooting

### Deployment fails:

**Check:**
- Secret name is exactly: `QUANTAROUTE_API_KEY` (case-sensitive)
- Workflow file is in: `.github/workflows/deploy.yml`
- GitHub Pages is enabled with source: "GitHub Actions"

### API calls fail on deployed site:

**Check:**
1. Browser console for errors
2. Network tab for API calls
3. Verify API key is loaded:
   ```javascript
   console.log('Key exists:', !!window.QUANTAROUTE_API_KEY);
   ```

### Still using localhost API:

**Check:**
- URL should be `https://your-username.github.io/...`
- Console should show: `mode: "remote"`
- If showing `mode: "local"`, clear localStorage:
   ```javascript
   localStorage.removeItem('quantaroute_demo_mode');
   location.reload();
   ```

---

## 📚 Additional Resources

- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [GitHub Secrets Documentation](https://docs.github.com/en/actions/security-guides/encrypted-secrets)
- [GitHub Pages Documentation](https://docs.github.com/en/pages)

---

## ✅ Checklist

Before deploying:

- [ ] API key added to GitHub Secrets as `QUANTAROUTE_API_KEY`
- [ ] GitHub Pages enabled with source: "GitHub Actions"
- [ ] `.github/workflows/deploy.yml` exists in repository
- [ ] `api-config.js` loads before `demo-config.js` in HTML
- [ ] Committed and pushed all changes
- [ ] Verified workflow runs successfully in Actions tab
- [ ] Tested deployed site at GitHub Pages URL
- [ ] Confirmed API calls work on deployed site

---

**Status:** ✅ **Ready for Secure Deployment**

Your API key will be masked in the repository and only exist in:
1. GitHub Secrets (encrypted)
2. Deployed site (not in git history)

