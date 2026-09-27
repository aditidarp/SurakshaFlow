# Real-World Alerts System - Setup & Testing Guide

## Quick Start

### 1. Environment Configuration
Add to `backend/.env`:
```env
# Required for weather alerts
OPENWEATHER_API_KEY=your_api_key_here

# Optional - for development/testing
DEBUG=surakshaflow:*
NODE_ENV=development
```

### 2. Get OpenWeatherMap API Key
1. Visit https://openweathermap.org/api
2. Click "Sign Up"
3. Create free account
4. Go to API keys section
5. Copy your API key
6. Paste into `.env` file

> **Note**: Free tier includes 1000 calls/day. Sufficient for development/testing.

### 3. Verification
Restart backend server:
```bash
cd backend
npm install # if needed
npm start

# Check logs for:
# ✓ "Real-World Alerts API initialized"
# ✓ No warnings about missing OPENWEATHER_API_KEY
```

---

## API Testing

### Option 1: Using curl

#### 1. Test Combined Alerts
```bash
curl -X GET http://localhost:5000/api/real-alerts/combined
```

**Expected Response**:
```json
{
  "total": 42,
  "admin": 5,
  "external": 37,
  "alerts": [
    {
      "title": "Heavy Rainfall Warning",
      "description": "...",
      "location": "Mumbai, Maharashtra",
      "severity": "High",
      "type": "Flood",
      "source": "OPENWEATHER",
      "external": true,
      "badge": "Live Alert",
      "createdAt": "2024-01-15T10:30:00Z"
    }
  ]
}
```

#### 2. Test Weather Alerts Only
```bash
curl -X GET http://localhost:5000/api/real-alerts/weather
```

**Expected Response**:
```json
{
  "source": "OpenWeatherMap",
  "total": 3,
  "alerts": [...]
}
```

#### 3. Test Disaster Alerts (NASA EONET)
```bash
curl -X GET http://localhost:5000/api/real-alerts/disasters
```

**Expected Response**:
```json
{
  "source": "NASA EONET",
  "total": 15,
  "alerts": [...]
}
```

#### 4. Test Earthquake Alerts (USGS)
```bash
curl -X GET http://localhost:5000/api/real-alerts/earthquakes
```

**Expected Response**:
```json
{
  "source": "USGS",
  "total": 8,
  "alerts": [...]
}
```

#### 5. Test Search Functionality
```bash
# Search by keyword
curl -X GET "http://localhost:5000/api/real-alerts/search?keyword=earthquake"

# Search by severity
curl -X GET "http://localhost:5000/api/real-alerts/search?severity=High"

# Search by type
curl -X GET "http://localhost:5000/api/real-alerts/search?type=Flood"

# Search by source
curl -X GET "http://localhost:5000/api/real-alerts/search?source=USGS"

# Combined search
curl -X GET "http://localhost:5000/api/real-alerts/search?keyword=tsunami&severity=Critical&type=Earthquake"
```

#### 6. Test Statistics
```bash
curl -X GET http://localhost:5000/api/real-alerts/stats
```

**Expected Response**:
```json
{
  "total": 42,
  "bySource": {
    "admin": 5,
    "external": 37,
    "OPENWEATHER": 12,
    "NASA_EONET": 20,
    "USGS": 5
  },
  "bySeverity": {
    "Critical": 5,
    "High": 15,
    "Medium": 15,
    "Low": 7
  },
  "byType": {
    "Earthquake": 5,
    "Flood": 12,
    "Fire": 8
  }
}
```

---

### Option 2: Using Postman

1. **Import Collection**
   - File → New → HTTP Request
   - Set Method: GET
   - Set URL: See endpoints below

2. **Combined Alerts**
   ```
   GET http://localhost:5000/api/real-alerts/combined
   ```

3. **Weather Alerts**
   ```
   GET http://localhost:5000/api/real-alerts/weather
   ```

4. **Disaster Events**
   ```
   GET http://localhost:5000/api/real-alerts/disasters
   ```

5. **Earthquakes**
   ```
   GET http://localhost:5000/api/real-alerts/earthquakes
   ```

6. **Search with Filters**
   ```
   GET http://localhost:5000/api/real-alerts/search?keyword=flood&severity=High
   ```

7. **Statistics**
   ```
   GET http://localhost:5000/api/real-alerts/stats
   ```

---

### Option 3: Using Insomnia

1. Create new workspace: "SurakshaFlow Real Alerts"
2. Add new request with URL: `http://localhost:5000/api/real-alerts/combined`
3. Select "GET" method
4. Send request
5. Repeat for other endpoints

---

## Frontend Integration Testing

### Option 1: Browser Console

1. Open browser DevTools (F12)
2. Go to Console tab
3. Execute:

```javascript
// Test combined alerts
fetch('http://localhost:5000/api/real-alerts/combined')
  .then(res => res.json())
  .then(data => console.log('Combined alerts:', data))
  .catch(err => console.error('Error:', err));

// Test weather alerts
fetch('http://localhost:5000/api/real-alerts/weather')
  .then(res => res.json())
  .then(data => console.log('Weather alerts:', data.alerts))
  .catch(err => console.error('Error:', err));

// Test search
fetch('http://localhost:5000/api/real-alerts/search?keyword=earthquake')
  .then(res => res.json())
  .then(data => console.log('Search results:', data.alerts))
  .catch(err => console.error('Error:', err));
```

### Option 2: Create Test Component

Create `frontend/src/components/RealAlertsTest.jsx`:

```jsx
import React, { useState, useEffect } from 'react';
import API from '../api';

export default function RealAlertsTest() {
  const [combined, setCombined] = useState(null);
  const [weather, setWeather] = useState(null);
  const [disasters, setDisasters] = useState(null);
  const [earthquakes, setEarthquakes] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAllAlerts = async () => {
      try {
        setLoading(true);
        const [c, w, d, e] = await Promise.all([
          API.get('/real-alerts/combined'),
          API.get('/real-alerts/weather'),
          API.get('/real-alerts/disasters'),
          API.get('/real-alerts/earthquakes')
        ]);
        
        setCombined(c.data);
        setWeather(w.data);
        setDisasters(d.data);
        setEarthquakes(e.data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchAllAlerts();
  }, []);

  if (loading) return <div>Loading alerts...</div>;
  if (error) return <div style={{color: 'red'}}>Error: {error}</div>;

  return (
    <div style={{padding: '20px'}}>
      <h1>Real Alerts System Test</h1>
      
      <section>
        <h2>Combined Alerts: {combined?.total || 0}</h2>
        <p>Admin: {combined?.admin} | External: {combined?.external}</p>
        <ul>
          {combined?.alerts?.slice(0, 5).map((alert, i) => (
            <li key={i}>
              {alert.title} - {alert.severity} ({alert.source})
            </li>
          ))}
        </ul>
      </section>

      <section>
        <h2>Weather Alerts: {weather?.total || 0}</h2>
        <p>Source: {weather?.source}</p>
        <ul>
          {weather?.alerts?.slice(0, 3).map((alert, i) => (
            <li key={i}>{alert.title} - {alert.location}</li>
          ))}
        </ul>
      </section>

      <section>
        <h2>Disaster Events: {disasters?.total || 0}</h2>
        <p>Source: {disasters?.source}</p>
        <ul>
          {disasters?.alerts?.slice(0, 3).map((alert, i) => (
            <li key={i}>{alert.title} - {alert.location}</li>
          ))}
        </ul>
      </section>

      <section>
        <h2>Earthquakes: {earthquakes?.total || 0}</h2>
        <p>Source: {earthquakes?.source}</p>
        <ul>
          {earthquakes?.alerts?.slice(0, 3).map((alert, i) => (
            <li key={i}>
              {alert.title} - Magnitude: {alert.severity}
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
```

Then add to `App.js`:
```jsx
import RealAlertsTest from './components/RealAlertsTest';

// In routes:
<Route path="/test-real-alerts" element={<RealAlertsTest />} />
```

Visit: `http://localhost:3000/test-real-alerts`

---

## Troubleshooting Guide

### Problem: "Cannot GET /api/real-alerts/combined"
**Solution**: Ensure route is registered in server.js
```javascript
// Add this line to backend/server.js (after other routes):
app.use('/api/real-alerts', require('./routes/realAlertsRoutes'));
```

### Problem: OpenWeatherMap alerts are empty
**Solution**: Check API key configuration
```bash
# 1. Verify .env file has OPENWEATHER_API_KEY
cat backend/.env | grep OPENWEATHER

# 2. Check API key is valid
curl "https://api.openweathermap.org/data/2.5/weather?lat=19&lon=72&appid=YOUR_KEY"

# 3. Check server logs
# Should show: ✓ "Using OpenWeatherMap API" or ⚠️ "API key not configured"
```

### Problem: All external alerts empty
**Solution**: Check network connectivity
```bash
# Test each API manually:
curl https://eonet.gsfc.nasa.gov/api/v3/events?limit=5
curl https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/significant_month.geojson

# Both should return JSON data
```

### Problem: Slow response time
**Solution**: Verify caching is working
```javascript
// Check cache in realAlertsService.js
// Cache hits: <50ms
// Cache misses: 1.5-3 seconds (first call only)
```

### Problem: CORS errors in browser
**Solution**: Enable CORS in server.js
```javascript
const cors = require('cors');
app.use(cors());
```

### Problem: 500 Server Error
**Solution**: Check backend logs
```bash
# Terminal output should show:
# Error type: [Error message]
# Check if MongoDB is connected
# Check if external APIs are accessible
```

---

## Performance Benchmarking

### Expected Response Times
```
Combined Alerts (first call):   1500-3000ms
Combined Alerts (cached):       <50ms
Weather Only:                   700-1000ms
Disasters Only:                 800-1500ms
Earthquakes Only:               500-1000ms
Search (on 100+ alerts):        100-200ms
Stats (calculation):            50-100ms
```

### Load Testing

```bash
# Simple load test with Apache Bench
ab -n 100 -c 10 http://localhost:5000/api/real-alerts/combined

# For detailed metrics:
# -n: total requests
# -c: concurrent requests

# With caching, should handle 100+ concurrent requests
```

---

## Data Validation Checklist

When alerts are returned, verify:
- [ ] All alerts have `title` field
- [ ] All have `description` field
- [ ] All have `location` field
- [ ] All have `severity` (Critical/High/Medium/Low)
- [ ] All have `type` (Earthquake/Flood/Fire/etc)
- [ ] All have `source` (OPENWEATHER/NASA_EONET/USGS/ADMIN)
- [ ] All have `createdAt` timestamp
- [ ] All have `external` boolean (true for APIs, false for admin)
- [ ] Geometry is valid GeoJSON when present
- [ ] URL field is either null or valid URL

---

## Integration Checklist

After setup, verify:
- [ ] Backend starts without errors
- [ ] No warnings about missing OPENWEATHER_API_KEY
- [ ] /api/real-alerts/combined returns 200 status
- [ ] Combined alerts include both admin and external
- [ ] Weather alerts show active weather events
- [ ] Disaster alerts show recent natural events
- [ ] Earthquake alerts show significant earthquakes
- [ ] Search filters work (keyword, severity, type, source)
- [ ] Statistics endpoint returns counts by type/severity/source
- [ ] Cache invalidates after 5 minutes
- [ ] Response times are within expected ranges
- [ ] No memory leaks with repeated API calls
- [ ] Error handling doesn't crash server
- [ ] Frontend can fetch and display alerts
- [ ] Mobile responsive design works

---

## Production Deployment

### Before Going Live

1. **Rate Limiting**
   ```javascript
   // Add to backend/server.js
   const rateLimit = require('express-rate-limit');
   
   const apiLimiter = rateLimit({
     windowMs: 15 * 60 * 1000, // 15 minutes
     max: 100 // limit each IP to 100 requests per windowMs
   });
   
   app.use('/api/real-alerts', apiLimiter);
   ```

2. **Logging**
   ```javascript
   // Log all external API calls
   console.log(`[${new Date().toISOString()}] API call to ${endpoint}`);
   console.time(`API: ${endpoint}`);
   // ... make call
   console.timeEnd(`API: ${endpoint}`);
   ```

3. **Monitoring**
   - Monitor API response times
   - Alert if external APIs are down
   - Track cache hit ratio
   - Monitor database queries

4. **Database Persistence** (Future)
   ```javascript
   // Store alerts in MongoDB for historical analysis
   const alertLog = new AlertLog({
     alert: alert,
     source: source,
     createdAt: new Date()
   });
   await alertLog.save();
   ```

---

## Support & Resources

- **Issue Tracker**: Check GitHub issues
- **Documentation**: See REAL_ALERTS_INTEGRATION.md
- **API Docs**:
  - https://openweathermap.org/api
  - https://eonet.gsfc.nasa.gov/docs/v3
  - https://earthquake.usgs.gov/fdsnws/event/
- **Slack Channel**: #disaster-alerts

---

**Last Updated**: 2024-01-17  
**Status**: Production Ready
