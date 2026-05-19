import { Server } from 'socket.io';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';

let io;
let Message;

const setupMongoDb = async () => {
  const mongod = await MongoMemoryServer.create();
  const uri = mongod.getUri();
  await mongoose.connect(uri);
  console.log(`Connected to in-memory MongoDB for chat at ${uri}`);

  const messageSchema = new mongoose.Schema({
    senderId: String,
    senderName: String,
    role: String,
    text: String,
    timestamp: { type: Date, default: Date.now }
  });

  Message = mongoose.model('Message', messageSchema);
};

// Start setup
setupMongoDb().catch(err => console.error('MongoDB setup error:', err));

export const initializeSocket = (httpServer) => {
  io = new Server(httpServer, {
    cors: {
      origin: '*', // For development purposes. Restrict this in production.
      methods: ['GET', 'POST']
    }
  });

  io.on('connection', async (socket) => {
    console.log(`Client connected: ${socket.id}`);

    if (Message) {
        try {
            const history = await Message.find().sort({ timestamp: 1 }).limit(100);
            socket.emit('chat_history', history);
        } catch (err) {
            console.error('Failed to load history', err);
        }
    }

    socket.on('chat_message', async (data) => {
        if (!Message) return;
        try {
            const newMsg = new Message({
                senderId: data.senderId,
                senderName: data.senderName,
                role: data.role,
                text: data.text
            });
            await newMsg.save();
            io.emit('chat_message', newMsg);
        } catch (err) {
            console.error('Failed to save message', err);
        }
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
