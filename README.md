# SurakshaFlow

**Real-Time Disaster Alert & Rescue Coordination System**

## 📌 Project Description
SurakshaFlow provides official disaster alerts, incident information, emergency/help requests, and rescue-team coordination.
It includes a user-facing interface, admin monitoring tools, and a voice-based emergency trigger system.

---

## 🚀 Features
- **Real-time disaster alerts** with live updates
- **Rescue operations dashboard** with mission and response management
- **Rescue team coordination** with live tracking
- **Google Maps integration** for location visualization
- **Real-time chat** between admin and rescue teams
- **Toast notifications** for new alerts
- **Live location tracking** for rescue teams
- **Voice assistant** for emergency (hands-free SOS)

---

## 🛠️ Technologies Used
- **Frontend**: React.js with Tailwind CSS
- **Backend API**: Node.js + Express
- **Real-time**: Socket.io
- **Maps**: Google Maps API
- **Voice Service**: Flask (Python)
- **Database**: MongoDB
- **Authentication**: JWT

---

## ⚙️ Installation and Run

### Prerequisites
- Node.js (v16+)
- MongoDB
- Python 3.8+ (for voice service)
- Google Maps API Key

### 1) Clone the project
```bash
git clone <your-repo-link>
cd SurakshaFlow
```

### 2) Environment Setup
Create `.env` file in backend directory:
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/ndma
JWT_SECRET=your_jwt_secret
GOOGLE_MAPS_API_KEY=your_google_maps_api_key
CORS_ORIGINS=http://localhost:3000,http://localhost:3002
```

### 3) Install frontend dependencies
```bash
cd frontend
npm install
```

### 4) Install backend dependencies
```bash
cd ../backend
npm install
```

### 5) Setup Python environment for voice assistant
```bash
cd ..
python -m venv .venv
.venv\Scripts\activate
pip install flask flask-cors requests
```

### 6) Start MongoDB
Make sure MongoDB is running on your system.

### 7) Start the application

**Terminal 1 - Backend:**
```bash
cd backend
npm start
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm start
```

**Terminal 3 - Voice Service (Optional):**
```bash
.venv\Scripts\activate
python flask_voice_service.py
```

### 8) Access the application
- **User Interface**: http://localhost:3000
- **Admin Dashboard**: http://localhost:3000/admin-dashboard
- **Login Credentials**:
  - Admin: admin@gmail.com / 123456
  - User: user@gmail.com / 123456
  - Rescue: rescue@gmail.com / 123456

---

## 📁 Project Structure
```
NDMA/
├── frontend/                 # React frontend
│   ├── src/
│   │   ├── components/       # React components
│   │   │   ├── AdminDashboard.jsx    # Admin dashboard
│   │   │   ├── Dashboard.jsx         # User dashboard
│   │   │   └── ...
│   │   ├── contexts/         # React contexts
│   │   ├── services/         # API services
│   │   └── api/              # Axios configuration
├── backend/                  # Node.js backend
│   ├── controllers/          # Route controllers
│   ├── models/              # MongoDB models
│   ├── routes/              # API routes
│   ├── middleware/          # Auth middleware
│   └── utils/               # Utilities
├── flask_voice_service.py    # Python voice service
└── README.md
```

---

## 🔧 API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration

### Alerts (Admin Protected)
- `GET /api/alerts` - Get all alerts
- `POST /api/alerts` - Create new alert
- `PUT /api/alerts/:id` - Update alert
- `DELETE /api/alerts/:id` - Delete alert
- `PUT /api/alerts/:id/assign` - Assign to rescue team
- `PUT /api/alerts/:id/status` - Update alert status

### Rescue Teams
- `GET /api/rescue/teams` - Get all rescue teams

### Real-time (Socket.io)
- `newAlert` - New alert notification
- `updateAlert` - Alert update notification
- `deleteAlert` - Alert deletion notification
- `chatMessage` - Real-time chat messages

---

## 🎯 Admin Dashboard Features

### 📊 Dashboard Cards
- Total Alerts count
- Pending Alerts
- Assigned Alerts
- Resolved Alerts
- Critical Alerts

### ➕ Create/Edit Alerts
- Form with all alert fields
- Real-time validation
- Socket.io integration

### 📋 Alerts Table
- Sortable columns
- Status dropdown updates
- Assign to rescue teams
- Edit/Delete actions
- Search functionality

### 🗺️ Google Maps Integration
- Alert location markers
- Info windows with details
- Interactive map controls

### 🚁 Rescue Team Tracking
- Live team locations
- Team status indicators
- Contact information
- Tracking buttons

### 💬 Real-Time Chat
- Chat with individual teams
- Message history
- Real-time messaging
- Team selection

### 🔔 Toast Notifications
- New alert notifications
- Auto-dismiss after 5 seconds
- Error styling for critical alerts

---

## 🔐 Authentication & Authorization

The system uses role-based access control:
- **Admin**: Full access to dashboard, create/edit alerts, assign teams
- **Rescue Team**: View assigned alerts, update status, chat
- **User**: View public alerts, emergency features

---

## 📱 Responsive Design

The admin dashboard is fully responsive and works on:
- Desktop computers
- Tablets
- Mobile devices

---

## 🚀 Deployment

### Backend Deployment
```bash
cd backend
npm run build
npm start
```

### Frontend Deployment
```bash
cd frontend
npm run build
serve -s build
```

### Environment Variables for Production
```env
NODE_ENV=production
MONGODB_URI=your_production_mongo_uri
JWT_SECRET=your_secure_jwt_secret
GOOGLE_MAPS_API_KEY=your_production_maps_key
```

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

---

## 📄 License

This project is licensed under the MIT License.
```

### 5) Run frontend
```bash
cd frontend
npm start
```

### 6) Run backend API
```bash
cd backend
npm start
```

### 7) Run voice assistant service
```bash
cd ..
python flask_voice_service.py
```

---

## 📱 Usage
- User can send alerts and track incidents
- Admin can monitor disasters and manage response
- Voice assistant can trigger SOS and create emergency alerts

---

## 👩‍💻 Author
Vaishnavi

