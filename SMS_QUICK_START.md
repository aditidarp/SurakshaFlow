# SMS Alert System - Quick Start Guide

Get up and running with SMS Templates, Scheduled Alerts, and User Preferences in 5 minutes.

---

## 🚀 Quick Setup (5 minutes)

### Step 1: Install Dependencies (1 minute)
```bash
cd backend
npm install node-cron
```

### Step 2: Start Server (1 minute)
```bash
npm start
# or
npm run dev
```

You should see:
```
[Scheduler] Scheduled alert processor initialized
```

### Step 3: Test API (1 minute)
```bash
# Get your auth token from login
TOKEN="your_jwt_token_here"

# Test: Create a template
curl -X POST http://localhost:5000/api/sms-templates \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Flood Alert 1",
    "disasterType": "flood",
    "message": "High flood risk in your area. Stay safe!",
    "variables": ["{{location}}"]
  }'
```

### Step 4: Check Frontend Components (2 minutes)
Add to your React admin dashboard:
```jsx
import SMSTemplatesManager from './components/SMSTemplatesManager';
import ScheduledAlertsForm from './components/ScheduledAlertsForm';
import UserSMSPreferences from './components/UserSMSPreferences';

// In your JSX:
<SMSTemplatesManager />
<ScheduledAlertsForm />
<UserSMSPreferences />
```

---

## 📋 Feature Checklist

- [x] **SMS Templates** - Create reusable messages with variables
- [x] **Scheduled Alerts** - Schedule alerts for future delivery
- [x] **User Preferences** - Let users control what alerts they receive
- [x] **Recurring Alerts** - Daily/weekly/monthly repeating alerts
- [x] **Batch SMS** - Efficient bulk SMS sending
- [x] **User Filtering** - Respect preferences when sending
- [x] **Full Documentation** - Complete API reference

---

## 🎯 3 Common Workflows

### Workflow 1: Admin Creates & Schedules Alert (2 minutes)

1. **Create Template** (optional but recommended)
   ```
   Go to Admin Dashboard → SMS Templates Manager
   Click "+ New Template"
   Name: "Flood Critical"
   Type: Flood
   Message: "🚨 CRITICAL FLOOD: Evacuate now!"
   Click "Create Template"
   ```

2. **Schedule Alert**
   ```
   Go to Admin Dashboard → Scheduled Alerts
   Click "+ Schedule Alert"
   Disaster Type: Flood
   Location: Mumbai
   State: Maharashtra
   Severity: Critical
   Message: (or use template)
   Scheduled For: Tomorrow at 2:00 PM
   Recurrence: Once
   Click "Schedule Alert"
   ```

3. **Monitor**
   ```
   View the stats dashboard
   See "Upcoming Alerts: 1"
   Alert will auto-send at scheduled time
   ```

### Workflow 2: User Customizes Preferences (1 minute)

1. **Open Preferences**
   ```
   User goes to Profile → SMS Preferences
   ```

2. **Configure**
   ```
   Enable: Flood Alerts ✓
   Enable: Earthquake Alerts ✗
   Minimum Severity: High
   Enable Quiet Hours: 10 PM - 8 AM
   Language: English
   ```

3. **Save**
   ```
   Click "Save Changes"
   ✓ Saved successfully
   ```

4. **Test**
   ```
   Click "Check Eligibility"
   Select Flood + High severity
   → "User is eligible to receive this alert"
   ```

### Workflow 3: Check Alert History (1 minute)

1. **View History**
   ```
   Admin: GET /api/sms-alerts/history
   User: GET /api/user/sms-preferences/activity
   ```

2. **See Statistics**
   ```
   Total alerts received: 45
   This month: 12
   Last received: 2 hours ago
   ```

---

## 🔗 Key API Endpoints

### For Admins
```
Templates:
  POST   /api/sms-templates - Create
  GET    /api/sms-templates - List all
  PUT    /api/sms-templates/:id - Edit
  DELETE /api/sms-templates/:id - Delete

Scheduled Alerts:
  POST   /api/scheduled-alerts - Schedule
  GET    /api/scheduled-alerts - List
  PUT    /api/scheduled-alerts/:id - Edit
  POST   /api/scheduled-alerts/:id/cancel - Cancel

Statistics:
  GET /api/scheduled-alerts/stats/overview - Alert stats
  GET /api/sms-alerts/history - Delivery history
```

### For Users
```
Preferences:
  GET  /api/user/sms-preferences - View settings
  PUT  /api/user/sms-preferences - Update settings
  POST /api/user/sms-preferences/toggle/:type - Toggle alert type
  POST /api/user/sms-preferences/quiet-hours - Set quiet hours

Activity:
  GET /api/user/sms-preferences/activity - View stats
```

---

## 📱 Frontend Components

### SMSTemplatesManager.jsx
Shows in: Admin Dashboard
Features:
- Create templates with variables
- List all templates
- Edit templates
- Delete templates
- View usage statistics

### ScheduledAlertsForm.jsx
Shows in: Admin Dashboard
Features:
- Schedule alerts for future dates
- Select recurrence pattern
- Quick-select templates
- View statistics
- Filter by status
- Edit/cancel alerts

### UserSMSPreferences.jsx
Shows in: User Profile
Features:
- Toggle disaster type alerts
- Set severity threshold
- Configure quiet hours
- Select language
- View activity stats
- Test eligibility

---

## 🧪 Quick Test Scenarios

### Scenario 1: Schedule an Alert
```bash
TOKEN="your_token"

# 1. Create template
curl -X POST http://localhost:5000/api/sms-templates \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Quick Test",
    "disasterType": "flood",
    "message": "🚨 Quick test message",
    "variables": []
  }'

# 2. Schedule using template
curl -X POST http://localhost:5000/api/scheduled-alerts \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "disasterType": "flood",
    "location": "TestCity",
    "state": "TestState",
    "severity": "High",
    "message": "🚨 Quick test message",
    "scheduledFor": "2024-01-20T14:30:00Z",
    "recurPattern": "once"
  }'

# 3. View list
curl http://localhost:5000/api/scheduled-alerts \
  -H "Authorization: Bearer $TOKEN"
```

### Scenario 2: Set User Preferences
```bash
TOKEN="user_token"

# Get current preferences
curl http://localhost:5000/api/user/sms-preferences \
  -H "Authorization: Bearer $TOKEN"

# Update preferences
curl -X PUT http://localhost:5000/api/user/sms-preferences \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "smsPreferences": {
      "floodAlerts": true,
      "earthquakeAlerts": false,
      "minimumSeverity": "Medium",
      "quietHours": {
        "enabled": true,
        "startTime": "22:00",
        "endTime": "08:00"
      }
    }
  }'

# Check if eligible for an alert
curl -X POST http://localhost:5000/api/user/sms-preferences/check \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "disasterType": "flood",
    "severity": "High"
  }'
```

---

## ⚙️ How It Works (Behind the Scenes)

### Scheduler Process
```
Every minute:
  1. Check for alerts where scheduledFor <= now
  2. For each alert:
     - Find users in that location
     - Check user preferences:
       ✓ SMS opted in?
       ✓ Disaster type enabled?
       ✓ Severity meets threshold?
       ✓ Not in quiet hours?
     - Send SMS to eligible users
     - Log delivery status
     - If recurring: create next occurrence
  3. Mark alert as 'sent'
```

### User Eligibility
Alert is sent if ALL conditions met:
```
✓ User has optInSMS = true
✓ User enabled this disaster type
✓ Alert severity >= user's minimum severity
✓ Current time NOT in user's quiet hours
✓ User location matches alert location
```

---

## 🔍 Troubleshooting

### "Scheduler not starting"
Check logs after `npm start`:
```
✓ [Scheduler] Scheduled alert processor initialized
```
If not showing, check `server.js` has scheduler call.

### "Alerts not sending"
Verify:
1. Alert status is 'scheduled'
2. scheduledFor time has passed
3. Users exist in that location
4. User preferences allow the alert
5. Check AlertLog collection for delivery details

### "Template endpoint 404"
Verify:
1. Route registered in `server.js`
2. Controller methods exist
3. Correct URL: `/api/sms-templates`

### "User can't update preferences"
Verify:
1. User is authenticated
2. Using PUT to `/api/user/sms-preferences`
3. Quiet hours format is HH:MM (24-hour)

---

## 📚 Full Documentation

Read more:
- **[SMS_ADVANCED_API.md](./backend/SMS_ADVANCED_API.md)** - Complete API reference
- **[ADVANCED_SMS_INTEGRATION.md](./ADVANCED_SMS_INTEGRATION.md)** - Integration guide
- **[SMS_VERIFICATION_CHECKLIST.md](./SMS_VERIFICATION_CHECKLIST.md)** - Verification steps

---

## ✅ You're Ready!

Your SMS Alert System is ready. Next steps:

1. **Immediate**: Test the API endpoints with curl
2. **This week**: Integrate components into admin dashboard and user profile
3. **This month**: Test with real SMS providers (Twilio/Fast2SMS)
4. **Production**: Deploy and monitor

---

## 🎉 What You Have Now

✅ SMS Templates with variable support
✅ Scheduled Alerts with recurring patterns
✅ User Preferences with granular controls
✅ Automatic alert processing every minute
✅ Batch SMS sending to prevent rate limits
✅ Complete user preference filtering
✅ Admin and user UI components
✅ Full API documentation
✅ Production-ready code

---

**All 3 advanced features are fully implemented and ready to use!** 🚀

For detailed implementation help, see **ADVANCED_SMS_INTEGRATION.md**

