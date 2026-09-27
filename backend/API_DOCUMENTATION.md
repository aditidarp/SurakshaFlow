# SurakshaFlow Disaster Management System - API Documentation

## Base URL
```
http://localhost:5000
```

## Authentication
Most endpoints require JWT authentication. Include the token in the `Authorization` header:
```
Authorization: Bearer <your_jwt_token>
```

---

## Authentication Endpoints

### 1. Register User
**POST** `/api/auth/register`

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "role": "user"
}
```

**Roles:** `user`, `admin`, `rescue_team`

**Response (201):**
```json
{
  "message": "User registered successfully"
}
```

---

### 2. Login
**POST** `/api/auth/login`

**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "password123"
}
```

**Response (200):**
```json
{
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "role": "user"
}
```

---

## Alert Endpoints

### 3. Get All Alerts
**GET** `/api/alerts`

**Auth:** Not required (public)

**Response (200):**
```json
[
  {
    "_id": "60d5ec49f1b2c72b8c8e4f1a",
    "title": "Flood Warning",
    "description": "Heavy rainfall expected in coastal areas",
    "type": "flood",
    "location": {
      "type": "Point",
      "coordinates": [75.8577, 22.7196]
    },
    "severity": "High",
    "date": "2024-01-20T10:30:00.000Z",
    "createdBy": "60d5ec49f1b2c72b8c8e4f1b",
    "createdAt": "2024-01-20T10:30:00.000Z",
    "updatedAt": "2024-01-20T10:30:00.000Z"
  }
]
```

---

### 4. Get Nearby Alerts
**GET** `/api/alerts/nearby?lat=22.7196&lon=75.8577&radius=50000`

**Auth:** Not required (public)

**Query Parameters:**
- `lat` (required): Latitude
- `lon` (required): Longitude
- `radius` (optional): Search radius in meters (default: 50000)

**Response (200):**
```json
[
  {
    "_id": "60d5ec49f1b2c72b8c8e4f1a",
    "title": "Flood Warning",
    "description": "Heavy rainfall expected",
    "type": "flood",
    "location": {
      "type": "Point",
      "coordinates": [75.8577, 22.7196]
    },
    "severity": "High"
  }
]
```

---

### 5. Create Alert (Admin Only)
**POST** `/api/alerts`

**Auth:** Required (Admin only)

**Request Body:**
```json
{
  "title": "Earthquake Alert",
  "description": "Magnitude 6.5 earthquake detected",
  "type": "earthquake",
  "lat": 28.7041,
  "lon": 77.1025,
  "severity": "Critical"
}
```

**Response (201):**
```json
{
  "message": "Alert created successfully",
  "alert": {
    "_id": "60d5ec49f1b2c72b8c8e4f1c",
    "title": "Earthquake Alert",
    "type": "earthquake",
    "location": {
      "type": "Point",
      "coordinates": [77.1025, 28.7041]
    },
    "severity": "Critical"
  }
}
```

---

### 6. Update Alert (Admin Only)
**PUT** `/api/alerts/:id`

**Auth:** Required (Admin only)

**Request Body:**
```json
{
  "severity": "Medium",
  "description": "Updated description"
}
```

**Response (200):**
```json
{
  "message": "Alert updated successfully",
  "alert": { ... }
}
```

---

### 7. Delete Alert (Admin Only)
**DELETE** `/api/alerts/:id`

**Auth:** Required (Admin only)

**Response (200):**
```json
{
  "message": "Alert deleted successfully"
}
```

---

## SOS Endpoints

### 8. Create SOS Request
**POST** `/api/sos`

**Auth:** Optional (can be public for emergency)

**Request Body:**
```json
{
  "name": "Jane Doe",
  "phone": "+91-9876543210",
  "message": "Trapped in building, need immediate help",
  "lat": 19.0760,
  "lon": 72.8777
}
```

**Response (201):**
```json
{
  "message": "SOS created",
  "sos": {
    "_id": "60d5ec49f1b2c72b8c8e4f1d",
    "name": "Jane Doe",
    "phone": "+91-9876543210",
    "message": "Trapped in building",
    "location": {
      "type": "Point",
      "coordinates": [72.8777, 19.0760]
    },
    "status": "Pending",
    "createdAt": "2024-01-20T11:00:00.000Z"
  }
}
```

---

### 9. List SOS Requests
**GET** `/api/sos?limit=50`

**Auth:** Required (Admin/Rescue Team)

**Query Parameters:**
- `limit` (optional): Number of results (default: 50)

**Response (200):**
```json
[
  {
    "_id": "60d5ec49f1b2c72b8c8e4f1d",
    "name": "Jane Doe",
    "phone": "+91-9876543210",
    "location": {
      "type": "Point",
      "coordinates": [72.8777, 19.0760]
    },
    "status": "Pending"
  }
]
```

---

### 10. Get Nearby SOS Requests
**GET** `/api/sos/nearby?lat=19.0760&lon=72.8777&radius=5000`

**Auth:** Required (Rescue Team)

**Query Parameters:**
- `lat` (required): Latitude
- `lon` (required): Longitude
- `radius` (optional): Search radius in meters (default: 5000)

**Response (200):**
```json
[
  {
    "_id": "60d5ec49f1b2c72b8c8e4f1d",
    "name": "Jane Doe",
    "location": {
      "type": "Point",
      "coordinates": [72.8777, 19.0760]
    },
    "status": "Pending"
  }
]
```

---

## Rescue Coordination Endpoints

### 11. Assign Rescue Team (Admin Only)
**POST** `/api/rescue/assign`

**Auth:** Required (Admin only)

**Request Body:**
```json
{
  "sosId": "60d5ec49f1b2c72b8c8e4f1d",
  "teamId": "60d5ec49f1b2c72b8c8e4f1e"
}
```

**Response (200):**
```json
{
  "message": "Team assigned",
  "sos": {
    "_id": "60d5ec49f1b2c72b8c8e4f1d",
    "status": "Assigned",
    "assignedTeam": "60d5ec49f1b2c72b8c8e4f1e"
  }
}
```

---

### 12. Update SOS Status
**PUT** `/api/rescue/status/:sosId`

**Auth:** Required (Admin/Rescue Team)

**Request Body:**
```json
{
  "status": "In Progress"
}
```

**Valid Statuses:** `Pending`, `Assigned`, `In Progress`, `Rescued`, `Closed`

**Response (200):**
```json
{
  "message": "Status updated",
  "sos": {
    "_id": "60d5ec49f1b2c72b8c8e4f1d",
    "status": "In Progress"
  }
}
```

---

### 13. Get Nearby Rescue Teams
**GET** `/api/rescue/teams/nearby?lat=19.0760&lon=72.8777&radius=50000`

**Auth:** Required

**Query Parameters:**
- `lat` (required): Latitude
- `lon` (required): Longitude
- `radius` (optional): Search radius in meters (default: 50000)

**Response (200):**
```json
[
  {
    "_id": "60d5ec49f1b2c72b8c8e4f1e",
    "name": "Mumbai Rescue Team Alpha",
    "contact": "+91-9876543211",
    "members": [
      { "name": "Officer A", "phone": "+91-9876543212" }
    ],
    "location": {
      "type": "Point",
      "coordinates": [72.8777, 19.0760]
    },
    "active": true
  }
]
```

---

## Weather Integration

### 14. Get Weather-Based Alerts
**GET** `/api/alerts/weather?city=Mumbai`

**OR**

**GET** `/api/alerts/weather?lat=19.0760&lon=72.8777`

**Auth:** Not required

**Response (200):**
```json
{
  "city": "Mumbai",
  "alerts": [
    {
      "alert": "Heat Wave Alert",
      "description": "Extreme temperature detected",
      "lat": 19.0760,
      "lng": 72.8777,
      "temperature": 42
    }
  ]
}
```

---

## Notifications

### 15. Send SMS Notification (Admin Only)
**POST** `/api/notify/sms`

**Auth:** Required (Admin only)

**Request Body:**
```json
{
  "phone": "+911234567890",
  "message": "Evacuate immediately: Flood warning in your area"
}
```

**Response (200):**
```json
{ "message": "SMS sent (mock)", "success": true }
```

**Notes:** This endpoint calls `notificationService.sendSMS`. The server will attempt to use Twilio when the following environment variables are set:

- `TWILIO_ACCOUNT_SID` — your Twilio account SID
- `TWILIO_AUTH_TOKEN` — your Twilio auth token
- `TWILIO_FROM` — a valid Twilio phone number in E.164 format (e.g., +15551234567)

If these variables are not present or Twilio fails to initialize, the service falls back to a mock logger that prints SMS contents to the server log (safe for local development).

Example `.env` entries:
```
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=your_auth_token
TWILIO_FROM=+15551234567
```

Caveats:

- Ensure `TWILIO_FROM` is a Twilio-owned/verified number in your account.
- Use E.164 formatted `phone` values (e.g., +919876543210) to avoid delivery issues.
- After updating `package.json`, run `cd backend && npm install` to install the `twilio` package.

---

## Error Responses

### 400 Bad Request
```json
{
  "message": "lat & lon required"
}
```

### 401 Unauthorized
```json
{
  "message": "Unauthorized: token missing"
}
```

### 403 Forbidden
```json
{
  "message": "Only admin can create alerts"
}
```

### 404 Not Found
```json
{
  "message": "SOS not found"
}
```

### 500 Server Error
```json
{
  "message": "Server error",
  "error": { ... }
}
```

---

## Rate Limiting

SOS creation endpoints are rate-limited to **10 requests per hour per IP** to prevent abuse.

**Rate Limit Response (429):**
```json
{
  "message": "Too many SOS requests from this IP, please try later."
}
```

---

## Database Models

### User Schema
```javascript
{
  name: String,
  email: String (unique),
  password: String (hashed),
  role: "user" | "admin" | "rescue_team",
  timestamps: true
}
```

### Alert Schema
```javascript
{
  title: String,
  description: String,
  type: String, // flood, earthquake, fire, cyclone, etc.
  location: {
    type: "Point",
    coordinates: [longitude, latitude]
  },
  severity: "Low" | "Medium" | "High" | "Critical",
  date: Date,
  createdBy: ObjectId (User),
  timestamps: true
}
```

### SOS Request Schema
```javascript
{
  user: ObjectId (User, optional),
  name: String,
  phone: String,
  message: String,
  location: {
    type: "Point",
    coordinates: [longitude, latitude]
  },
  status: "Pending" | "Assigned" | "In Progress" | "Rescued" | "Closed",
  assignedTeam: ObjectId (RescueTeam),
  timestamps: true
}
```

### Rescue Team Schema
```javascript
{
  name: String,
  contact: String,
  members: [{ name: String, phone: String }],
  location: {
    type: "Point",
    coordinates: [longitude, latitude]
  },
  active: Boolean,
  timestamps: true
}
```

---

## Notes

1. **GeoJSON Format**: All location fields use GeoJSON Point format with `[longitude, latitude]` order.
2. **Geospatial Indexes**: All models with location fields have 2dsphere indexes for efficient geospatial queries.
3. **Authentication**: JWT tokens expire after 1 day.
4. **Password Security**: All passwords are hashed using bcrypt with 10 salt rounds.
5. **Notifications**: Mock notification service logs to console (can be replaced with real SMS/Email/Push services).
