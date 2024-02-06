import { Request, Response } from 'express';
import Channel from '../models/Channel';
import ChannelMessage from '../models/ChannelMessage';
import UserWorkspace from '../models/UserWorkspace';
import { generateChannelId } from '../helpers/generateAChannelId';

const createChannel = async (req: Request, res: Response) => {
    try {
        // Destructure the request body
        const { name, workspace_id, created_by, access_type } = req.body;
        const space_id = await generateChannelId()

        // Check if the access type is public. If it is public, then set members as the users in the workspace
        let members: string[] = [];
        if (access_type === 'public') {
            // Fetch the members from the workspace
            const workspaceMembers = await UserWorkspace.find({ workspace: workspace_id }).populate('user', 'id');
            members = workspaceMembers.map((userWorkspace: any) => userWorkspace?.user?.id);
            // console.log("GROUP MEMBERS", members)
        }
        // Create a new channel
        const newChannel = new Channel({
            name,
            workspace_id,
            members,
            created_by,
            access_type,
            space_id,
        });

        // Save the channel
        const savedChannel = await newChannel.save();
        res.status(200).json(savedChannel);
    } catch (error) {
        console.error(error);
        res.status(400).json({ error: 'Failed to create channel' });
    }
};


const getWorkspaceChannels = async(req: Request, res: Response) => { 
    const {id} = req.params || '';
    const allWorkspaceChannels = await Channel.find({workspace_id: id})
    try {
        res.status(200).json({status: 'success', data: allWorkspaceChannels})
    } catch (error) {
        res.status(400).json(error)
    }
}

const getASingleChannelById = async(req: Request, res: Response) => {
    const {channelId} = req.params
    // console.log("CHANNEL BY ID")
    const singleChannel = await Channel.findOne({space_id: channelId})

    try {
        res.status(200).json({status: 'success', data: singleChannel})
    } catch (error) {
        res.status(400).json(error)
    }
}

const createChannelMessage = async(req: Request, res: Response) => { 
    const { sender_id, direct_chat_id, message_body, username } = req.body;
    const newChannelMessage = new ChannelMessage({sender_id, direct_chat_id, message_body, username})

    try {
        const savedChannelMessage = await newChannelMessage.save();
        res.status(200).json(savedChannelMessage);
    } catch (error) {
        res.status(400).json(error);
    }
    
}

const getChannelMessages = async(req: Request, res: Response) => { 
    const { channelId } = req.params
    const allChannelMessage = await ChannelMessage.find({direct_chat_id: channelId})

    try {
        res.status(200).json(allChannelMessage);
    } catch (error) {
        res.status(400).json(error);
    }
    
}



export { 
        createChannel, 
        getWorkspaceChannels, 
        createChannelMessage, 
        getChannelMessages,
        getASingleChannelById
    }