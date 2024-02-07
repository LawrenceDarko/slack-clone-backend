// socketHandler.ts
import { Server, Socket } from 'socket.io';

const users: { userId: string; socketId: string; online: boolean }[] = [];

const addUsers = (userId: string, socketId: string) => {
    const existingUser = users.find((user) => user.userId === userId);

    if (!existingUser) {
        users.push({ userId, socketId, online: true });
    } else {
        existingUser.online = true;
        existingUser.socketId = socketId;
    }
};

const handleSocket = (io: Server) => {
    io.on('connection', (socket: Socket) => {
        // console.log('a user connected');

        socket.on("addUser", (userId) => {
            addUsers(userId, socket.id);
            socket.emit("getUser", users);
        });

        socket.on("joinRoom", (roomId) => {
            socket.join(roomId);
        });

        socket.on("sendMessage", (data) => {
            // Save the message to the database if needed
            io.to(data.direct_chat_id).emit("receiveMessage", data);
        });

        socket.on('disconnect', () => {
            const disconnectedUserIndex = users.findIndex((user) => user.socketId === socket.id);

            if (disconnectedUserIndex !== -1) {
                const disconnectedUser = users.splice(disconnectedUserIndex, 1)[0];
                io.emit('getUser', users);
            }
        });
    });
};

export default handleSocket;






// let users: { userId: string; socketId: string; online: boolean }[] = [];

// const addUsers = (userId: string, socketId: string) => {
//     const existingUser = users.find((user) => user.userId === userId);

//     if (!existingUser) {
//         users.push({ userId, socketId, online: true });
//     } else {
//         existingUser.online = true;
//         existingUser.socketId = socketId;
//     }
// };



// io.on('connection', (socket) => {
//     // console.log('a user connected');

//     socket.on("addUser", (userId) => {
//         // console.log(userId, socket.id );
//         addUsers(userId, socket.id);
//         // console.log("CONNECTED USER",{userId, socketId: socket.id})
//         socket.emit("getUser", users);
//     });

//     socket.on("joinRoom", (roomId) => {
//         socket.join(roomId);
//     });

//     socket.on("sendMessage", (data) => {
//         // Save the message to the database if needed

//         // Broadcast the message to all users in the same room or channel
//         io.to(data.direct_chat_id).emit("receiveMessage", data);
//     });

//     socket.on('disconnect', () => {
//         // Handle user disconnection and update the users array
//         const disconnectedUserIndex = users.findIndex((user) => user.socketId === socket.id);
        
//         if (disconnectedUserIndex !== -1) {
//           // Mark the user as offline
//             const disconnectedUser = users.splice(disconnectedUserIndex, 1)[0];
    
//             // console.log("DISCONNECTED USER", disconnectedUser)
            
//           // Broadcast the updated user list to all clients
//             io.emit('getUser', users);
//         }
//     });
// });
