import mongoose from 'mongoose';

const userWorkspaceSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User',},
    workspace: { type: mongoose.Schema.Types.ObjectId, ref: 'Workspace',},
},{timestamps: true})

const UserWorkspace = mongoose.model('UserWorkspace', userWorkspaceSchema)

export default UserWorkspace;