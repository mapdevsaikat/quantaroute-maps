# 📚 Demo App Documentation

Welcome to the QuantaRoute Demo App documentation! This folder contains all documentation related to the demo application.

---

## 🚀 Quick Start

**New to the demo app?** Start here:

1. **[00_REMOTE_API_START_HERE.md](setup/00_REMOTE_API_START_HERE.md)** - Connect demo to production API
2. **[00_DUAL_MODE_START_HERE.md](setup/00_DUAL_MODE_START_HERE.md)** - Local + Remote modes
3. **[DEMO_INSTRUCTIONS.md](setup/DEMO_INSTRUCTIONS.md)** - How to use the demo

---

## 📁 Documentation Structure

### **[setup/](setup/)** - Setup & Configuration
Everything you need to get the demo app running:
- `00_REMOTE_API_START_HERE.md` - Connect to production API (recommended)
- `00_DUAL_MODE_START_HERE.md` - Local + Remote dual mode setup
- `00_START_HERE.md` - Original local setup guide
- `REMOTE_API_QUICK_TEST.md` - Quick API connection test
- `REMOTE_API_VISUAL_GUIDE.md` - Visual setup guide with screenshots
- `DUAL_MODE_SETUP.md` - Detailed dual mode configuration
- `INTEGRATION_GUIDE.md` - Integration with other systems
- `DEMO_INSTRUCTIONS.md` - User instructions for the demo

### **[deployment/](deployment/)** - Deployment Guides
Deploy the demo app to production:
- `DEPLOYMENT_STRATEGY.md` - Overall deployment strategy
- `DEPLOYMENT_QUICK_REFERENCE.md` - Quick deployment commands
- `QUICK_DEPLOYMENT_GUIDE.md` - Step-by-step deployment
- `ARCHITECTURE_AND_DEPLOYMENT.md` - Architecture overview

### **[fixes/](fixes/)** - Historical Fixes
Documentation of bugs fixed during development:
- Alternative routes fixes
- Backend startup fixes
- Frontend fixes
- Routing issue solutions
- Toggle enhancements
- Turn-by-turn navigation fixes
- Waypoints fixes

### **[archived/](archived/)** - Reference & Archives
Old documentation kept for reference:
- Algorithm verification
- Bengaluru reconfiguration
- Map matching improvements
- Profile fixes
- Navigation guides

---

## 🗂️ File Organization

### **Root Level Files:**
```
demo-app/
├── README.md              # Main demo app readme
├── config.env.example     # Configuration template
├── requirements.txt       # Python dependencies
├── setup_remote_api.py    # Remote API setup script
├── start_simple_demo.py   # Start the demo
└── start-demo.sh          # Start script
```

### **Application Files:**
```
demo-app/
├── backend/               # Backend application
│   └── real_routing_app.py
├── frontend/              # Frontend application
│   └── index.html
├── static/                # Static assets
│   ├── css/
│   └── js/
└── tests/                 # All test files
```

---

## 🎯 Common Tasks

### **Connect to Production API**
```bash
python setup_remote_api.py
```
Follow: [REMOTE_API_START_HERE](setup/00_REMOTE_API_START_HERE.md)

### **Run Demo Locally**
```bash
python start_simple_demo.py
```
Follow: [DEMO_INSTRUCTIONS](setup/DEMO_INSTRUCTIONS.md)

### **Deploy to Production**
Follow: [DEPLOYMENT_QUICK_REFERENCE](deployment/DEPLOYMENT_QUICK_REFERENCE.md)

### **Run Tests**
```bash
cd tests
pytest test_basic_routing.py
```

---

## 🔗 Related Documentation

- **Main API Docs**: `/docs/api/` - QuantaRoute API documentation
- **Deployment Guides**: `/docs/deployment/` - Full deployment documentation
- **Main README**: `/README.md` - Project root documentation

---

## 📝 Notes

- **Setup docs** are for getting started
- **Deployment docs** are for production deployment
- **Fixes docs** are historical (bugs already fixed)
- **Archived docs** are old references (may be outdated)

---

**Last Updated**: October 2025  
**Maintained By**: QuantaRoute Team

For questions or issues, see the main project README or open an issue.

