import { Request, Response } from 'express';
import Channel from '../models/Channel';
import ChannelMessage from '../models/ChannelMessage';
import UserWorkspace from '../models/UserWorkspace';
import { generateChannelId } from '../helpers/generateAChannelId';
import User from '../models/User';

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
        } else if (access_type === 'private') {
            // If access type is private, add only the creator to the members array
            members = [created_by];
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

const addUsersToPrivateChannel = async (req: Request, res: Response) => {
    try {
        const { space_id, userEmails } = req.body;

        // Find the channel by ID
        const channel = await Channel.findOne({space_id});

        if (!channel) {
            return res.status(404).json({ error: 'Channel not found' });
        }

        // Check if the channel is private
        if (channel.access_type !== 'private') {
            return res.status(400).json({ error: 'Cannot add users to a non-private channel' });
        }

        const newMembers = [];

        // Loop through each email in the array
        for (const userEmail of userEmails) {
            // Find the user by email
            const user = await User.findOne({ email: userEmail });

            if (!user) {
                console.warn(`User with email ${userEmail} not found`);
            } else {
                // Check if the user is already a member of the channel
                if (!channel.members.includes(user._id)) {
                    // Add the user to the list of new members
                    newMembers.push(user._id);
                } else {
                    console.warn(`User with email ${userEmail} is already a member of the channel`);
                }
            }
        }

        // Add the new members to the channel's existing members
        channel.members = channel.members.concat(newMembers);

        // Update the channel with the new members
        const updatedChannel = await Channel.findOneAndUpdate({ space_id: space_id }, { members: channel.members }, { new: true });
        // await Channel.

        res.status(200).json({
            status: 'success',
            data: { updatedChannel },
            message: 'User(s) added to private channel successfully',
        });
    } catch (error) {
        console.error('Error in addUsersToPrivateChannel:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};



export { 
        createChannel, 
        getWorkspaceChannels, 
        createChannelMessage, 
        getChannelMessages,
        getASingleChannelById,
        addUsersToPrivateChannel
    }