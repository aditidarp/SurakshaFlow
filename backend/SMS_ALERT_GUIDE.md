# SMS Alert System - Complete Implementation Guide

## 📋 Table of Contents
1. [Installation & Setup](#installation--setup)
2. [Twilio Configuration](#twilio-configuration)
3. [Fast2SMS Configuration (India)](#fast2sms-configuration-india)
4. [API Endpoints](#api-endpoints)
5. [Database Schema](#database-schema)
6. [Frontend Integration](#frontend-integration)
7. [Error Handling](#error-handling)
8. [Testing](#testing)

---

## Installation & Setup

### Backend Dependencies

```bash
cd backend
npm install express axios mongoose bcryptjs jsonwebtoken dotenv cors socket.io twilio express-rate-limit
```

### Add SMS API Keys to `.env`

```env
# SMS Configuration
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=your_auth_token_here
TWILIO_PHONE_NUMBER=+1234567890

# Alternative: Fast2SMS (India)
FAST2SMS_API_KEY=your_fast2sms_api_key_here
SMS_PROVIDER=twilio
```

---

## Twilio Configuration

### Get Twilio Credentials

1. **Sign up** at [https://www.twilio.com](https://www.twilio.com)
2. **Go to Console** → Account SID & Auth Token
3. **Buy a phone number** (e.g., +1234567890)
4. **Copy credentials** to `.env`

### Twilio SMS Pricing
- **US/Canada**: ~$0.0075 per SMS
- **India**: ~$0.01-0.05 per SMS
- **Free trial**: 1 million requests over first month

### Test Twilio (Node.js)

```javascript
const twilio = require('twilio');

const accountSid = 'ACxxx...';
const authToken = 'your_auth_token';
const client = twilio(accountSid, authToken);

client.messages.create({
  body: '🚨 ALERT: Flood in Aurangabad. Move to higher ground.',
  from: '+1234567890',
  to: '+919876543210'  // Indian number
})
.then(message => console.log('Sent:', message.sid))
.catch(err => console.error('Error:', err));
```

---

## Fast2SMS Configuration (India)

### Get Fast2SMS Credentials

1. **Sign up** at [https://www.fast2sms.com](https://www.fast2sms.com)
2. **Go to Dashboard** → API Key
3. **Add to `.env`**:
   ```env
   FAST2SMS_API_KEY=your_api_key
   SMS_PROVIDER=fast2sms
   ```

### Fast2SMS Pricing
- **India**: ~₹0.50-2 per SMS
- **High volume**: Bulk discounts available
- **60+ character messages**: Split as multiple SMS

### Test Fast2SMS

```javascript
const axios = require('axios');

const sendSMS = async (phoneNumber, message) => {
  try {
    const response = await axios.post('https://www.fast2sms.com/dev/bulkV2', {}, {
      headers: {
        authorization: 'your_fast2sms_api_key'
      },
      params: {
        message: message,
        numbers: phoneNumber.replace('+', ''),
        language: 'english'
      }
    });
    console.log('SMS Sent:', response.data);
  } catch (error) {
    console.error('Error:', error);
  }
};
```

---

## API Endpoints

### 1. Send SMS Alert
**POST** `/api/sms-alerts/send`

**Headers:**
```
Authorization: Bearer <jwt_token>
Content-Type: application/json
```

**Body:**
```json
{
  "disasterType": "flood",
  "location": "Aurangabad",
  "state": "Maharashtra",
  "severity": "High",
  "message": "Immediate evacuation required. Move to higher ground.",
  "description": "Heavy rainfall causing flash floods in low-lying areas"
}
```

**Response (Success):**
```json
{
  "success": true,
  "message": "Alert queued for sending to 5432 users",
  "alertLogId": "65a1b2c3d4e5f6g7h8i9j0k1",
  "totalUsers": 5432
}
```

**Response (Error):**
```json
{
  "success": false,
  "message": "No users found in the affected area",
  "alertLogId": "65a1b2c3d4e5f6g7h8i9j0k1"
}
```

**Rate Limit:** 20 alerts per hour per admin

---

### 2. Get Alert History
**GET** `/api/sms-alerts/history?status=completed&startDate=2024-01-01&endDate=2024-12-31`

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Query Parameters:**
- `status` (optional): pending, sending, completed, failed
- `startDate` (optional): ISO date string
- `endDate` (optional): ISO date string

**Response:**
```json
{
  "success": true,
  "count": 15,
  "alerts": [
    {
      "_id": "65a1b2c3d4e5f6g7h8i9j0k1",
      "disasterType": "flood",
      "location": "Aurangabad",
      "severity": "High",
      "totalUsersTargeted": 5432,
      "smsSuccessful": 5412,
      "smsFailed": 20,
      "status": "completed",
      "createdAt": "2024-01-15T10:30:00Z"
    }
  ]
}
```

---

### 3. Get Alert Details
**GET** `/api/sms-alerts/:alertId`

**Response:**
```json
{
  "success": true,
  "alert": {
    "_id": "65a1b2c3d4e5f6g7h8i9j0k1",
    "disasterType": "flood",
    "location": "Aurangabad",
    "message": "Immediate evacuation required",
    "smsLog": [
      {
        "userId": "65a1b2c3d4e5f6g7h8i9j0k2",
        "phone": "+919876543210",
        "status": "sent",
        "messageId": "SM123456789",
        "timestamp": "2024-01-15T10:35:00Z"
      }
    ]
  }
}
```

---

### 4. Get Alert Stats
**GET** `/api/sms-alerts/:alertId/stats`

**Response:**
```json
{
  "success": true,
  "stats": {
    "alertId": "65a1b2c3d4e5f6g7h8i9j0k1",
    "totalUsersTargeted": 5432,
    "smsAttempted": 5432,
    "smsSuccessful": 5412,
    "smsFailed": 20,
    "successRate": "99.63%",
    "status": "completed",
    "duration": "45.23 seconds"
  }
}
```

---

### 5. Retry Failed SMS
**POST** `/api/sms-alerts/:alertId/retry-failed`

**Response:**
```json
{
  "success": true,
  "message": "Retrying 20 failed SMS messages"
}
```

---

## Database Schema

### User Model Updates

```javascript
{
  name: String,
  email: String (unique),
  password: String,
  phone: String (required, unique) // +91XXXXXXXXXX
  location: String (required), // City/District
  state: String, // State name
  coordinates: {
    lat: Number,
    lng: Number
  },
  optInSMS: Boolean (default: true), // User consent
  role: String (user|admin|rescue_team),
  createdAt: Date,
  updatedAt: Date
}
```

### AlertLog Model

```javascript
{
  disasterType: String (enum: flood|earthquake|cyclone|fire|landslide),
  location: String,
  state: String,
  severity: String (enum: Low|Medium|High|Critical),
  message: String,
  description: String,
  createdBy: ObjectId (ref: User),
  totalUsersTargeted: Number,
  smsAttempted: Number,
  smsSuccessful: Number,
  smsFailed: Number,
  status: String (pending|sending|completed|failed),
  alertMessage: String,
  smsLog: [{
    userId: ObjectId,
    phone: String,
    status: String (sent|failed),
    messageId: String,
    error: String,
    timestamp: Date
  }],
  startTime: Date,
  endTime: Date,
  completedAt: Date,
  createdAt: Date
}
```

---

## Frontend Integration

### Component Usage

```jsx
import AdminSMSAlert from './components/AdminSMSAlert';

// In your routing:
<Route path="/admin/sms-alerts" element={<AdminSMSAlert />} />
```

### Features Provided

1. **Alert Form**
   - Disaster type selector
   - Location & state input
   - Severity level selection
   - Custom message (160 char limit)
   - SMS preview before sending

2. **History & Monitoring**
   - Alert history with status
   - Real-time stats display
   - Success/failure rates
   - Retry failed SMS button
   - Filter by status & date

3. **Visual Indicators**
   - Color-coded severity levels
   - Status icons (✅ ⏳ ❌)
   - Progress animations
   - Success/failure counters

---

## Error Handling

### Common Errors & Solutions

| Error | Cause | Solution |
|-------|-------|----------|
| `"Unterminated regular expression"` | Syntax error | Check message format |
| `"Twilio API Error"` | Invalid credentials | Verify .env variables |
| `"No users found"` | Location mismatch | Check user location data |
| `"Rate limit exceeded"` | Too many requests | Wait 1 hour before next batch |
| `"Invalid phone number"` | Wrong format | Use +CCXXXXXXXXXX format |

### Error Response Format

```json
{
  "success": false,
  "message": "User-friendly error message",
  "error": "Technical error details",
  "alertLogId": "for tracking"
}
```

---

## Testing

### Test with Sample Data

```bash
# 1. Create test users with phone numbers
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "password": "test123",
    "phone": "+919876543210",
    "location": "Aurangabad",
    "state": "Maharashtra"
  }'

# 2. Login and get token
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@example.com",
    "password": "123456"
  }'

# 3. Send test alert
curl -X POST http://localhost:5000/api/sms-alerts/send \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "disasterType": "flood",
    "location": "Aurangabad",
    "state": "Maharashtra",
    "severity": "High",
    "message": "🚨 FLOOD ALERT: Seek higher ground immediately!",
    "description": "Heavy rainfall causing flash floods"
  }'
```

### Load Testing

```bash
# Test rate limiting (20 alerts per hour)
for i in {1..25}; do
  curl -X POST http://localhost:5000/api/sms-alerts/send \
    -H "Authorization: Bearer TOKEN" \
    -H "Content-Type: application/json" \
    -d @alert_payload.json
done
```

---

## Performance Considerations

### Optimization Tips

1. **Batch Processing**
   - Sends SMS in batches of 10
   - 1-second delay between batches
   - Prevents API rate limits

2. **Async Processing**
   - Alert response sent immediately
   - SMS sending happens in background
   - User sees status updates via polling

3. **Database Indexing**
   - Index on location + createdAt
   - Index on status field
   - Indexed on phone number (unique)

4. **Caching**
   - Cache location-based user lists (5 min TTL)
   - Cache frequency-used disaster types
   - Cache SMS templates

---

## Security Considerations

1. **Authentication**
   - Admin-only SMS endpoints
   - JWT token validation required
   - Role-based access control

2. **Rate Limiting**
   - 20 alerts per hour per admin
   - 100 history requests per 15 mins
   - Prevents SMS spam

3. **Data Privacy**
   - Hash phone numbers in logs
   - Mask sensitive data in responses
   - Comply with GDPR/DND regulations

4. **Audit Logging**
   - Log all sent alerts with timestamps
   - Track failed SMS attempts
   - Monitor suspicious activity

---

## Deployment

### Environment Variables Checklist

- [ ] TWILIO_ACCOUNT_SID
- [ ] TWILIO_AUTH_TOKEN
- [ ] TWILIO_PHONE_NUMBER
- [ ] FAST2SMS_API_KEY (optional)
- [ ] SMS_PROVIDER
- [ ] MONGO_URI
- [ ] JWT_SECRET
- [ ] CORS_ORIGINS

### Production Checklist

- [ ] Use environment-specific keys
- [ ] Enable HTTPS for API calls
- [ ] Set up monitoring & alerts
- [ ] Configure backup SMS provider
- [ ] Test failover scenarios
- [ ] Document SMS costs & budgets

---

## Support & Troubleshooting

### Debugging Steps

1. **Check .env variables**
   ```bash
   cat backend/.env | grep SMS
   ```

2. **Test SMS service directly**
   ```bash
   node -e "require('./backend/services/smsService').sendSMS('+919876543210', 'Test')"
   ```

3. **Check MongoDB connection**
   ```bash
   mongosh "mongodb://127.0.0.1:27017/ndma_disaster"
   ```

4. **Monitor logs**
   ```bash
   tail -f logs/sms-alerts.log
   ```

---

## FAQ

**Q: Can I use SMS API without Twilio?**
A: Yes! Use Fast2SMS for India-specific solution. Modify `smsService.js` to use `sendSMSFast2SMS()`.

**Q: What's the SMS character limit?**
A: 160 characters for single SMS. Over 160 = multiple SMS charges.

**Q: How to handle failed SMS?**
A: Use "Retry Failed" button to resend failed messages within 24 hours.

**Q: Can admins schedule alerts?**
A: Currently sends immediately. Can be extended to support scheduled sending.

**Q: How to export SMS logs?**
A: Access `GET /api/sms-alerts/history` and export JSON/CSV.
