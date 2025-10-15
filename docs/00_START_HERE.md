# 🚀 Demo App Documentation - Start Here

Welcome to the QuantaRoute Demo App! This guide will help you get started quickly.

---

## 🎯 Choose Your Path

### **🌐 Connect to Production API (Recommended)**
**Best for**: Testing the API without local setup

👉 **[00_REMOTE_API_START_HERE.md](setup/00_REMOTE_API_START_HERE.md)**

Quick start:
```bash
cd demo-app
python setup_remote_api.py
python start_simple_demo.py
```

### **🔄 Local + Remote Dual Mode**
**Best for**: Development with fallback to production

👉 **[00_DUAL_MODE_START_HERE.md](setup/00_DUAL_MODE_START_HERE.md)**

### **💻 Local Development Only**
**Best for**: Offline development

👉 **[setup/00_START_HERE.md](setup/00_START_HERE.md)**

---

## 📁 Documentation Structure

```
demo-app/docs/
├── 00_START_HERE.md           # You are here!
├── README.md                   # Full documentation index
│
├── setup/                      # Setup & Configuration
│   ├── 00_REMOTE_API_START_HERE.md    ⭐ Start here
│   ├── 00_DUAL_MODE_START_HERE.md
│   ├── DEMO_INSTRUCTIONS.md
│   ├── REMOTE_API_QUICK_TEST.md
│   └── ...
│
├── deployment/                 # Production Deployment
│   ├── DEPLOYMENT_STRATEGY.md
│   ├── DEPLOYMENT_QUICK_REFERENCE.md
│   └── ...
│
├── fixes/                      # Historical Bug Fixes
│   └── (bug fix summaries)
│
└── archived/                   # Old Documentation
    └── (reference only)
```

---

## 🚀 Quick Start (3 Steps)

### **Step 1: Configure Remote API**
```bash
cd /Users/saikat.maiti/Documents/sssp/demo-app
python setup_remote_api.py
```

### **Step 2: Start Demo**
```bash
python start_simple_demo.py
```

### **Step 3: Open Browser**
```
http://localhost:8080
```

**That's it!** 🎉

---

## 📖 Common Tasks

### **Setup & Configuration**
- [Connect to Production API](setup/00_REMOTE_API_START_HERE.md)
- [Dual Mode Setup](setup/00_DUAL_MODE_START_HERE.md)
- [Quick Test](setup/REMOTE_API_QUICK_TEST.md)
- [Visual Guide](setup/REMOTE_API_VISUAL_GUIDE.md)

### **Deployment**
- [Deployment Strategy](deployment/DEPLOYMENT_STRATEGY.md)
- [Quick Reference](deployment/DEPLOYMENT_QUICK_REFERENCE.md)
- [Architecture](deployment/ARCHITECTURE_AND_DEPLOYMENT.md)

### **Troubleshooting**
- Check [fixes/](fixes/) for historical issues
- See [archived/](archived/) for old references

---

## 🔑 Key Features

### **Production API Connection**
- ✅ No local data needed
- ✅ Real-time routing
- ✅ Traffic-aware routes
- ✅ Alternative routes
- ✅ Turn-by-turn navigation

### **Demo Features**
- 🗺️ Interactive map
- 📍 Click to route
- 🚗 Multiple vehicle profiles
- 🎨 Beautiful UI
- 📊 Route statistics

---

## 🆘 Need Help?

### **Quick Troubleshooting**

**Demo won't start?**
```bash
# Check Python version
python --version  # Should be 3.9+

# Install dependencies
pip install -r requirements.txt

# Try again
python start_simple_demo.py
```

**API connection fails?**
```bash
# Test API manually
curl https://routing.api.quantaroute.com/health

# Reconfigure
python setup_remote_api.py
```

**Map not loading?**
- Check browser console for errors
- Try a different browser
- Clear browser cache

---

## 📚 Full Documentation

For comprehensive documentation, see:
- **[README.md](README.md)** - Complete documentation index
- **[setup/](setup/)** - All setup guides
- **[deployment/](deployment/)** - Deployment guides

---

## 🔗 Related Resources

- **Main Project**: `/README.md`
- **API Docs**: `/docs/api/`
- **Production API**: `https://routing.api.quantaroute.com/docs`
- **Playground**: `https://routing.api.quantaroute.com/playground`

---

## 🎓 Learning Path

### **Beginner** (5 minutes)
1. Read this file
2. Run setup script
3. Start demo

### **Intermediate** (15 minutes)
1. Explore demo features
2. Test different routes
3. Try alternative routes

### **Advanced** (30+ minutes)
1. Read deployment guides
2. Customize demo
3. Deploy to production

---

**Ready to start?** 🚀

Choose your path above and follow the guide!

---

**Last Updated**: October 2025  
**Demo App Version**: 2.0  
**Maintained By**: QuantaRoute Team

