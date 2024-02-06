import mongoose, { Document } from 'mongoose';

interface Invitation extends Document {
    email: string;
    token: string;
    expires: Date;
    accepted: boolean;
}

const invitationSchema = new mongoose.Schema({
    email: String,
    token: String,
    expires: Date,
    accepted: Boolean,
});

const InvitationModel = mongoose.model<Invitation>('Invitation', invitationSchema);

export default InvitationModel;