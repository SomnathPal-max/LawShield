require('dotenv').config();
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

const { connectDB } = require('./config/db');
const { seedMongoIfNeeded } = require('./services/dataStore');

// Import Routes
const authRoutes = require('./routes/authRoutes');
const aiRoutes = require('./routes/aiRoutes');
const chatRoutes = require('./routes/chatRoutes');
const consultationRoutes = require('./routes/consultationRoutes');
const lawyerRoutes = require('./routes/lawyerRoutes');
const evidenceRoutes = require('./routes/evidenceRoutes');
const emergencyRoutes = require('./routes/emergencyRoutes');
const lawsRoutes = require('./routes/lawsRoutes');
const documentRoutes = require('./routes/documentRoutes');
const adminRoutes = require('./routes/adminRoutes');
const caseRoutes = require('./routes/caseRoutes');
const courseRoutes = require('./routes/courseRoutes');

const app = express();
const server = http.createServer(app);

// Socket.io initialization with CORS
const io = new Server(server, {
  cors: {
    origin: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true,
  },
});

// Middleware
app.use(cors({
  origin: true,
  credentials: true,
}));
app.use(express.json({ limit: '25mb' }));
app.use(express.urlencoded({ extended: true, limit: '25mb' }));

// Static uploads directory
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}
app.use('/uploads', express.static(uploadsDir));

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    service: 'LawShield API & WebRTC Engine',
    timestamp: new Date().toISOString(),
  });
});

// Mount Routes
app.use('/api/auth', authRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/consultations', consultationRoutes);
app.use('/api/lawyers', lawyerRoutes);
app.use('/api/evidence', evidenceRoutes);
app.use('/api/emergency', emergencyRoutes);
app.use('/api/laws', lawsRoutes);
app.use('/api/documents', documentRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/cases', caseRoutes);
app.use('/api/courses', courseRoutes);

// Socket.IO Real-Time & WebRTC Signaling
const onlineUsers = new Map(); // userId -> socketId

io.on('connection', (socket) => {
  console.log(`[Socket.IO] New connection: ${socket.id}`);

  // User online registration (supports user-online and register-user)
  const handleUserOnline = (userId) => {
    if (userId) {
      onlineUsers.set(userId, socket.id);
      io.emit('online-users-update', Array.from(onlineUsers.keys()));
      io.emit('online-users', Array.from(onlineUsers.keys()));
      console.log(`[Socket.IO] User registered online: ${userId}`);
    }
  };

  socket.on('user-online', (userId) => handleUserOnline(userId));
  socket.on('register-user', (data) => handleUserOnline(data?.userId || data));

  // Join a consultation/chat room
  socket.on('join-room', (roomId) => {
    socket.join(roomId);
    console.log(`[Socket.IO] Socket ${socket.id} joined room ${roomId}`);
  });

  socket.on('join-conversation', (data) => {
    const roomId = data?.conversationId || data;
    if (roomId) {
      socket.join(roomId);
      console.log(`[Socket.IO] Socket ${socket.id} joined conversation ${roomId}`);
    }
  });

  // Send message inside room
  socket.on('send-message', (data) => {
    const targetRoom = data.roomId || data.conversationId;
    if (targetRoom) {
      socket.to(targetRoom).emit('receive-message', data);
      socket.to(targetRoom).emit('new-message', data.message || data);
    }
  });

  // Typing indicators
  socket.on('typing', ({ roomId, userName }) => {
    socket.to(roomId).emit('user-typing', { userName });
  });

  socket.on('stop-typing', ({ roomId }) => {
    socket.to(roomId).emit('user-stop-typing');
  });

  // WebRTC Signaling for Video Consultation
  socket.on('call-user', (data) => {
    console.log(`[WebRTC] Initiating call from ${data.fromName} in room ${data.roomId}`);
    socket.to(data.roomId).emit('call-made', {
      offer: data.offer,
      socket: socket.id,
      from: data.from,
      fromName: data.fromName,
      callType: data.callType || 'video',
    });
  });

  socket.on('make-answer', (data) => {
    console.log(`[WebRTC] Answering call in room ${data.roomId}`);
    socket.to(data.roomId).emit('answer-made', {
      socket: socket.id,
      answer: data.answer,
    });
  });

  socket.on('ice-candidate', (data) => {
    socket.to(data.roomId).emit('ice-candidate', {
      candidate: data.candidate,
    });
  });

  socket.on('end-call', (data) => {
    if (data.roomId) {
      socket.to(data.roomId).emit('call-ended');
    }
  });

  // Disconnect handler
  socket.on('disconnect', () => {
    for (const [userId, sockId] of onlineUsers.entries()) {
      if (sockId === socket.id) {
        onlineUsers.delete(userId);
        break;
      }
    }
    io.emit('online-users-update', Array.from(onlineUsers.keys()));
    console.log(`[Socket.IO] Disconnected: ${socket.id}`);
  });
});

// Serve Frontend static files
const frontendDistPath = path.join(__dirname, '../frontend/dist');
app.use(express.static(frontendDistPath));

app.use((req, res, next) => {
  if (req.url.startsWith('/api')) {
    return next();
  }
  res.sendFile(path.join(frontendDistPath, 'index.html'));
});

// Global 404 Handler for API
app.use((req, res) => {
  res.status(404).json({ success: false, message: `Route not found: ${req.method} ${req.url}` });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('[LawShield Server Error]:', err);
  res.status(500).json({
    success: false,
    message: err.message || 'Internal server error occurred',
  });
});

const PORT = process.env.PORT || 5000;

// Initialize DB and launch server
const startServer = async () => {
  await connectDB();
  await seedMongoIfNeeded();

  server.listen(PORT, () => {
    console.log(`\n======================================================`);
    console.log(`🛡️  LawShield AI Legal & Safety Platform Backend running!`);
    console.log(`🌐  API URL: http://localhost:${PORT}`);
    console.log(`⚡  Socket.IO & WebRTC Signaling active on port ${PORT}`);
    console.log(`======================================================\n`);
  });
};

startServer();
