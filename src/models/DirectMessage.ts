import mongoose from 'mongoose';

const DirectMessageSchema = new mongoose.Schema({
    sender_id: { type: String},
    direct_chat_id: { type: String },
    message_body: { type: String },
    username: {type: String}
}, {timestamps: true});

const DirectMessage = mongoose.model('DirectMessage', DirectMessageSchema);

export default DirectMessage;
