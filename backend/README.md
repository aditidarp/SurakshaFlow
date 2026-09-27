# SurakshaFlow - Disaster Alert & Rescue Coordination Backend

A production-ready Node.js + Express backend system for disaster management, real-time alerts, and rescue coordination with geospatial capabilities.

## 🚀 Features

### Core Functionality
- **User Roles & Authentication**
  - JWT-based authentication
  - Role-based access control (Admin, User, Rescue Team)
  - Secure password hashing with bcrypt

- **Disaster Alert Module**
  - Create, update, delete disaster alerts (Admin only)
  - Support for multiple disaster types (flood, earthquake, cyclone, fire, etc.)
  - Severity levels (Low, Medium, High, Critical)
  - GeoJSON-based location storage
  - Nearby alerts query using geospatial indexes

- **Rescue Coordination**
  - SOS request creation with live location
  - Nearby SOS requests for rescue teams
  - Rescue team assignment by admin
  - Status tracking (Pending → Assigned → In Progress → Rescued → Closed)
  - Nearby rescue teams query

- **Location & Mapping**
  - MongoDB geospatial queries (2dsphere indexes)
  - Compatible with Google Maps/OpenStreetMap
  - Radius-based search for alerts, SOS requests, and rescue teams

- **Security & Performance**
  - Password hashing (bcrypt)
  - Rate limiting for SOS requests (10/hour per IP)
  - Input validation
  - JWT token expiration (1 day)

- **Notification System**
  - Mock SMS/Email/Push notification service
  - Ready for integration with real services (Twilio, SendGrid, Firebase)

## 📁 Project Structure

```
backend/
├── models/              # Mongoose schemas
│   ├── User.js          # User model (admin, user, rescue_team)
│   ├── Alert.js         # Disaster alert model with GeoJSON
│   ├── SOSRequest.js    # SOS request model
│   └── RescueTeam.js    # Rescue team model
├── controllers/         # Business logic
│   ├── authController.js       # Registration & login
│   ├── alertsController.js     # Alert CRUD + geospatial queries
│   ├── sosController.js        # SOS creation & nearby queries
│   └── rescueController.js     # Team assignment & status updates
├── routes/              # API endpoints
│   ├── authRoutes.js
│   ├── alertsRoutes.js
│   ├── sosRoutes.js
│   └── rescueRoutes.js
├── middleware/          # Custom middleware
│   ├── authMiddleware.js       # JWT verification
│   ├── roleMiddleware.js       # Role-based access control
│   └── rateLimiter.js          # Rate limiting for SOS
├── services/            # External services
│   └── notificationService.js  # Mock notification service
├── config.js            # MongoDB connection
├── server.js            # Express server setup
├── .env                 # Environment variables
└── package.json         # Dependencies
```

## 🛠️ Installation & Setup

### Prerequisites
- Node.js (v16 or higher)
- MongoDB (local or Atlas)
- npm or yarn

### Step 1: Clone the Repository
```bash
cd backend
```

### Step 2: Install Dependencies
```bash
npm install
```

### Step 3: Configure Environment Variables
Create a `.env` file in the `backend` directory:

```env
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/ndma_disaster
JWT_SECRET=ndma_secret_key
OPENWEATHER_API_KEY=your_openweather_api_key
```

**Note:** 
- Replace `MONGO_URI` with your MongoDB connection string (local or Atlas)
- Replace `JWT_SECRET` with a strong secret key
- Get a free API key from [OpenWeatherMap](https://openweathermap.org/api) (optional)

### Step 4: Start MongoDB
If using local MongoDB:
```bash
mongod
```

### Step 5: Run the Server
**Development mode (with nodemon):**
```bash
npm run dev
```

**Production mode:**
```bash
npm start
```

The server will start on `http://localhost:5000`

### Step 6: Verify Installation
Open your browser or Postman and navigate to:
```
http://localhost:5000
```

You should see:
```json
{
  "status": "ok",
  "env": "development"
}
```

## 📚 API Documentation

See [API_DOCUMENTATION.md](./API_DOCUMENTATION.md) for complete API reference with request/response examples.

### Quick Start Examples

#### 1. Register a User
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "password": "password123",
    "role": "user"
  }'
```

#### 2. Login
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "password123"
  }'
```

#### 3. Create Alert (Admin)
```bash
curl -X POST http://localhost:5000/api/alerts \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "title": "Flood Warning",
    "description": "Heavy rainfall expected",
    "type": "flood",
    "lat": 19.0760,
    "lon": 72.8777,
    "severity": "High"
  }'
```

#### 4. Create SOS Request
```bash
curl -X POST http://localhost:5000/api/sos \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Jane Doe",
    "phone": "+91-9876543210",
    "message": "Need immediate help",
    "lat": 19.0760,
    "lon": 72.8777
  }'
```

#### 5. Get Nearby Alerts
```bash
curl "http://localhost:5000/api/alerts/nearby?lat=19.0760&lon=72.8777&radius=50000"
```

## 🗄️ Database Schema

### Collections
1. **users** - User accounts with roles
2. **alerts** - Disaster alerts with GeoJSON locations
3. **sosrequests** - Emergency SOS requests
4. **rescueteams** - Rescue team information

All location fields use **GeoJSON Point** format with **2dsphere indexes** for efficient geospatial queries.

## 🔐 Security Features

1. **Password Hashing**: bcrypt with 10 salt rounds
2. **JWT Authentication**: Tokens expire after 1 day
3. **Role-Based Access Control**: Admin, User, Rescue Team roles
4. **Rate Limiting**: 10 SOS requests per hour per IP
5. **Input Validation**: Required field validation
6. **Error Handling**: Comprehensive error messages

## 🧪 Testing

### Using Postman
1. Import the API endpoints from `API_DOCUMENTATION.md`
2. Create an environment with `baseUrl = http://localhost:5000`
3. Register a user and login to get JWT token
4. Use the token in Authorization header for protected routes

### Using cURL
See examples in the Quick Start section above.

## 📦 Dependencies

### Production
- **express** (^5.2.1) - Web framework
- **mongoose** (^9.1.4) - MongoDB ODM
- **bcryptjs** (^3.0.3) - Password hashing
- **jsonwebtoken** (^9.0.3) - JWT authentication
- **cors** (^2.8.5) - CORS middleware
- **dotenv** (^17.2.3) - Environment variables
- **axios** (^1.13.2) - HTTP client
- **express-rate-limit** - Rate limiting

### Development
- **nodemon** (^3.1.11) - Auto-restart on file changes

## 🚦 API Endpoints Summary

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/auth/register` | No | Register new user |
| POST | `/api/auth/login` | No | Login user |
| GET | `/api/alerts` | No | Get all alerts |
| GET | `/api/alerts/nearby` | No | Get nearby alerts |
| POST | `/api/alerts` | Admin | Create alert |
| PUT | `/api/alerts/:id` | Admin | Update alert |
| DELETE | `/api/alerts/:id` | Admin | Delete alert |
| POST | `/api/sos` | Optional | Create SOS request |
| GET | `/api/sos` | Yes | List SOS requests |
| GET | `/api/sos/nearby` | Yes | Get nearby SOS |
| POST | `/api/rescue/assign` | Admin | Assign rescue team |
| PUT | `/api/rescue/status/:sosId` | Yes | Update SOS status |
| GET | `/api/rescue/teams/nearby` | Yes | Get nearby teams |

## 🌐 Integration with Frontend

This backend is designed to work with any frontend framework (React, Vue, Angular, etc.). 

**CORS is enabled** for all origins in development. For production, update the CORS configuration in `server.js`:

```javascript
app.use(cors({
  origin: 'https://your-frontend-domain.com'
}));
```

## 🔧 Customization

### Adding Real Notification Services

Replace the mock notification service in `services/notificationService.js`:

**For SMS (Twilio):**
```javascript
const twilio = require('twilio');
const client = twilio(accountSid, authToken);

const sendSMS = async (phone, message) => {
  await client.messages.create({
    body: message,
    from: '+1234567890',
    to: phone
  });
};
```

**For Email (SendGrid):**
```javascript
const sgMail = require('@sendgrid/mail');
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

const sendEmail = async (email, subject, body) => {
  await sgMail.send({
    to: email,
    from: 'alerts@ndma.gov',
    subject,
    text: body
  });
};
```

## 📝 Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| PORT | Server port | 5000 |
| MONGO_URI | MongoDB connection string | mongodb://127.0.0.1:27017/ndma_disaster |
| JWT_SECRET | Secret key for JWT | ndma_secret_key |
| OPENWEATHER_API_KEY | OpenWeather API key | - |

## 🐛 Troubleshooting

### MongoDB Connection Error
- Ensure MongoDB is running: `mongod`
- Check `MONGO_URI` in `.env` file
- For Atlas, whitelist your IP address

### JWT Token Invalid
- Check if token is expired (1 day expiration)
- Verify `JWT_SECRET` matches between registration and login

### Geospatial Queries Not Working
- Ensure 2dsphere indexes are created (automatically on first query)
- Verify coordinates are in `[longitude, latitude]` order

## 📄 License

ISC

## 👥 Contributors

This is a college project for disaster management and rescue coordination.

## 🙏 Acknowledgments

- MongoDB for geospatial query capabilities
- Express.js for the robust web framework
- OpenWeatherMap for weather data integration

---

**For detailed API documentation, see [API_DOCUMENTATION.md](./API_DOCUMENTATION.md)**
