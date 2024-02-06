import mongoose from 'mongoose';

const DirectChatSchema = new mongoose.Schema({
    members: { type: Array},
    workspace_id: { type: String },
    space_id: { type: String },
}, {timestamps: true});

const DirectChat = mongoose.model('DirectChat', DirectChatSchema);

export default DirectChat;
