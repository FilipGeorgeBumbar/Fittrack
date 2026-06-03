import { Server } from 'socket.io';

let io;

// In-memory chat storage (no MongoDB dependency for deployment simplicity)
let chatMessages = [];
const MAX_CHAT_HISTORY = 100;

export const initializeSocket = (httpServer) => {
  io = new Server(httpServer, {
    cors: {
      origin: '*',
      methods: ['GET', 'POST']
    }
  });

  io.on('connection', async (socket) => {
    console.log(`Client connected: ${socket.id}`);

    // Send chat history
    socket.emit('chat_history', chatMessages);

    socket.on('chat_message', (data) => {
      const newMsg = {
        _id: Date.now().toString(),
        senderId: data.senderId,
        senderName: data.senderName,
        role: data.role,
        text: data.text,
        timestamp: new Date()
      };

      chatMessages.push(newMsg);

      // Keep only last N messages
      if (chatMessages.length > MAX_CHAT_HISTORY) {
        chatMessages = chatMessages.slice(-MAX_CHAT_HISTORY);
      }

      io.emit('chat_message', newMsg);
    });

    socket.on('disconnect', () => {
      console.log(`Client disconnected: ${socket.id}`);
    });
  });

  return io;
};

export const emitNewWorkouts = (workouts) => {
  if (io) {
    io.emit('new_workouts', workouts);
  }
};
