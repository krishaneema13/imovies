import http from 'http';
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { Server as SocketIOServer } from 'socket.io';

import { connectDB, closeDB } from './config/db.js';
import { seedDatabase } from './seed.js';
import { setIO } from './socket/socketManager.js';
import { setupSeatSocket } from './socket/seatSocket.js';
import { apiLimiter } from './middleware/rateLimiter.js';
import { errorHandler } from './middleware/errorHandler.js';

// Route imports
import authRoutes from './routes/authRoutes.js';
import movieRoutes from './routes/movieRoutes.js';
import theatreRoutes from './routes/theatreRoutes.js';
import showRoutes from './routes/showRoutes.js';
import bookingRoutes from './routes/bookingRoutes.js';
import notificationRoutes from './routes/notificationRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const app = express();
const server = http.createServer(app);

// Client origin configuration from environment (CLIENT_URL)
const rawClientUrl = process.env.CLIENT_URL || '';
const configuredClientOrigins = rawClientUrl
  ? rawClientUrl.split(',').map((u) => u.trim().replace(/\/$/, ''))
  : [];

const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:5174',
  'http://localhost:3000',
  'http://127.0.0.1:5173',
  'http://127.0.0.1:5174',
  ...configuredClientOrigins,
];

const corsOriginChecker = (origin, callback) => {
  // Allow requests with no origin (e.g. mobile apps, curl, server-to-server)
  if (!origin) return callback(null, true);

  const cleanOrigin = origin.replace(/\/$/, '');
  const isAllowed =
    allowedOrigins.includes(cleanOrigin) ||
    cleanOrigin.startsWith('http://localhost:') ||
    cleanOrigin.startsWith('http://127.0.0.1:') ||
    process.env.NODE_ENV !== 'production';

  if (isAllowed) {
    callback(null, true);
  } else {
    callback(new Error(`CORS policy does not allow access from origin: ${origin}`));
  }
};

// Socket.io configuration
const io = new SocketIOServer(server, {
  cors: {
    origin: (origin, callback) => corsOriginChecker(origin, callback),
    methods: ['GET', 'POST'],
    credentials: true,
  },
});
setIO(io);
setupSeatSocket(io);

app.use(
  cors({
    origin: corsOriginChecker,
    credentials: true,
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Apply rate limiting to all /api/ requests
app.use('/api/', apiLimiter);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    timestamp: new Date(),
    service: 'IMovies Cinema API',
    uptime: process.uptime(),
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/movies', movieRoutes);
app.use('/api/theatres', theatreRoutes);
app.use('/api/shows', showRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/admin', adminRoutes);

// 404 handler for unknown routes
app.use('/api/*', (req, res) => {
  res.status(404).json({
    success: false,
    message: `API endpoint '${req.originalUrl}' not found.`,
  });
});
// Serve the built frontend in production
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const distPath = path.join(__dirname, '../../dist');
app.use(express.static(distPath));
app.use((req, res, next) => {
  if (req.method !== 'GET' || req.path.startsWith('/api') || req.path.startsWith('/socket.io')) return next();
  res.sendFile(path.join(distPath, 'index.html'));
});

// Centralized Error Handling Middleware
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

// Connect to DB and start server
const startServer = async () => {
  await connectDB();
  await seedDatabase();

  server.listen(PORT, () => {
    console.log(`[Server] IMovies Backend running on http://localhost:${PORT}`);
  });
};

startServer();

// Handle termination signals
process.on('SIGINT', async () => {
  console.log('\n[Server] Shutting down gracefully...');
  await closeDB();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('\n[Server] SIGTERM received. Shutting down gracefully...');
  await closeDB();
  process.exit(0);
});

export default app;
