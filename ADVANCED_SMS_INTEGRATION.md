# SMS Alert System - Integration Guide

## Complete Feature Implementation

This guide walks through integrating the three advanced SMS alert features into your SurakshaFlow disaster management system.

## Features Implemented

### ✅ 1. SMS Templates
Admins can create and manage reusable SMS message templates for different disaster types with variable support.

**Key Files:**
- Backend: `controllers/smsTemplateController.js`, `models/SMSTemplate.js`, `routes/smsTemplateRoutes.js`
- Frontend: `components/SMSTemplatesManager.jsx`, `styles/SMSTemplatesManager.css`

**Key Methods:**
- Create, Read, Update, Delete templates
- Filter by disaster type
- Track usage analytics
- Support dynamic variables ({{location}}, {{severity}}, etc.)

### ✅ 2. Scheduled Alerts
Admins can schedule SMS alerts for future delivery with recurring patterns (daily, weekly, monthly).

**Key Files:**
- Backend: `controllers/scheduledAlertController.js`, `models/ScheduledAlert.js`, `routes/scheduledAlertRoutes.js`
- Services: `services/scheduledAlertProcessor.js`, `services/schedulerService.js`
- Frontend: `components/ScheduledAlertsForm.jsx`, `styles/ScheduledAlertsForm.css`

**Key Features:**
- Schedule for future dates
- Recurring patterns (once, daily, weekly, monthly)
- Automatic next occurrence creation
- User preference filtering
- Status tracking (scheduled, sent, failed, cancelled)

### ✅ 3. User SMS Preferences
Users can customize their SMS alert settings including disaster types, severity levels, quiet hours, and language.

**Key Files:**
- Backend: `controllers/smsPreferencesController.js`, `routes/smsPreferencesRoutes.js`
- Models: Updated `User.js` with `smsPreferences` schema
- Frontend: `components/UserSMSPreferences.jsx`, `styles/UserSMSPreferences.css`

**Key Features:**
- Toggle disaster type alerts
- Set minimum severity threshold
- Define quiet hours (no alerts during set times)
- Language selection
- Activity tracking
- Eligibility checking

---

## Installation & Setup

### 1. Install Dependencies

**Backend:**
```bash
cd backend
npm install node-cron
```

**Frontend:**
```bash
cd frontend
npm install
```

### 2. Database Models

All models are created:
- ✅ `SMSTemplate.js` - Template schema
- ✅ `ScheduledAlert.js` - Scheduled alert schema
- ✅ `User.js` - Updated with smsPreferences

### 3. Environment Variables

Add to `.env`:
```env
# SMS Providers
TWILIO_ACCOUNT_SID=your_sid
TWILIO_AUTH_TOKEN=your_token
TWILIO_PHONE=+1234567890

FAST2SMS_API_KEY=your_api_key

# Scheduler
SCHEDULER_ENABLED=true
SCHEDULER_INTERVAL=60000  # milliseconds
```

### 4. Server Configuration

The scheduler is automatically initialized when the server starts:
```javascript
// In server.js
schedulerService.initializeScheduler(); // Called on server.listen()
```

---

## API Endpoints Summary

### SMS Templates
```
POST   /api/sms-templates                    - Create template
GET    /api/sms-templates                    - List all templates
GET    /api/sms-templates/:id               - Get single template
GET    /api/sms-templates/type/:type        - Get by disaster type
PUT    /api/sms-templates/:id               - Update template
DELETE /api/sms-templates/:id               - Delete template
POST   /api/sms-templates/:id/use           - Track usage
```

### Scheduled Alerts
```
POST   /api/scheduled-alerts                - Schedule alert
GET    /api/scheduled-alerts                - List alerts
GET    /api/scheduled-alerts/:id            - Get single alert
GET    /api/scheduled-alerts/stats/overview - Get statistics
PUT    /api/scheduled-alerts/:id            - Update alert
POST   /api/scheduled-alerts/:id/cancel     - Cancel alert
GET    /api/scheduled-alerts/pending        - Get pending (for scheduler)
```

### User Preferences
```
GET    /api/user/sms-preferences            - Get preferences
PUT    /api/user/sms-preferences            - Update all preferences
POST   /api/user/sms-preferences/toggle/:type       - Toggle disaster type
POST   /api/user/sms-preferences/quiet-hours        - Set quiet hours
POST   /api/user/sms-preferences/severity           - Set minimum severity
POST   /api/user/sms-preferences/check              - Check eligibility
GET    /api/user/sms-preferences/activity           - Get activity stats
```

---

## Frontend Integration

### 1. Add Components to Admin Dashboard

In your admin dashboard (`AdminDashboard.js`), add:

```jsx
import SMSTemplatesManager from './SMSTemplatesManager';
import ScheduledAlertsForm from './ScheduledAlertsForm';

// In your render/return:
<div className="admin-section">
  <SMSTemplatesManager />
</div>

<div className="admin-section">
  <ScheduledAlertsForm />
</div>
```

### 2. Add Preferences to User Profile

In your user profile page (`UserProfile.jsx` or settings), add:

```jsx
import UserSMSPreferences from './UserSMSPreferences';

// In your render/return:
<div className="user-section">
  <UserSMSPreferences />
</div>
```

### 3. Use API Helpers

Import the SMS API helper:
```jsx
import { smsTemplatesAPI, scheduledAlertsAPI, userPreferencesAPI } from '../api/smsAPI';

// Usage example:
const response = await smsTemplatesAPI.getAll({
  disasterType: 'flood',
  page: 1,
  limit: 10
});

const upcoming = await scheduledAlertsAPI.getAll({
  status: 'scheduled'
});

const prefs = await userPreferencesAPI.get();
```

---

## Backend Integration

### 1. Routes Registration

All routes are automatically registered in `server.js`:
```javascript
app.use('/api/sms-templates', require('./routes/smsTemplateRoutes'));
app.use('/api/scheduled-alerts', require('./routes/scheduledAlertRoutes'));
app.use('/api/user/sms-preferences', require('./routes/smsPreferencesRoutes'));
```

### 2. Scheduler Service

The scheduler automatically:
- Runs every minute
- Checks for due alerts
- Filters users by preferences
- Sends SMS via bulk sender
- Creates next recurrences
- Logs delivery status

To manually trigger (for testing):
```bash
POST /api/scheduled-alerts/force-process
```

### 3. Authentication & Authorization

- **Templates**: Admin-only (create, update, delete)
- **Scheduled Alerts**: Admin-only
- **User Preferences**: User-specific (can only access/modify own)

---

## Data Flow

### Template Creation Flow
```
Admin Creates Template
    ↓
POST /api/sms-templates
    ↓
Template Saved to DB
    ↓
Available for scheduling
```

### Scheduled Alert Flow
```
Admin Schedules Alert
    ↓
POST /api/scheduled-alerts
    ↓
Alert Stored with status: "scheduled"
    ↓
Scheduler checks every minute
    ↓
When scheduledFor <= now:
  - Query users in location/state
  - Filter by user preferences
  - Send SMS via Twilio/Fast2SMS
  - Update status to "sent"
  - Create next occurrence (if recurring)
```

### User Preference Flow
```
User Opens Preferences Page
    ↓
GET /api/user/sms-preferences
    ↓
Display current settings
    ↓
User modifies settings
    ↓
PUT /api/user/sms-preferences
    ↓
Preferences updated in DB
    ↓
Next alerts respect new settings
```

---

## Database Queries (MongoDB)

### Find Pending Alerts
```javascript
ScheduledAlert.find({
  status: 'scheduled',
  scheduledFor: { $lte: new Date() }
})
.populate('createdBy')
.populate('templateId')
```

### Find Eligible Users for Alert
```javascript
User.find({
  optInSMS: true,
  $or: [
    { location: { $regex: alert.location, $options: 'i' } },
    { state: alert.state }
  ]
}).select('phone smsPreferences')
```

### Get Template Usage Stats
```javascript
SMSTemplate.aggregate([
  { $group: { _id: '$disasterType', count: { $sum: 1 } } },
  { $sort: { count: -1 } }
])
```

---

## Testing

### Test Template Creation
```bash
curl -X POST http://localhost:5000/api/sms-templates \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Flood High",
    "disasterType": "flood",
    "message": "High flood risk in {{location}}",
    "variables": ["{{location}}"]
  }'
```

### Test Schedule Creation
```bash
curl -X POST http://localhost:5000/api/scheduled-alerts \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "disasterType": "flood",
    "location": "Mumbai",
    "state": "Maharashtra",
    "severity": "High",
    "message": "Test alert",
    "scheduledFor": "2024-01-20T14:30:00Z",
    "recurPattern": "once"
  }'
```

### Test Preferences
```bash
curl http://localhost:5000/api/user/sms-preferences \
  -H "Authorization: Bearer $TOKEN"
```

---

## Monitoring & Maintenance

### Check Scheduler Status
```javascript
const scheduler = require('./services/schedulerService');
console.log(scheduler.getSchedulerStatus());
// Output: { running: true, nextRun: 'Every minute' }
```

### Get Processing Statistics
```javascript
const processor = require('./services/scheduledAlertProcessor');
const stats = await processor.getProcessingStats();
// Returns: { total, scheduled, sent, failed, cancelled }
```

### Check Delayed Alerts
```javascript
const delayed = await processor.getDelayedAlerts(5); // alerts delayed 5+ minutes
```

### View Alert Logs
```javascript
AlertLog.find({ alertId: alertId })
  .populate('userId', 'phone location')
  .sort({ sentAt: -1 })
```

---

## Performance Optimization

### Database Indexing
Indexes are created on:
- `ScheduledAlert`: (scheduledFor, status)
- `SMSTemplate`: (name), (disasterType, isActive)
- `User`: (phone), (location, state)
- `AlertLog`: (alertId, userId)

### Batch Processing
- Alerts sent in batches of 10 users
- 1-second delay between batches
- Prevents rate limiting
- Improves reliability

### Caching
- Template queries cached by disaster type
- User preferences cached in memory
- Stats aggregated efficiently

---

## Error Handling

### Common Errors & Solutions

**Error: "Message exceeds 160 character SMS limit"**
- Solution: Trim message or use shorter template

**Error: "Scheduled time must be in the future"**
- Solution: Ensure scheduledFor is > current time

**Error: "User has opted out of SMS alerts"**
- Solution: User needs to enable SMS in preferences

**Error: "Alert severity is below minimum threshold"**
- Solution: Either increase alert severity or lower user's threshold

**Error: "Currently in quiet hours"**
- Solution: Alert blocked due to user's quiet hours setting

---

## Workflow Examples

### Complete Admin Workflow
```
1. Create Template
   POST /api/sms-templates
   
2. Schedule Alert Using Template
   POST /api/scheduled-alerts (with templateId)
   
3. Monitor Alerts
   GET /api/scheduled-alerts
   GET /api/scheduled-alerts/stats/overview
   
4. View Results
   GET /api/sms-alerts/history
   
5. Manage Failed Alerts
   POST /api/sms-alerts/:id/retry-failed
```

### Complete User Workflow
```
1. View Current Preferences
   GET /api/user/sms-preferences
   
2. Toggle Disaster Types
   POST /api/user/sms-preferences/toggle/flood
   
3. Set Quiet Hours
   POST /api/user/sms-preferences/quiet-hours
   
4. Adjust Severity
   POST /api/user/sms-preferences/severity
   
5. Check Eligibility
   POST /api/user/sms-preferences/check
```

---

## Deployment Checklist

- [ ] Install node-cron package
- [ ] Update .env with SMS provider credentials
- [ ] Run database migrations for new models
- [ ] Initialize scheduler on server start
- [ ] Import all route files in server.js
- [ ] Add admin dashboard components
- [ ] Add user profile preferences component
- [ ] Test template creation
- [ ] Test alert scheduling
- [ ] Test preference updates
- [ ] Monitor first few scheduled sends
- [ ] Set up error logging/monitoring

---

## Support & Troubleshooting

### Scheduler Not Starting?
Check logs:
```javascript
const status = schedulerService.getSchedulerStatus();
if (!status.running) {
  console.error('Scheduler failed to start');
}
```

### No Alerts Being Sent?
1. Verify scheduled alerts exist: GET /api/scheduled-alerts?status=scheduled
2. Check user matching: Ensure location/state matches
3. Check preferences: POST /api/user/sms-preferences/check
4. View logs: Check AlertLog collection

### Rate Limiting Issues?
- Adjust batch size in smsService.js
- Increase inter-batch delay
- Use different SMS provider

---

## Next Steps

1. **Email Notifications** - Send email copies of SMS alerts to users
2. **Push Notifications** - Send mobile push notifications
3. **Webhook Integration** - Send alerts to external systems
4. **Custom Analytics** - Track alert engagement and response
5. **A/B Testing** - Test different message templates
6. **Multi-language Support** - Auto-translate alerts to user's language

---
