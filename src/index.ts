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
dotenv.config();

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
    cors: {
        origin: ['http://localhost:3000', 'https://slack-clone-frontend-bice.vercel.app/'],
        // methods: ['GET', 'POST'],
        credentials: true,
    },
});

app.use(cors({
    origin: ['http://localhost:3000', 'https://slack-clone-frontend-bice.vercel.app/'],
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
let users: { userId: string; socketId: string; online: boolean }[] = [];

const addUsers = (userId: string, socketId: string) => {
    const existingUser = users.find((user) => user.userId === userId);

    if (!existingUser) {
        users.push({ userId, socketId, online: true });
    } else {
        existingUser.online = true;
        existingUser.socketId = socketId;
    }
};



io.on('connection', (socket) => {
    // console.log('a user connected');

    socket.on("addUser", (userId) => {
        // console.log(userId, socket.id );
        addUsers(userId, socket.id);
        // console.log("CONNECTED USER",{userId, socketId: socket.id})
        socket.emit("getUser", users);
    });

    socket.on("joinRoom", (roomId) => {
        socket.join(roomId);
    });

    socket.on("sendMessage", (data) => {
        // Save the message to the database if needed

        // Broadcast the message to all users in the same room or channel
        io.to(data.direct_chat_id).emit("receiveMessage", data);
    });

    socket.on('disconnect', () => {
        // Handle user disconnection and update the users array
        const disconnectedUserIndex = users.findIndex((user) => user.socketId === socket.id);
        
        if (disconnectedUserIndex !== -1) {
          // Mark the user as offline
            const disconnectedUser = users.splice(disconnectedUserIndex, 1)[0];
    
            // console.log("DISCONNECTED USER", disconnectedUser)
            
          // Broadcast the updated user list to all clients
            io.emit('getUser', users);
        }
    });
});






























// import express from 'express';
// // import mongoose from 'mongoose'
// const mongoose = require('mongoose');

// // routes
// import userRoutes from './routes/userRoutes';
// import workspaceRoutes from './routes/workspaceRoutes';
// import channelRoutes from './routes/channelRoutes';
// import directChatRoutes from './routes/directChatRoutes';
// import tokenRoutes from './routes/tokenRoutes';
// import cors from 'cors'
// import cookieParser from 'cookie-parser';
// // import { protect } from './middleware/authMiddleware';
// import protect from './middleware/authMiddleware';
// import dotenv from 'dotenv';
// dotenv.config(); 



// const app = express()


// app.use(cors({
//     origin:'http://localhost:3000', 
//     credentials:true,        
// }));

// // middlewares
// app.use(express.json());
// app.use(cookieParser(process.env.JWT_SECRET));

// app.use('/api/users', userRoutes)
// app.use('/api/workspace', protect, workspaceRoutes)
// app.use('/api/channels', protect, channelRoutes)
// app.use('/api/direct-chat', protect, directChatRoutes)
// // app.use('/refresh', tokenRoutes)

// // connect to db
// mongoose.connect(process.env.MONGO_URI).then(()=>{
//     app.listen(process.env.PORT, ()=>{
//         console.log("Connected to DB")
//         console.log("Server running on port", process.env.PORT)
//     })    
// })
// .catch((error: any)=>{
//     console.log('db connect error:',error.message)
// })


