const http = require('http');
const { Server } = require('socket.io');
const app = require('./app');
const connectDB = require('./config/db');

// Connect to Database
connectDB();

const server = http.createServer(app);

// Initialize Socket.IO
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
  },
});

app.set('io', io);

io.on('connection', (socket) => {
  console.log(`[Socket.io] Client connected: ${socket.id}`);

  socket.on('join', (data) => {
    if (data?.userId) {
      socket.join(`user_${data.userId}`);
      console.log(`[Socket.io] Socket ${socket.id} joined room: user_${data.userId}`);
    }
    if (data?.role) {
      socket.join(data.role.toLowerCase());
      socket.join('all');
      console.log(`[Socket.io] Socket ${socket.id} joined room: ${data.role.toLowerCase()}`);
    }
  });

  socket.on('disconnect', () => {
    console.log(`[Socket.io] Client disconnected: ${socket.id}`);
  });
});

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`Server & Socket.IO running on port ${PORT}`);
});

process.on('unhandledRejection', (err, promise) => {
  console.error(`Error: ${err.message}`);
  server.close(() => process.exit(1));
});
