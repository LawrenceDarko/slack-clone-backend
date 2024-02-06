import mongoose from 'mongoose';

const ChannelMessageSchema = new mongoose.Schema({
    sender_id: { type: String},
    direct_chat_id: { type: String },
    message_body: { type: String },
    username: {type: String}
}, {timestamps: true});

const ChannelMessage = mongoose.model('ChannelMessage', ChannelMessageSchema);

export default ChannelMessage;
