# 🎯 START HERE: Dual Mode Demo Setup

## What's New? 🆕

Your QuantaRoute demo now supports **TWO MODES**:

| Mode | Description | Use Case |
|------|-------------|----------|
| **🏠 Local** | Runs on localhost with local data | Development, testing, offline demos |
| **🌐 Remote** | Connects to your deployed production API | Client demos, public access, sharing |

**Switch between modes with ONE CLICK** in the browser! 🔄

---

## ⚡ Quick Start

### Option 1: Local Mode (Default)

```bash
cd /Users/saikat.maiti/Documents/sssp/demo-app
python start_demo.py
open http://localhost:8000
```

**Done!** You're running the full demo with real Bengaluru routing.

---

#### 2. Configure Demo

```bash
cd demo-app
python start_demo.py

# Enter your API URL when prompted
# Enter your API key (or use demo key)
```

#### 3. Start and Switch

```bash
python start_demo.py
open http://localhost:8000?mode=remote
```

**Or:** Click the mode indicator in the top-right corner to switch!

---

## 🎨 How It Looks

### Mode Indicator (Top-Right Corner)

**Local Mode:**
```
┌─────────────────────────────┐
│ 🏠 Local Demo              │
│ Using localhost:8000        │
│ [Switch to Remote]          │
└─────────────────────────────┘
```

**Remote Mode:**
```
┌─────────────────────────────┐
│ 🌐 Production API          │
│ Using deployed API          │
│ 🔐 API Key: Active         │
│ [Switch to Local]           │
└─────────────────────────────┘
```

---

## 📚 Documentation Index

| Document | What It Contains | When to Read |
|----------|------------------|--------------|
| **This File** | Quick start | Read first (5 min) |
| `INTEGRATION_GUIDE.md` | Complete overview | For understanding architecture (15 min) |
| `DUAL_MODE_SETUP.md` | Detailed setup | For configuration help (10 min) |
| `config.env.example` | Environment variables | For advanced config (5 min) |

---

## 🎯 Common Scenarios

### Scenario 1: "I want to test locally"

```bash
python start_demo.py
# That's it! Opens at http://localhost:8000
```

### Scenario 2: "I want to share with my team"

```bash
# 1. Deploy API
railway up

# 2. Configure remote mode
python setup_remote_api.py

# 3. Share link
# Team opens: http://localhost:8000?mode=remote
# (They need to run demo locally too)
```

### Scenario 3: "I want a public demo"

```bash
# 1. Deploy API
railway up

# 2. Deploy demo UI to Vercel/Netlify
vercel deploy

# 3. Share public URL
# https://your-demo.vercel.app?mode=remote
```

### Scenario 4: "I'm presenting offline"

```bash
# Use local mode (no internet needed after initial setup)
python start_demo.py
# Mode: 🏠 Local Demo
```

---

## 🔀 Switching Modes

### In Browser (Easiest)

1. Look at **top-right corner**
2. See current mode: 🏠 Local or 🌐 Remote
3. Click "Switch" button
4. Page reloads with new mode

### Via URL

```
http://localhost:8000?mode=local   # Force local mode
http://localhost:8000?mode=remote  # Force remote mode
```

### Via Console

```javascript
// Switch to remote
window.demoConfig.setMode('remote');

// Switch back to local
window.demoConfig.setMode('local');
```

---

## ✅ Verification

After setup, check:

1. **Start demo:** `python start_demo.py`
2. **Open browser:** http://localhost:8000
3. **Check indicator:** Should show 🏠 Local Demo
4. **Calculate route:** Click map twice, calculate route
5. **Switch mode:** Click "Switch to Remote"
6. **Verify remote:** Should show 🌐 Production API
7. **Test again:** Calculate another route

**Both modes should work!** ✅

---

## 🐛 Quick Troubleshooting

### "Cannot connect to backend"

**Local Mode:**
```bash
# Restart backend
python start_demo.py
```

**Remote Mode:**
```bash
# Check API is deployed
curl https://your-app.up.railway.app/health

# Reconfigure
python setup_remote_api.py
```

### "Mode not switching"

```javascript
// Clear and try again
localStorage.clear();
location.reload();
```

### "Routes not working"

1. Check status indicator (green dot = healthy)
2. Verify you're clicking in Bengaluru area
3. Try switching modes
4. Check browser console for errors

---

## 📊 What You Get

### Local Mode

- ✅ Full QuantaRoute routing engine
- ✅ Real Bengaluru OSM data (756K nodes)
- ✅ SSSP O(m·log^{2/3}n) algorithm
- ✅ No internet required (after setup)
- ✅ No rate limits
- ✅ Instant response (0.3-0.5s)

### Remote Mode

- ✅ Connects to production API
- ✅ API key authentication
- ✅ No local data loading needed
- ✅ Shareable with anyone
- ✅ Scalable for many users
- ✅ Professional deployment

---

## 🎓 Key Features

### 1. **Automatic Mode Detection**

- On localhost → defaults to Local mode
- On deployed URL → defaults to Remote mode
- Override with URL parameter or localStorage

### 2. **Seamless Switching**

- One click to switch modes
- Saved in localStorage (persists)
- No code changes needed

### 3. **Smart Authentication**

- Local mode: No auth required
- Remote mode: API key added automatically
- Configurable in `demo-config.js`

### 4. **Identical Experience**

- Same UI in both modes
- Same features available
- Same Bengaluru data
- Same SSSP algorithm

---

## 🚀 Next Steps

### For Development:
```bash
# Use local mode
python start_demo.py
# Develop, test, iterate
```

### For Sharing:
```bash
# Option 1: Share demo + API URL
# Users run demo locally in remote mode

# Option 2: Deploy demo UI too
vercel deploy
# Users access public URL
```

---

## 📁 Files Created

| File | Purpose |
|------|---------|
| `demo-config.js` | Configuration management |
| `setup_remote_api.py` | Quick setup script |
| `config.env.example` | Environment template |
| `INTEGRATION_GUIDE.md` | Complete guide |
| `DUAL_MODE_SETUP.md` | Detailed setup |
| `00_DUAL_MODE_START_HERE.md` | This file |

---

## 💡 Pro Tips

1. **For demos:** Keep both modes configured so you can switch if internet fails
2. **For development:** Use local mode (faster iteration)
3. **For sharing:** Use remote mode (no setup for others)
4. **For production:** Deploy both API and demo UI
5. **For security:** Never commit API keys to git

---

## ✨ Summary

**Before:** Demo only worked locally with hardcoded localhost URL  
**Now:** Demo works in TWO modes with one-click switching! 

**Local Mode:** ✅ Working (default)  
**Remote Mode:** ✅ Ready (configure API URL)  
**Switching:** ✅ One-click toggle  
**Documented:** ✅ Complete guides  

**You're ready to go!** 🚀

---

## 📞 Help

- **Quick questions:** See troubleshooting section above
- **Setup help:** Read `DUAL_MODE_SETUP.md`
- **Architecture:** Read `INTEGRATION_GUIDE.md`
- **Configuration:** Check `config.env.example`

**Start with:** 
```bash
python start_demo.py
```

**Happy routing!** 🗺️✨

