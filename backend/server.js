const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const symptomRoutes = require("./routes/symptomRoutes");
require('dotenv').config();

connectDB();

const app = express();

app.use(cors({
  origin: "*",
  credentials: true
}));

app.use(express.json());

// Health check
app.get('/api/health', (req, res) => {
  res.json({ success: true, message: 'API is running' });
});

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/appointments', require('./routes/appointments'));
app.use('/api/users', require('./routes/users'));
app.use('/api/prescriptions', require('./routes/prescriptions'));
app.use('/api/messages', require('./routes/messages'));
app.use("/", symptomRoutes);

// Error handler
const errorHandler = (err, req, res, next) => {
  const statusCode = res.statusCode !== 200 ? res.statusCode : 500;
  res.status(statusCode).json({
    success: false,
    message: err.message || 'Server Error',
  });
};

app.use(errorHandler);

// Socket setup
const http = require('http');
const server = http.createServer(app);

const { Server } = require('socket.io');
const { setupSocket } = require('./socket');

const io = new Server(server, {
  cors: {
    origin: process.env.CORS_ORIGIN || '*',
    methods: ['GET', 'POST']
  },
});

setupSocket(io);

// Make socket accessible in controllers
app.set('io', io);

// Start server
const PORT = process.env.PORT || 5000;

server.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
});

module.exports = { app, server };