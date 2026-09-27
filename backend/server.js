const express = require("express");
const app = express();
const cors = require("cors");
const dotenv = require("dotenv");
const connectDB = require("./config");
const seedTestUsers = require("./utils/seedTestUsers");
const externalAlertMonitor = require('./services/externalAlertMonitor');
const http = require('http');
const net = require('net');
const { Server } = require('socket.io');

// load env
dotenv.config();

// connect to MongoDB and start server
(async () => {
  try {
    await connectDB();
    // Seed test users for development
    await seedTestUsers();
  } catch (err) {
    console.error("Failed to start server:", err);
    process.exit(1);
  }
})()

// middlewares
const FRONTEND_ORIGINS = (process.env.CORS_ORIGINS || 'http://localhost:3000,http://localhost:3002')
  .split(',')
  .map(s => s.trim());

const corsOptions = {
  origin: (origin, callback) => {
    if (!origin) return callback(null, true); // allow non-browser requests like curl
    if (FRONTEND_ORIGINS.indexOf(origin) !== -1) return callback(null, true);
    return callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
  optionsSuccessStatus: 200,
};

app.use(cors(corsOptions));
app.use(express.json({
  verify: (req, res, buf) => {
    try {
      req.rawBody = buf.toString();
    } catch (err) {
      req.rawBody = "";
    }
  }
}));

// debug middleware for JSON parsing errors
app.use((req, res, next) => {
  if (req.rawBody && req.rawBody.startsWith('{') === false) {
    console.log('[DEBUG] Raw request body is not JSON:', req.rawBody);
  }
  next();
});

// routes (mounted after socket.io initialization below where needed)
app.use("/api/alerts", require("./routes/alertsRoutes"));
app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/weather", require("./routes/weatherRoutes"));
app.use("/api/chat", require("./routes/chatRoutes"));
app.use("/api/stream", require("./routes/streamRoutes"));
app.use('/api/sos', require('./routes/sosRoutes'));
app.use('/api/rescue', require('./routes/rescueRoutes'));
app.use('/api/disasters', require('./routes/disasterRoutes'));
app.use('/api/earthquakes', require('./routes/earthquakeRoutes'));
// SMS Alert System (NEW)
app.use('/api/sms-alerts', require('./routes/smsRoutes'));
app.use('/api/sms-templates', require('./routes/smsTemplateRoutes'));
app.use('/api/scheduled-alerts', require('./routes/scheduledAlertRoutes'));
app.use('/api/user/sms-preferences', require('./routes/smsPreferencesRoutes'));

// Real-time External Alerts (Live API data)
app.use('/api/real-alerts', require('./routes/realAlertsRoutes'));

// healthcheck
app.get("/", (req, res) => res.json({ status: "ok", env: process.env.NODE_ENV || "development" }));

// 404 handler
app.use((req, res) => {
  res.status(404).json({ message: "Not Found" });
});

// global error handler (simple)
app.use((err, req, res, next) => {
  console.error(err);
  res.status(err.status || 500).json({ message: err.message || "Internal Server Error" });
});

// create http server and attach socket.io
const server = http.createServer(app);

const BASE_PORT = Number(process.env.PORT) || 5000;

const io = new Server(server, {
  cors: {
    origin: FRONTEND_ORIGINS,
    methods: ["GET", "POST"],
    credentials: true,
  }
});

io.on('connection', (socket) => {
  console.log('✅ Socket connected:', socket.id);

  socket.on('disconnect', (reason) => {
    console.log('❌ Socket disconnected:', socket.id, reason);
  });

  // Real-time Alert Events
  // Client-originated alert broadcasts have been disabled.
});

// attach io to app locals so routes can access it
app.set('io', io);

// keep server running
const findAvailablePort = (port) => new Promise((resolve) => {
  const tester = net.createServer();

  tester.once('error', () => {
    resolve(findAvailablePort(port + 1));
  });

  tester.once('listening', () => {
    tester.close(() => resolve(port));
  });

  tester.listen(port);
});

const startServer = async () => {
  const port = await findAvailablePort(BASE_PORT);
  if (port !== BASE_PORT) {
    console.warn(`Port ${BASE_PORT} is already in use. Using ${port} instead.`);
  }

  server.listen(port, async () => {
    console.log(`\n🚀 Server running on port ${port}\n`);
    
    // Initialize scheduled alert processor
    const schedulerService = require('./services/schedulerService');
    schedulerService.initializeScheduler();

    // Initialize external alert monitor and emit live updates
    externalAlertMonitor.initializeExternalAlertMonitor(io, Number(process.env.OFFICIAL_ALERT_POLL_SECONDS) || 300);
  });
};

startServer();