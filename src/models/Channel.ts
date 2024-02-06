import mongoose from 'mongoose';

const ChannelSchema = new mongoose.Schema({
    name: { type: String},
    members: { type: Array },
    workspace_id: { type: String },
    created_by: { type: String },
    space_id: { type: String },
    access_type: {
        type: String,
        enum: ['public', 'private', 'restricted'], // Define the allowed enum values here
        default: 'public', // Set a default value if needed
    },
}, {timestamps: true});

const Channel = mongoose.model('Channel', ChannelSchema);

export default Channel;
