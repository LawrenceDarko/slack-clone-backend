import express from 'express'
import { createChannel, getWorkspaceChannels, createChannelMessage, getChannelMessages, getASingleChannelById, addUsersToPrivateChannel } from '../controllers/channelController';

const router = express.Router();

// Create a Channel
router.post('/create', createChannel)

// Fetch a Single Channel by ID
router.get('/:channelId', getASingleChannelById);

// Fetch Workspace Channels
router.get('/workspace-channels/:id', getWorkspaceChannels)

// Add users to a Private Channel
router.post('/add-private-channel-users', addUsersToPrivateChannel)

// Create Channel Message
router.post('/message', createChannelMessage )

// Fetches all messages belonging to a Channel
router.get('/messages/:channelId', getChannelMessages )


export default router