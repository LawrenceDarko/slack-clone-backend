import express from 'express'
import { createDirectChat, createDirectMessage, getDirectChatMessages, getADirectChatObj, getADirectChatObjUsingRoomId  } from '../controllers/directChatController';

const router = express.Router();

// Create a DirectChat
router.post('/create', createDirectChat)

// Establishes a DirectChat between two users
router.post('/message', createDirectMessage )

// Get a DirectChat Object using roomId
router.get('/room/:directId', getADirectChatObjUsingRoomId )

// Get a DirectChat Object when a direct user is clicked
router.get('/:senderId/:receiverId', getADirectChatObj)

// Fetches all messages belonging to a DirectChat
router.get('/:directId', getDirectChatMessages )






export default router