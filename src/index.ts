import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
const mongoose = require('mongoose');

import userRoutes from './routes/userRoutes';
import workspaceRoutes from './routes/workspaceRoutes';
import channelRoutes from './routes/channelRoutes';
import directChatRoutes from './routes/directChatRoutes';
import tokenRoutes from './routes/tokenRoutes';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import protect from './middleware/authMiddleware';
import dotenv from 'dotenv';
import socketHandler from './socketIO/socketHandler';
dotenv.config();

const app = express();
const server = http.createServer(app);



app.use(cors({
    origin: ['http://localhost:3000', 'https://slack-clone-frontend.onrender.com'],
    credentials: true,
}));

app.use(express.json());
app.use(cookieParser(process.env.JWT_SECRET));


app.use('/api/users', userRoutes);
app.use('/api/workspace', protect, workspaceRoutes);
app.use('/api/channels', protect, channelRoutes);
app.use('/api/direct-chat', protect, directChatRoutes);

mongoose.connect(process.env.MONGO_URI).then(() => {
    server.listen(process.env.PORT, () => {
        console.log('Connected to DB');
        console.log('Server running on port', process.env.PORT);
    });
}).catch((error: any) => {
    console.log('db connect error:', error.message);
});


// Socket Implementation
const io = new Server(server, {
    cors: {
        origin: ['http://localhost:3000', 'https://slack-clone-frontend.onrender.com'],
        // methods: ['GET', 'POST'],
        credentials: true,
    },
});

socketHandler(io); 


