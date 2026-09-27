# 🌍 SurakshaFlow: Disaster Alert & Rescue Coordination System

> **A Complete Real-Time Disaster Alert, Rescue Coordination & Emergency Management Platform**

[![Status](https://img.shields.io/badge/Status-Production%20Ready-brightgreen)](./PROJECT_COMPLETION_REPORT.md)
[![Version](https://img.shields.io/badge/Version-1.0.0-blue)](.)
[![License](https://img.shields.io/badge/License-MIT-green)](.)

---

## 📋 Table of Contents

- [Overview](#overview)
- [Key Features](#key-features)
- [System Architecture](#system-architecture)
- [Technologies Stack](#technologies-stack)
- [Quick Start](#quick-start)
- [Project Structure](#project-structure)
- [API Documentation](#api-documentation)
- [Configuration](#configuration)
- [Deployment](#deployment)
- [Support & Documentation](#support--documentation)

---

## 🎯 Overview

**SurakshaFlow** is a comprehensive disaster management platform designed to:

- **Detect & Alert**: Real-time disaster notifications from multiple sources (earthquakes, floods, fires, landslides)
- **Coordinate Rescue**: Manage rescue teams with live location tracking and communication
- **Engage Users**: Multi-channel alerts (web, SMS, voice, push notifications)
- **Monitor & Analyze**: Admin dashboard with comprehensive analytics and system controls
- **Ensure Accessibility**: Role-based access control (RBAC) for different user types

### Who Can Use This?

👨‍💼 **Administrators** - Manage alerts, coordinate rescue operations, user management  
👮 **Rescue Teams** - Receive alerts, update emergency status, chat with command center  
👥 **Regular Users** - Receive alerts, report emergencies, check safety status  
🚨 **First Responders** - Quick SOS activation, voice-assisted emergency calls

---

## ✨ Key Features

### 🚨 Alert System
- **Real-Time Alerts** from 4 data sources (OpenWeatherMap, NASA EONET, USGS, Custom DB)
- **Multi-Type Support**: Earthquakes, Floods, Fires, Landslides, Storms, Tsunamis, etc.
- **Intelligent Caching**: 5-minute intelligent caching to optimize API calls
- **Advanced Filtering**: Filter by location, type, severity, timeframe
- **Live Updates**: Socket.io real-time push notifications

### 📱 Multi-Channel Delivery
- **Web Dashboard**: Real-time interactive interface
- **SMS Alerts**: Text message notifications with response options
- **Voice Assistant**: Hands-free emergency activation with Twilio/Voice APIs
- **Push Notifications**: Native device notifications
- **Email Alerts**: Email digest summaries

### 🗺️ Geolocation & Mapping
- **Interactive Maps**: Leaflet.js with Mapbox/OpenStreetMap integration
- **Marker Clustering**: Handle thousands of markers efficiently
- **GeoJSON Support**: Standard geographic data format
- **Location-Based Alerts**: Smart filtering by proximity
- **Live Team Tracking**: GPS tracking for rescue teams

### 👥 Role-Based Access Control (RBAC)
- **Admin Panel**: Full system control and analytics
- **Rescue Coordinator**: Team management and dispatch
- **Field Officer**: Mobile alert reception and response
- **Regular User**: Alert subscription and SOS trigger
- **Custom Roles**: Extensible permission system

### 💬 Communication Hub
- **Real-Time Chat**: Socket.io based instant messaging
- **Admin-to-Team Chat**: Direct communication channel
- **Broadcast Messages**: Alert dissemination
- **Notification Manager**: Centralized message queue

### 📊 Analytics & Reporting
- **Alert Statistics**: Distribution by type, location, severity
- **Response Metrics**: Average response time, team efficiency
- **Coverage Analysis**: Geographic alert coverage
- **Trend Analysis**: Historical alert patterns
- **Custom Reports**: Flexible reporting engine

### 🔐 Security Features
- **JWT Authentication**: Secure token-based auth
- **HTTPS Ready**: SSL/TLS support
- **RBAC Authorization**: Fine-grained access control
- **Data Encryption**: Sensitive data protection
- **Rate Limiting**: API protection against abuse
- **Audit Logs**: Track all system actions

---

## 🏗️ System Architecture

```yaml
┌─────────────────────────────────────────────────────────────┐
│                        FRONTEND (React)                      │
├─────────────────────────────────────────────────────────────┤
│  Dashboard │ Admin Panel │ RescueControl │ UserProfile       │
│  Maps      │ Analytics   │ Chat         │ Settings          │
└──────────────────────┬──────────────────────────────────────┘
                       │ (REST API + WebSocket)
┌──────────────────────▼──────────────────────────────────────┐
│                   BACKEND (Express.js)                       │
├──────────────────────────────────────────────────────────────┤
│ ▪ REST API Endpoints (25+ endpoints)                         │
│ ▪ Real-Time Socket.io Events                                │
│ ▪ Authentication & RBAC Middleware                          │
│ ▪ Business Logic Controllers                                │
└──────────────────────┬──────────────────────────────────────┘
                       │ (Drivers & Services)
┌──────────────────────▼──────────────────────────────────────┐
│                Multiple Data Sources                         │
├──────────────────────────────────────────────────────────────┤
│ ▪ MongoDB (User data, alerts, preferences)                   │
│ ▪ OpenWeatherMap API (Weather alerts)                        │
│ ▪ NASA EONET (Disaster events)                              │
│ ▪ USGS Earthquake API (Seismic data)                        │
│ ▪ Twilio (SMS delivery)                                     │
│ ▪ Voice APIs (Speech-to-text, voice alerts)                 │
└──────────────────────────────────────────────────────────────┘
```

---

## 💻 Technologies Stack

### Frontend
```
Framework:       React.js v18+
Styling:         Tailwind CSS
Maps:            Leaflet.js
Real-Time:       Socket.io client
HTTP Client:     Axios
State:           React Context / React Query
Build Tool:      Create React App / Webpack
```

### Backend
```
Runtime:         Node.js v16+
Framework:       Express.js v4+
Database:        MongoDB
Authentication:  JWT (jsonwebtoken)
WebSocket:       Socket.io
Validation:      Joi / Validator.js
HTTP Client:     Axios
Environment:     dotenv
```

### External Services
```
Weather:         OpenWeatherMap API
Disasters:       NASA EONET API
Earthquakes:     USGS Earthquake API
SMS:             Twilio
Voice:           Flask-based voice service / Twilio
Maps:            Google Maps / Mapbox / OpenStreetMap
```

---

## 🚀 Quick Start

### Prerequisites

```bash
✓ Node.js v16 or higher
✓ MongoDB (local or cloud)
✓ Python 3.8+ (for voice service)
✓ Git
```

**Optional but Recommended:**
```bash
✓ Google Maps API Key
✓ OpenWeatherMap API Key (free: YOUR_OPENWEATHER_API_KEY)
✓ Twilio Account (for SMS)
```

### Installation (5 Minutes)

#### 1. **Clone & Navigate**
```bash
git clone https://github.com/yourusername/NDMA.git
cd NDMA
```

#### 2. **Install Dependencies**

```bash
# Backend
cd backend
npm install

# Frontend (in new terminal)
cd frontend
npm install

# Python Voice Service
cd ..
python -m venv .venv
.venv\Scripts\activate  # Windows
# source .venv/bin/activate  # macOS/Linux
pip install -r requirements.txt
```

#### 3. **Configure Environment**

Create `backend/.env`:
```env
# Server
PORT=5000
NODE_ENV=development

# Database
MONGODB_URI=mongodb://localhost:27017/ndma

# Authentication
JWT_SECRET=your_super_secret_jwt_key_here_min_32_chars

# APIs
OPENWEATHER_API_KEY=YOUR_OPENWEATHER_API_KEY
GOOGLE_MAPS_API_KEY=your_google_maps_key_here

# Twilio (Optional - for SMS)
TWILIO_ACCOUNT_SID=your_twilio_account_sid
TWILIO_AUTH_TOKEN=your_twilio_auth_token
TWILIO_PHONE_NUMBER=+1234567890

# CORS
CORS_ORIGINS=http://localhost:3000,http://localhost:3002

# Email (Optional)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASSWORD=your_app_password
```

#### 4. **Start Services**

**Terminal 1 - Backend:**
```bash
cd backend
npm start
# Runs on http://localhost:5000
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm start
# Opens http://localhost:3000
```

**Terminal 3 - MongoDB (if local):**
```bash
# Windows
mongod

# macOS
brew services start mongodb-community

# Linux
sudo service mongod start
```

**Terminal 4 - Voice Service (Optional):**
```bash
.venv\Scripts\activate
python flask_voice_service.py
# Runs on http://localhost:5001
```

✅ **All set! Navigate to http://localhost:3000**

---

## 📁 Project Structure

```
NDMA/
│
├── 📂 backend/                    # Express.js API Server
│   ├── controllers/               # Business logic
│   │   ├── disasterController.js
│   │   ├── alertsController.js
│   │   ├── realAlertsController.js
│   │   ├── authController.js
│   │   ├── smsController.js
│   │   ├── rescueController.js
│   │   ├── weatherController.js
│   │   └── ...
│   ├── routes/                    # API endpoints
│   │   ├── disasterRoutes.js
│   │   ├── alertRoutes.js
│   │   ├── authRoutes.js
│   │   └── ...
│   ├── models/                    # MongoDB schemas
│   ├── middleware/                # Auth, validation, CORS
│   ├── services/                  # External API integration
│   ├── utils/                     # Helper functions
│   ├── config/                    # Configuration files
│   ├── data/                      # MongoDB data directory
│   ├── server.js                  # Express server entry
│   ├── package.json
│   └── .env
│
├── 📂 frontend/                   # React.js Application
│   ├── src/
│   │   ├── components/            # React components
│   │   │   ├── Dashboard.jsx
│   │   │   ├── AdminPanel.jsx
│   │   │   ├── RescueDashboard.jsx
│   │   │   ├── AlertCard.jsx
│   │   │   ├── MapView.jsx
│   │   │   ├── ChatWindow.jsx
│   │   │   └── ...
│   │   ├── pages/                 # Page components
│   │   ├── api/                   # API client
│   │   ├── utils/                 # Utilities
│   │   ├── hooks/                 # Custom React hooks
│   │   ├── styles/                # Global styles
│   │   ├── App.js
│   │   └── index.js
│   ├── public/
│   ├── build/                     # Production build
│   └── package.json
│
├── 🐍 flask_voice_service.py      # Python voice service
├── flaskapp.py                    # Alternative Flask app
│
├── 📚 Documentation/
│   ├── README.md
│   ├── SYSTEM_README.md
│   ├── INTEGRATION_GUIDE.md
│   ├── DEPLOYMENT_CHECKLIST.md
│   ├── REAL_ALERTS_INTEGRATION.md
│   ├── REAL_ALERTS_SETUP_GUIDE.md
│   ├── SMS_IMPLEMENTATION_SUMMARY.md
│   ├── ADMIN_PANEL_COMPLETE.md
│   ├── RBAC_IMPLEMENTATION.md
│   └── ... (15+ documentation files)
│
└── 📄 Configuration Files
    ├── package.json
    ├── .env
    └── .gitignore
```

---

## 🔌 API Documentation

### Base URL
```
Development: http://localhost:5000/api
Production: https://your-domain.com/api
```

### Core Endpoints

#### Alerts
```
GET    /alerts                    # Get all alerts
POST   /alerts                    # Create alert (admin)
GET    /alerts/:id                # Get alert details
PUT    /alerts/:id                # Update alert (admin)
DELETE /alerts/:id                # Delete alert (admin)
```

#### Real-Time External Alerts
```
GET    /real-alerts/combined      # Aggregate all sources
GET    /real-alerts/external      # External APIs only
GET    /real-alerts/weather       # Weather alerts
GET    /real-alerts/disasters     # Disaster events
GET    /real-alerts/earthquakes   # Earthquake data
GET    /real-alerts/search        # Advanced search
GET    /real-alerts/stats         # Analytics
```

#### Rescue Operations
```
GET    /rescue/teams              # List rescue teams
POST   /rescue/teams              # Create team (admin)
GET    /rescue/missions           # List missions
POST   /rescue/missions           # Create mission
PUT    /rescue/missions/:id       # Update mission status
GET    /rescue/location-track     # Live team tracking
```

#### User Management
```
POST   /auth/register             # User registration
POST   /auth/login                # User login
POST   /auth/logout               # User logout
GET    /users/profile             # Get user profile
PUT    /users/profile             # Update profile
```

#### SMS Alerts
```
POST   /sms/send                  # Send SMS alert
POST   /sms/preferences           # Update SMS settings
GET    /sms/log                   # SMS delivery log
```

### Authentication
All endpoints (except `/auth/*`) require JWT token in header:
```
Authorization: Bearer your_jwt_token_here
```

### Response Format
```json
{
  "success": true,
  "message": "Operation successful",
  "data": { /* response data */ },
  "timestamp": "2024-04-15T10:30:00Z"
}
```

### Error Handling
```json
{
  "success": false,
  "error": "Detailed error message",
  "statusCode": 400,
  "timestamp": "2024-04-15T10:30:00Z"
}
```

---

## ⚙️ Configuration

### Environment Variables

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `PORT` | ❌ | 5000 | Server port |
| `NODE_ENV` | ❌ | development | Environment mode |
| `MONGODB_URI` | ✅ | - | MongoDB connection string |
| `JWT_SECRET` | ✅ | - | JWT signing secret (min 32 chars) |
| `OPENWEATHER_API_KEY` | ❌ | - | OpenWeather API key |
| `GOOGLE_MAPS_API_KEY` | ❌ | - | Google Maps API key |
| `TWILIO_ACCOUNT_SID` | ❌ | - | Twilio account ID (for SMS) |
| `TWILIO_AUTH_TOKEN` | ❌ | - | Twilio auth token |
| `CORS_ORIGINS` | ❌ | * | Allowed CORS origins |

### Database Setup

#### MongoDB Local
```bash
# Windows
mongod

# macOS
brew services start mongodb-community

# Connect
mongo mongodb://localhost:27017/ndma
```

#### MongoDB Cloud (Atlas)
```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/ndma
```

### API Keys Setup

#### OpenWeatherMap (FREE)
1. Visit https://openweathermap.org/api
2. Sign up for free account
3. Get API key: `YOUR_OPENWEATHER_API_KEY` (already configured)
4. Add to `.env`

#### NASA EONET (FREE - No Key Required)
- Already integrated
- No rate limits for development

#### USGS Earthquakes (FREE - No Key Required)
- Already integrated
- Real earthquake data

#### Google Maps (Optional)
1. Visit https://cloud.google.com/
2. Create project and enable Maps API
3. Generate API key
4. Add to `.env`

---

## 🚀 Deployment

### Production Checklist
- [ ] Environment variables configured
- [ ] MongoDB production database set up
- [ ] API keys verified
- [ ] HTTPS/SSL certificates installed
- [ ] CORS origins updated
- [ ] Logging configured
- [ ] Error monitoring set up
- [ ] Database backups enabled
- [ ] Rate limiting configured
- [ ] Cache strategy optimized

### Deploy to Heroku
```bash
# Install Heroku CLI
# https://devcenter.heroku.com/articles/heroku-cli

# Login
heroku login

# Create app
heroku create your-app-name

# Set environment variables
heroku config:set JWT_SECRET=your_secret
heroku config:set MONGODB_URI=your_mongodb_uri

# Deploy
git push heroku main

# View logs
heroku logs --tail
```

### Deploy to AWS / Azure / DigitalOcean
See [DEPLOYMENT_CHECKLIST.md](./DEPLOYMENT_CHECKLIST.md) for detailed cloud deployment guides.

---

## 📚 Support & Documentation

### Main Documentation
- [SYSTEM_README.md](./SYSTEM_README.md) - System architecture & components
- [INTEGRATION_GUIDE.md](./INTEGRATION_GUIDE.md) - Feature integration guide
- [DEPLOYMENT_CHECKLIST.md](./DEPLOYMENT_CHECKLIST.md) - Production deployment
- [PROJECT_COMPLETION_REPORT.md](./PROJECT_COMPLETION_REPORT.md) - Completion status

### Feature Guides
- [REAL_ALERTS_INTEGRATION.md](./REAL_ALERTS_INTEGRATION.md) - Real-time alert system
- [REAL_ALERTS_SETUP_GUIDE.md](./REAL_ALERTS_SETUP_GUIDE.md) - Alert setup tutorial
- [SMS_IMPLEMENTATION_SUMMARY.md](./SMS_IMPLEMENTATION_SUMMARY.md) - SMS configuration
- [ADMIN_PANEL_COMPLETE.md](./ADMIN_PANEL_COMPLETE.md) - Admin controls
- [MULTI_ROLE_IMPLEMENTATION.md](./MULTI_ROLE_IMPLEMENTATION.md) - RBAC system
- [ADVANCED_SMS_INTEGRATION.md](./ADVANCED_SMS_INTEGRATION.md) - Advanced SMS features

### Quick References
- [REAL_ALERTS_QUICK_REFERENCE.md](./REAL_ALERTS_QUICK_REFERENCE.md) - Quick lookup
- [SMS_QUICK_START.md](./SMS_QUICK_START.md) - SMS quick start
- [DOCUMENTATION_INDEX.md](./DOCUMENTATION_INDEX.md) - All docs index

---

## 🔍 Troubleshooting

### Backend Not Starting
```bash
# Check port availability
netstat -ano | findstr :5000  # Windows
lsof -i :5000                 # macOS/Linux

# Kill process
taskkill /PID pid_number /F

# Try different port
PORT=5001 npm start
```

### MongoDB Connection Error
```bash
# Check if MongoDB is running
# Check connection string in .env
# Verify database exists

# From Node REPL
const mongoose = require('mongoose');
mongoose.connect(process.env.MONGODB_URI);
```

### API Not Responding
```bash
# Check API logs
tail -f backend.log

# Test endpoint manually
curl http://localhost:5000/api/alerts

# Verify CORS configuration
```

### Frontend Won't Load
```bash
# Clear npm cache
npm cache clean --force

# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install

# Start fresh
npm start
```

---

## 📊 System Statistics

| Metric | Value |
|--------|-------|
| Total API Endpoints | 25+ |
| Database Collections | 12+ |
| Frontend Components | 30+ |
| External API Sources | 4 |
| Supported Alert Types | 11+ |
| User Roles | 5 |
| Data Sources | Real-time |
| Response Time | <500ms |
| Cache Strategy | 5-minute intelligent cache |

---

## 🤝 Contributing

1. Fork the project
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📜 License

This project is licensed under the MIT License - see the LICENSE file for details.

---

## 👨‍💻 Author & Support

**Developed by**: NDMA Development Team  
**Last Updated**: April 15, 2024  
**Status**: ✅ Production Ready v1.0.0

### Quick Links
- 📖 [Full Documentation](./DOCUMENTATION_INDEX.md)
- 🐛 [Report Issues](./issues)
- 💬 [GitHub Discussions](./discussions)
- 📧 [Contact Support](#)

---

## 🎯 Roadmap

### V1.1 (Q3 2024)
- [ ] Mobile app (React Native)
- [ ] Predictive alert AI
- [ ] Advanced analytics dashboard
- [ ] Multi-language support

### V2.0 (Q4 2024)
- [ ] Machine learning alert optimization
- [ ] Advanced blockchain for verification
- [ ] IoT sensor integration
- [ ] Satellite data integration

---

**Made with ❤️ for disaster management and rescue coordination**

---
