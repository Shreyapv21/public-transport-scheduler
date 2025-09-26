const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const http = require('http');
const socketIo = require('socket.io');
require('dotenv').config();

const authRoutes = require('./routes/auth');
const routeRoutes = require('./routes/routes');
const journeyRoutes = require('./routes/journeys');
const chatbotRoutes = require('./routes/chatbot');
const { processChatbotMessage } = require('./controllers/chatbotController');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"]
  }
});

// Middleware
app.use(cors());
app.use(express.json());

// Database connection
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/routes', routeRoutes);
app.use('/api/journeys', journeyRoutes);
app.use('/api/chatbot', chatbotRoutes);

// Socket.io for real-time chatbot
io.on('connection', (socket) => {
  console.log('User connected to chatbot');
  
  socket.on('message', async (data) => {
    try {
      const response = await processChatbotMessage(data.message);
      socket.emit('response', response);
    } catch (error) {
      socket.emit('response', {
        message: "Sorry, I'm having trouble processing that. Please try again.",
        suggestions: ["Find routes", "Check schedules", "Help"]
      });
    }
  });
  
  socket.on('disconnect', () => {
    console.log('User disconnected from chatbot');
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});