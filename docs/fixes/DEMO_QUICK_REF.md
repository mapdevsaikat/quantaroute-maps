# 📖 Demo.js Quick Reference

**For Developers working on QuantaRoute Demo App**

---

## 🎯 Key Files

- **Main:** `static/js/demo.js` (3,203 lines)
- **HTML:** `index.html`
- **CSS:** `static/css/demo.css`
- **Config:** `config.env.example`

---

## 🔧 Debug Mode

### Enable Debug Logging
```javascript
// Option 1: In code (line 34)
this.DEBUG_MODE = true;

// Option 2: In browser console
window.quantaRouteDemo.DEBUG_MODE = true;
```

### Disable Debug Logging (Production)
```javascript
this.DEBUG_MODE = false;  // Default
```

---

## 📝 Logging Best Practices

### Debug Logging (Development Only)
```javascript
// ✅ Use this.log() for debug info
this.log('📍 Debug info:', data);
this.log('✅ Success:', result);
```

### Error Logging (Always Show)
```javascript
// ✅ Use console.error() for errors
console.error('❌ Error:', error);
console.warn('⚠️ Warning:', warning);
```

### ❌ Don't Do This
```javascript
// ❌ Don't use console.log() directly
console.log('Debug info');  // This will always show!
```

---

## 🚀 Running the Demo

### Local Development
```bash
cd demo-app
python start_demo.py
# Open: http://localhost:8000
```

### With Real API
```bash
# Set environment variables in config.env
QUANTAROUTE_API_URL=https://api.example.com/v1
QUANTAROUTE_API_KEY=your_key_here

python start_demo.py
```

---

## 🧪 Testing Checklist

### Basic Features
- [ ] Map loads correctly
- [ ] Can set start/end points by clicking
- [ ] Route calculation works (car profile)
- [ ] Clear route button works

### Profile Testing
- [ ] Car routes work
- [ ] Bicycle routes work (with elevation)
- [ ] Foot routes work (with elevation)
- [ ] Motorcycle routes work

### Alternative Routes
- [ ] Toggle alternative routes on/off
- [ ] Select different algorithms
- [ ] Can select alternative routes
- [ ] Routes show correct colors
- [ ] Diversity metrics display

### Turn-by-Turn
- [ ] Floating directions panel shows
- [ ] Street names display correctly
- [ ] Instruction highlighting works
- [ ] Can minimize/expand panel

### Elevation Profiles
- [ ] Shows for bicycle mode
- [ ] Shows for foot mode
- [ ] Doesn't show for car/motorcycle
- [ ] Chart renders correctly
- [ ] Stats are accurate

### Mobile
- [ ] Sidebar toggle works
- [ ] FAB button works
- [ ] Map is responsive
- [ ] Controls are accessible

---

## 🐛 Common Issues

### Console is Noisy with Debug Logs
```javascript
// Solution: Disable debug mode
window.quantaRouteDemo.DEBUG_MODE = false;
```

### Elevation Chart Not Showing
- Check profile is bicycle or foot
- Check backend returns elevation_profile data
- Check browser console for errors

### Alternative Routes Not Working
- Check algorithm dropdown selection
- Check API response in Network tab
- Enable DEBUG_MODE to see detailed logs

### Street Names Missing
- Backend must return `name` field in instructions
- Check API response format
- Verify instruction enhancement logic

---

## 📊 File Structure

```
demo-app/
├── static/
│   ├── js/
│   │   └── demo.js          ← Main demo logic (3,203 lines)
│   └── css/
│       └── demo.css         ← Styling
├── index.html               ← Main HTML
├── start_demo.py            ← Demo server
├── config.env.example       ← Config template
└── README.md                ← Documentation
```

---

## 🔍 Code Navigation

### Key Classes
- `QuantaRouteDemo` - Main class (line 17)
- `DemoConfig` - Configuration helper (external)

### Key Methods
| Method | Purpose | Line |
|--------|---------|------|
| `calculateRoute()` | Main routing logic | ~2380 |
| `displayAlternativeRoutesResponse()` | Show alt routes | ~2568 |
| `showFloatingDirections()` | Turn-by-turn panel | ~1760 |
| `showElevationProfile()` | Elevation chart | ~974 |
| `generateEnhancedInstructions()` | Create instructions | ~1868 |

---

## 💡 Pro Tips

### Quick Debug
```javascript
// Enable debug for one session
window.quantaRouteDemo.DEBUG_MODE = true;

// Then calculate a route to see logs
```

### Test API Calls
```javascript
// Check API response
await window.quantaRouteDemo.apiCall('health')
    .then(r => r.json())
    .then(console.log);
```

### Inspect Current State
```javascript
const demo = window.quantaRouteDemo;
console.log('Profile:', demo.currentProfile);
console.log('Has route:', !!demo.routeLayer);
console.log('Alternatives:', demo.currentAlternatives?.length);
```

---

## 📞 Need Help?

1. **Check cleanup docs:** `DEMO_JS_CLEANUP_COMPLETE.md`
2. **Read cleanup plan:** `DEMO_JS_CLEANUP_PLAN.md`
3. **Enable debug mode** to see what's happening
4. **Check browser console** for errors
5. **Check Network tab** for API issues

---

**Last Updated:** October 22, 2025  
**File Version:** Production Ready (3,203 lines)

