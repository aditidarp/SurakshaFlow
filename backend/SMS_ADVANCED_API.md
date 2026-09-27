# Advanced SMS Alert System - API Documentation

## Overview

This document describes the complete API for the advanced SMS Alert System supporting:
1. **SMS Templates** - Reusable message templates for different disaster types
2. **Scheduled Alerts** - Alerts scheduled for future delivery with recurring patterns
3. **User SMS Preferences** - Customizable notification settings per user

## Base URL
```
http://localhost:5000/api
```

## Authentication
All endpoints require JWT token in the `Authorization` header:
```
Authorization: Bearer <token>
```

---

## 1. SMS Templates API

### 1.1 Create Template
**POST** `/sms-templates`

**Required Role:** Admin

**Request Body:**
```json
{
  "name": "Flood Alert - High",
  "disasterType": "flood",
  "message": "🚨 FLOOD ALERT: High risk in {{location}}. Severity: {{severity}}. Move to safe area.",
  "description": "Template for high-severity flood alerts",
  "variables": ["{{location}}", "{{severity}}"],
  "isActive": true
}
```

**Response:**
```json
{
  "success": true,
  "message": "Template created successfully",
  "alert": {
    "_id": "template_id",
    "name": "Flood Alert - High",
    "disasterType": "flood",
    "message": "🚨 FLOOD ALERT: High risk in {{location}}...",
    "description": "Template for high-severity flood alerts",
    "variables": ["{{location}}", "{{severity}}"],
    "isActive": true,
    "createdBy": "admin_id",
    "usageCount": 0,
    "createdAt": "2024-01-15T10:00:00Z"
  }
}
```

**Notes:**
- Message cannot exceed 160 characters (SMS limit)
- Template name must be unique
- Variables should use `{{variableName}}` format

---

### 1.2 Get All Templates
**GET** `/sms-templates`

**Query Parameters:**
- `disasterType` (optional) - Filter by disaster type
- `isActive` (optional) - Filter by active status (true/false)
- `page` (optional) - Page number (default: 1)
- `limit` (optional) - Items per page (default: 10)

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "_id": "template_id",
      "name": "Flood Alert - High",
      "disasterType": "flood",
      "message": "🚨 FLOOD ALERT...",
      "usageCount": 5,
      "isActive": true,
      "createdBy": { "name": "Admin Name", "email": "admin@example.com" }
    }
  ],
  "pagination": {
    "current": 1,
    "total": 3,
    "count": 3
  }
}
```

---

### 1.3 Get Templates by Disaster Type
**GET** `/sms-templates/type/:disasterType`

**Path Parameters:**
- `disasterType` - flood, earthquake, cyclone, fire, landslide

**Response:**
```json
{
  "success": true,
  "data": [
    // Array of templates for specified disaster type
  ]
}
```

**Note:** Returns only active templates, sorted by usage (most popular first)

---

### 1.4 Get Single Template
**GET** `/sms-templates/:id`

**Response:**
```json
{
  "success": true,
  "data": {
    "_id": "template_id",
    "name": "Flood Alert - High",
    "disasterType": "flood",
    "message": "🚨 FLOOD ALERT...",
    "description": "Template for high-severity flood alerts",
    "variables": ["{{location}}", "{{severity}}"],
    "isActive": true,
    "createdBy": {
      "_id": "admin_id",
      "name": "Admin Name",
      "email": "admin@example.com"
    },
    "usageCount": 5,
    "createdAt": "2024-01-15T10:00:00Z",
    "updatedAt": "2024-01-15T11:00:00Z"
  }
}
```

---

### 1.5 Update Template
**PUT** `/sms-templates/:id`

**Required Role:** Admin

**Request Body:**
```json
{
  "name": "Flood Alert - Critical",
  "message": "Updated message content...",
  "isActive": true
}
```

**Note:** Send only fields you want to update

---

### 1.6 Delete Template
**DELETE** `/sms-templates/:id`

**Required Role:** Admin

**Response:**
```json
{
  "success": true,
  "message": "Template deleted successfully"
}
```

---

### 1.7 Track Template Usage
**POST** `/sms-templates/:id/use`

**Request Body:**
```json
{}
```

**Response:**
```json
{
  "success": true,
  "message": "Usage tracked",
  "usageCount": 6
}
```

**Note:** Automatically increments usage counter for analytics

---

## 2. Scheduled Alerts API

### 2.1 Schedule Alert
**POST** `/scheduled-alerts`

**Required Role:** Admin

**Request Body:**
```json
{
  "disasterType": "flood",
  "location": "Mumbai",
  "state": "Maharashtra",
  "severity": "High",
  "message": "🚨 FLOOD ALERT: Heavy rainfall expected. Stay indoors.",
  "templateId": "template_id (optional)",
  "scheduledFor": "2024-01-20T14:30:00Z",
  "recurPattern": "daily",
  "recurrenceEnd": "2024-02-20T23:59:59Z"
}
```

**Recurrence Patterns:**
- `once` - Single alert
- `daily` - Repeat daily
- `weekly` - Repeat weekly
- `monthly` - Repeat monthly

**Response:**
```json
{
  "success": true,
  "message": "Alert scheduled successfully",
  "alert": {
    "_id": "alert_id",
    "disasterType": "flood",
    "location": "Mumbai",
    "state": "Maharashtra",
    "severity": "High",
    "message": "🚨 FLOOD ALERT...",
    "scheduledFor": "2024-01-20T14:30:00Z",
    "recurPattern": "daily",
    "recurrenceEnd": "2024-02-20T23:59:59Z",
    "status": "scheduled",
    "createdBy": "admin_id",
    "createdAt": "2024-01-15T10:00:00Z"
  }
}
```

**Validation:**
- Scheduled time must be in the future
- Message cannot exceed 160 characters
- All required fields must be provided

---

### 2.2 Get Scheduled Alerts
**GET** `/scheduled-alerts`

**Query Parameters:**
- `status` (optional) - scheduled, sent, failed, cancelled
- `disasterType` (optional) - Filter by disaster type
- `state` (optional) - Filter by state
- `page` (optional) - Page number (default: 1)
- `limit` (optional) - Items per page (default: 10)

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "_id": "alert_id",
      "disasterType": "flood",
      "location": "Mumbai",
      "severity": "High",
      "message": "🚨 FLOOD ALERT...",
      "scheduledFor": "2024-01-20T14:30:00Z",
      "status": "scheduled",
      "recurPattern": "daily",
      "createdBy": { "name": "Admin Name" }
    }
  ],
  "pagination": {
    "current": 1,
    "total": 5,
    "count": 10
  }
}
```

---

### 2.3 Get Alert Statistics
**GET** `/scheduled-alerts/stats/overview`

**Response:**
```json
{
  "success": true,
  "stats": {
    "byStatus": {
      "scheduled": 15,
      "sent": 42,
      "failed": 3,
      "cancelled": 2
    },
    "byDisasterType": {
      "flood": 20,
      "earthquake": 15,
      "cyclone": 12,
      "fire": 10,
      "landslide": 5
    },
    "upcomingAlerts": 15
  }
}
```

---

### 2.4 Get Single Alert
**GET** `/scheduled-alerts/:id`

**Response:**
```json
{
  "success": true,
  "data": {
    "_id": "alert_id",
    "disasterType": "flood",
    "location": "Mumbai",
    "state": "Maharashtra",
    "severity": "High",
    "message": "🚨 FLOOD ALERT...",
    "templateId": {
      "_id": "template_id",
      "name": "Flood Alert - High",
      "message": "Original template message"
    },
    "scheduledFor": "2024-01-20T14:30:00Z",
    "recurPattern": "daily",
    "recurrenceEnd": "2024-02-20T23:59:59Z",
    "status": "scheduled",
    "sentAt": null,
    "failureReason": null,
    "createdBy": { "name": "Admin Name" },
    "createdAt": "2024-01-15T10:00:00Z"
  }
}
```

---

### 2.5 Update Scheduled Alert
**PUT** `/scheduled-alerts/:id`

**Note:** Can only update alerts with status "scheduled"

**Request Body:**
```json
{
  "scheduledFor": "2024-01-21T15:00:00Z",
  "message": "Updated message",
  "recurPattern": "weekly"
}
```

---

### 2.6 Cancel Scheduled Alert
**POST** `/scheduled-alerts/:id/cancel`

**Note:** Can only cancel alerts with status "scheduled"

**Response:**
```json
{
  "success": true,
  "message": "Scheduled alert cancelled successfully",
  "data": {
    "_id": "alert_id",
    "status": "cancelled"
  }
}
```

---

### 2.7 Get Pending Alerts (Internal)
**GET** `/scheduled-alerts/pending`

**Note:** Used by scheduler to get alerts ready to send

---

## 3. User SMS Preferences API

### 3.1 Get User Preferences
**GET** `/user/sms-preferences`

**Response:**
```json
{
  "success": true,
  "preferences": {
    "optInSMS": true,
    "phone": "+91999999999",
    "location": "Mumbai, Maharashtra",
    "floodAlerts": true,
    "earthquakeAlerts": true,
    "cycloneAlerts": false,
    "fireAlerts": true,
    "landslideAlerts": true,
    "minimumSeverity": "Medium",
    "quietHours": {
      "enabled": true,
      "startTime": "22:00",
      "endTime": "08:00"
    },
    "language": "english",
    "smsActivity": {
      "lastAlertReceived": "2024-01-15T10:30:00Z",
      "totalAlertsReceived": 45,
      "alertsThisMonth": 12
    }
  }
}
```

---

### 3.2 Update All Preferences
**PUT** `/user/sms-preferences`

**Request Body:**
```json
{
  "optInSMS": true,
  "smsPreferences": {
    "floodAlerts": true,
    "earthquakeAlerts": true,
    "cycloneAlerts": false,
    "fireAlerts": true,
    "landslideAlerts": true,
    "minimumSeverity": "High",
    "quietHours": {
      "enabled": true,
      "startTime": "22:00",
      "endTime": "08:00"
    },
    "language": "hindi"
  }
}
```

**Response:**
```json
{
  "success": true,
  "message": "SMS preferences updated successfully",
  "preferences": {
    "optInSMS": true,
    // ... updated preferences
  }
}
```

---

### 3.3 Toggle Disaster Alert Type
**POST** `/user/sms-preferences/toggle/:disasterType`

**Path Parameters:**
- `disasterType` - flood, earthquake, cyclone, fire, landslide

**Response:**
```json
{
  "success": true,
  "message": "flood alerts enabled",
  "preferences": {
    "floodAlerts": true,
    // ... other preferences
  }
}
```

---

### 3.4 Set Quiet Hours
**POST** `/user/sms-preferences/quiet-hours`

**Request Body:**
```json
{
  "enabled": true,
  "startTime": "22:00",
  "endTime": "08:00"
}
```

**Time Format:** HH:MM (24-hour format)

**Response:**
```json
{
  "success": true,
  "message": "Quiet hours updated successfully",
  "quietHours": {
    "enabled": true,
    "startTime": "22:00",
    "endTime": "08:00"
  }
}
```

---

### 3.5 Set Minimum Severity
**POST** `/user/sms-preferences/severity`

**Request Body:**
```json
{
  "severity": "High"
}
```

**Valid Severities:** Low, Medium, High, Critical

**Response:**
```json
{
  "success": true,
  "message": "Minimum severity set to High",
  "minimumSeverity": "High"
}
```

---

### 3.6 Check Alert Eligibility
**POST** `/user/sms-preferences/check`

**Request Body:**
```json
{
  "disasterType": "flood",
  "severity": "High"
}
```

**Response (Eligible):**
```json
{
  "eligible": true,
  "reason": "User is eligible to receive this alert"
}
```

**Response (Not Eligible):**
```json
{
  "eligible": false,
  "reason": "Alert severity (Low) is below minimum threshold (Medium)"
}
```

**Possible Rejection Reasons:**
- User has opted out of SMS alerts
- Disaster type alerts are disabled
- Alert severity below minimum threshold
- Currently in quiet hours

---

### 3.7 Get Activity Statistics
**GET** `/user/sms-preferences/activity`

**Response:**
```json
{
  "success": true,
  "activity": {
    "lastAlertReceived": "2024-01-15T10:30:00Z",
    "totalAlertsReceived": 45,
    "alertsThisMonth": 12
  }
}
```

---

## 4. SMS Alerts API (Immediate Sending)

### 4.1 Send Immediate Alert
**POST** `/sms-alerts`

**Required Role:** Admin

**Request Body:**
```json
{
  "disasterType": "flood",
  "location": "Mumbai",
  "state": "Maharashtra",
  "severity": "Critical",
  "message": "🚨 CRITICAL FLOOD ALERT: Evacuate immediately from low-lying areas.",
  "targetUsers": "location" // "location", "state", or "all"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Alert sent successfully",
  "alert": {
    "_id": "alert_id",
    "disasterType": "flood",
    "location": "Mumbai",
    "severity": "Critical",
    "totalRecipients": 2345,
    "successCount": 2340,
    "failureCount": 5,
    "status": "sent",
    "createdAt": "2024-01-15T10:00:00Z"
  }
}
```

---

### 4.2 Get Alert History
**GET** `/sms-alerts/history`

**Query Parameters:**
- `status` (optional) - sent, failed, pending
- `disasterType` (optional)
- `startDate` (optional) - ISO date
- `endDate` (optional) - ISO date
- `page` (optional)
- `limit` (optional)

---

### 4.3 Get Alert Details
**GET** `/sms-alerts/:id`

**Response includes:**
- Alert metadata
- SMS delivery logs
- User delivery status breakdown

---

### 4.4 Get Alert Statistics
**GET** `/sms-alerts/:id/stats`

**Response:**
```json
{
  "success": true,
  "stats": {
    "totalRecipients": 2345,
    "successCount": 2340,
    "failureCount": 5,
    "successRate": "99.79%",
    "avgDeliveryTime": "2.3s",
    "by_status": {
      "sent": 2340,
      "failed": 5,
      "pending": 0
    }
  }
}
```

---

### 4.5 Retry Failed SMS
**POST** `/sms-alerts/:id/retry-failed`

**Response:**
```json
{
  "success": true,
  "message": "Retry sent for 5 failed SMS",
  "retriedCount": 5
}
```

---

## Status Codes

- `200` - OK
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden (insufficient permissions)
- `404` - Not Found
- `500` - Server Error

---

## Error Response Format

```json
{
  "success": false,
  "message": "Error description",
  "error": "detailed error message"
}
```

---

## Rate Limiting

- SMS Alert Sending: 20 alerts per hour per admin
- API Requests: 100 requests per 15 minutes per user

---

## Database Schemas

### ScheduledAlert Model
```javascript
{
  disasterType: String,
  location: String,
  state: String,
  severity: String,
  message: String,
  templateId: ObjectId,
  scheduledFor: Date,
  recurPattern: String, // once, daily, weekly, monthly
  recurrenceEnd: Date,
  createdBy: ObjectId,
  status: String, // scheduled, sent, failed, cancelled
  sentAt: Date,
  failureReason: String
}
```

### SMSTemplate Model
```javascript
{
  name: String (unique),
  disasterType: String,
  message: String (max 160),
  description: String,
  variables: Array,
  isActive: Boolean,
  createdBy: ObjectId,
  usageCount: Number
}
```

### User SMS Preferences (in User Model)
```javascript
smsPreferences: {
  floodAlerts: Boolean,
  earthquakeAlerts: Boolean,
  cycloneAlerts: Boolean,
  fireAlerts: Boolean,
  landslideAlerts: Boolean,
  minimumSeverity: String,
  quietHours: {
    enabled: Boolean,
    startTime: String,
    endTime: String
  },
  language: String
}
```

---

## Implementation Notes

1. **Scheduled Alert Processing**: Runs every minute via node-cron to check and send due alerts
2. **User Filtering**: Alerts are sent only to users matching location/state AND passing preference checks
3. **Recurring Alerts**: New occurrences are auto-created when recurring alert is sent
4. **Quiet Hours**: Uses 24-hour format (HH:MM); alerts blocked during quiet period
5. **Template Variables**: Replace `{{variable}}` with actual values when sending

---

## Example Workflows

### Workflow 1: Create and Send Alert from Template
```
1. GET /sms-templates?disasterType=flood
2. Select template, note {{variables}} to fill
3. POST /scheduled-alerts with same message (or modified)
4. Scheduler processes at scheduledFor time
5. SMS sent to eligible users
```

### Workflow 2: User Customization Flow
```
1. GET /user/sms-preferences (show current settings)
2. User toggles disaster types, adjusts severity, sets quiet hours
3. PUT /user/sms-preferences (save changes)
4. POST /user/sms-preferences/check (test eligibility)
5. Future alerts respect these preferences
```

### Workflow 3: Admin Alert Management
```
1. Create template: POST /sms-templates
2. Track usage: POST /sms-templates/:id/use
3. Schedule alert: POST /scheduled-alerts
4. Monitor: GET /scheduled-alerts/stats/overview
5. Adjust: PUT /scheduled-alerts/:id
6. Cancel if needed: POST /scheduled-alerts/:id/cancel
```

---

## Testing with cURL

### Schedule an Alert
```bash
curl -X POST http://localhost:5000/api/scheduled-alerts \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "disasterType": "flood",
    "location": "Mumbai",
    "state": "Maharashtra",
    "severity": "High",
    "message": "Flood alert test",
    "scheduledFor": "2024-01-20T14:30:00Z"
  }'
```

### Create a Template
```bash
curl -X POST http://localhost:5000/api/sms-templates \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Template",
    "disasterType": "flood",
    "message": "Test message",
    "variables": ["{{location}}"]
  }'
```

### Get User Preferences
```bash
curl http://localhost:5000/api/user/sms-preferences \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---
