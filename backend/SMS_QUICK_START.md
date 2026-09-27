# SMS Alert System - Quick Start Guide

## 🚀 Start in 5 Minutes

### Step 1: Get Twilio Credentials
1. Sign up at https://www.twilio.com
2. Copy **Account SID** and **Auth Token** from dashboard
3. Buy a phone number (e.g., +1234567890)

### Step 2: Update .env
```env
TWILIO_ACCOUNT_SID=AC...
TWILIO_AUTH_TOKEN=...
TWILIO_PHONE_NUMBER=+1234567890
SMS_PROVIDER=twilio
```

### Step 3: Update User Model
Users must have:
- `phone` (required, unique)
- `location` (required)
- `state` (optional)
- `optInSMS` (default: true)

Example user:
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "phone": "+919876543210",
  "location": "Aurangabad",
  "state": "Maharashtra",
  "optInSMS": true
}
```

### Step 4: Access Admin Panel
- Go to `/admin/sms-alerts`
- Fill the form with disaster details
- Click "Send Alert to Users"

---

## 📊 API Quick Reference

### Send Alert
```bash
POST /api/sms-alerts/send
Content-Type: application/json
Authorization: Bearer <JWT_TOKEN>

{
  "disasterType": "flood",
  "location": "Aurangabad",
  "state": "Maharashtra",
  "severity": "High",
  "message": "Evacuate immediately to higher ground",
  "description": "Flash floods in low-lying areas"
}
```

### Get History
```bash
GET /api/sms-alerts/history
Authorization: Bearer <JWT_TOKEN>
```

### Get Stats
```bash
GET /api/sms-alerts/:alertId/stats
Authorization: Bearer <JWT_TOKEN>
```

### Retry Failed
```bash
POST /api/sms-alerts/:alertId/retry-failed
Authorization: Bearer <JWT_TOKEN>
```

---

## 🔧 Troubleshooting

| Issue | Fix |
|-------|-----|
| "No users found" | Users' location must match alert location |
| SMS not sending | Check Twilio credentials in .env |
| Permission denied | Ensure user is admin |
| Rate limit error | Wait 1 hour before sending more alerts |

---

## 📝 SMS Message Format

Format:
```
[EMOJI] ALERT [SEVERITY]: DISASTER in LOCATION. MESSAGE
```

Example:
```
🌊 ALERT [HIGH]: Flood in Aurangabad. Evacuate to higher ground immediately!
```

---

## 💰 Cost Estimation

| Provider | Cost | Notes |
|----------|------|-------|
| Twilio | $0.0075/SMS (US) | Global coverage |
| Fast2SMS | ₹0.50-2 (India) | India-specific |

For 1,000 users: ~$7.50 (Twilio) or ₹500-2000 (Fast2SMS)

---

## 🎯 Key Features

✅ Auto-locate users in affected area  
✅ Bulk SMS with retry mechanism  
✅ Real-time success tracking  
✅ Admin rate limiting (20/hour)  
✅ Audit logging of all alerts  
✅ SMS preview before sending  
✅ Beautiful admin dashboard  
✅ Mobile-responsive design  

---

## 📚 Full Documentation

See `SMS_ALERT_GUIDE.md` for comprehensive guide including:
- Setup instructions
- Advanced configuration
- Testing procedures
- Security guidelines
- Deployment checklist
