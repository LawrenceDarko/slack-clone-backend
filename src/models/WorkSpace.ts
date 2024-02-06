import mongoose from 'mongoose';

const workspaceSchema = new mongoose.Schema({
    name: { type: String, required: true },
    description: { type: String, required: true },
    created_by: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'User' },
},{timestamps: true});

const Workspace = mongoose.model('Workspace', workspaceSchema);

export default Workspace;
