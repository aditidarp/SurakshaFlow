# SurakshaFlow Disaster Alert & Rescue Dashboard

## 🎯 Overview
A full-width, professional-grade live disaster alert monitoring dashboard for India with a trustworthy public-service design inspired by official sources.

## ✨ Features Implemented

### 1. **Professional Government-Style Header**
- Blue gradient background (#003d82 to #0056b3)
- Shield icon (🛡️) with title and subtitle
- Navigation links: HOME, DASHBOARD, ABOUT, DO'S & DON'TS
- Sticky positioning for easy access while scrolling
- Responsive design for all screen sizes

### 2. **Alert Mode Selection Buttons**
Four large horizontal buttons with full styling:
- **Current Location CAP Alert** (📍 Location Pin Icon)
- **All India CAP Alert** (🎯 Target Icon) - Default active
- **State Wise CAP Alert** (⚠️ Warning Icon)
- **Forecast** (☁️ Cloud/Weather Icon)

Features:
- Blue borders with rounded corners
- Active state highlighting with gradient background
- Hover effects with smooth transitions
- Icons from react-icons library
- 4-column responsive grid layout

### 3. **Interactive Map (50 width)**
- Leaflet.js based map of India
- Centered on India coordinates (22.5°N, 80°E)
- Default zoom level: 5
- OpenStreetMap tile layer
- Zoom controls positioned at bottom-right

**Map Features:**
- **Custom Alert Markers** with colored icons:
  - 🟡 Yellow for Flood/Storm alerts
  - 🟠 Orange for Pre-Fire/Avalanche alerts
  - 🔴 Red for Earthquake alerts
- **Marker Clustering** enabled for handling multiple alerts
- **Interactive Popups** showing:
  - Alert Title
  - Alert Type
  - District Name
  - State Name
  - Severity Level (1-5)
  - Description
- Alert icons with circular design and white borders
- Box shadows for depth and visibility

### 4. **Alert List Sidebar (30% Width)**
- Fixed vertical panel with blue header gradient
- Title: "ALERT LIST" with active alert count badge
- Scrollable alert cards list

**Each Alert Card:**
- Color-coded background:
  - Yellow gradient for flood/storm alerts
  - Orange gradient for fire/avalanche alerts
  - Red gradient for earthquake alerts
- Left border accent matching alert type
- Alert type badge with severity color
- Severity badge (1-5 scale)
- Alert title as main heading
- District name (bold, prominent)
- State name (smaller, secondary)
- Description text (optional)
- Hover effects with smooth animations
- Custom scrollbar styling

### 5. **Floating UI Elements**
- **Social Media Icons** (Left side, fixed position):
  - Facebook icon linking to facebook.com
  - YouTube icon linking to youtube.com
  - Circular gradient background
  - Hover scale effect with enhanced shadow
  
- **Scroll to Top Button** (Right side, bottom):
  - Fixed position floating button
  - Arrow-up icon
  - Same gradient styling as social buttons
  - Smooth scroll animation when clicked

### 6. **Real-time Data Integration**
- **API Endpoint**: `/api/alerts` (GET)
- **Auto-refresh**: Every 30 seconds
- **Data Processing**:
  - Extracts coordinates from MongoDB location field
  - Maps alert types to color codes
  - Fallback to demo data if API unavailable
  - Error handling with user-friendly banner

**Demo Data Includes:**
- Himalayan avalanche alerts
- Pre-fire warnings in forest areas
- Flood warnings in major cities
- Thunderstorm alerts

### 7. **Responsive Design**
- **Desktop** (1200px+): Full two-column layout
- **Tablet** (768px-1199px): Stacked layout, sidebar hidden
- **Mobile** (below 768px): Single column, optimized spacing

### 8. **Professional Styling**
- **Color Scheme**:
  - Primary: #0056b3 (Government Blue)
  - Secondary: #003d82 (Dark Blue)
  - Alerts: Yellow (#facc15), Orange (#ff7a00), Red (#dc2626)
  - Background: Light gradient (#f0f4f8 to #e9ecef)

- **Typography**:
  - Clean, professional sans-serif fonts
  - Appropriate font weights and sizes
  - High contrast for accessibility

- **Effects**:
  - Smooth transitions (0.3s)
  - Subtle shadows for depth
  - Hover states on interactive elements
  - Loading states and error messages

## 📦 Dependencies

### New Package Installed:
```bash
npm install react-leaflet-markercluster
```

### Existing Packages Used:
- `react` & `react-dom` - UI framework
- `react-leaflet` - Map component binding
- `leaflet` - Mapping library
- `react-icons` (fa6 & fa) - Icon library
- `axios` - HTTP requests

## 🎨 File Structure

```
frontend/src/components/
├── AllIndiaAlerts.jsx      # Main dashboard component
├── AllIndiaAlerts.css      # Professional styling
└── DASHBOARD_FEATURES.md   # This documentation
```

## 🚀 How to Access

1. **Navigate to the dashboard:**
   - URL: `http://localhost:3000/all-india-alerts`
   - Or from navigation menu: Select "ALL INDIA CAP ALERT" button

2. **Ensure backend is running:**
   ```bash
   cd backend
   npm start  # Starts on port 5000
   ```

3. **Ensure frontend is running:**
   ```bash
   cd frontend
   npm start  # Starts on port 3000
   ```

## 🔧 Configuration

### Map Center & Zoom
- **Default Center**: [22.5°N, 80°E]
- **Default Zoom**: Level 5
- Edit in `AllIndiaAlerts.jsx` line ~170

### API Refresh Interval
- **Current**: 30 seconds
- **Edit**: Line 25 `setInterval(fetchAlerts, 30000)`

### Alert Colors Mapping
- **Avalanche/Fire**: Orange
- **Flood/Storm**: Yellow
- **Earthquake**: Red
- Customize in `fetchAlerts()` function (lines 30-35)

## 🐛 Troubleshooting

**Issue: Map not displaying**
- Ensure Leaflet CSS is imported
- Check browser console for errors
- Verify backend `/api/alerts` endpoint

**Issue: Alerts not showing**
- Check network tab in DevTools
- Verify MongoDB connection
- Check backend error logs

**Issue: Markers not clustering**
- Ensure `react-leaflet-markercluster` is installed
- Verify `MarkerClusterGroup` component wrapper

## 📱 Features to Add (Future)

- State-wise filtering and drill-down
- Real-time WebSocket updates via Socket.io
- Custom map layer selection (satellite, terrain)
- Alert history and timeline
- SMS/Email notification system
- Mobile app version
- Multi-language support
- Advanced analytics dashboard

## ✅ Quality Assurance

- ✅ SurakshaFlow public-service portal look
- ✅ Responsive for all devices
- ✅ Accessible with high contrast
- ✅ Real API integration ready
- ✅ Professional animations
- ✅ Error handling & fallback data
- ✅ Icon assets from Font Awesome
- ✅ Clean, maintainable code

---

**Last Updated**: February 8, 2026
**Status**: Production Ready ✅
