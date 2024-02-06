import { Request, Response } from 'express';
import DirectChat from '../models/DirectChat';
import DirectMessage from '../models/DirectMessage';
import { generateDirectChatId } from '../helpers/generateADirectChatId';

// Creates a direct chat between two users. It takes members[senderId, receiverId] and workspace_id
const createDirectChat = async(req: Request, res: Response) => {
    
    const {members, workspace_id} = req.body;

    const space_id = await generateDirectChatId()

    const existingDirectChat = await DirectChat.findOne(req.body)

    if(existingDirectChat){
        return res.status(401).json("Can't create")
    }

    const newDirectChat = new DirectChat({members, workspace_id, space_id})

    try {
        const savedDirectChat = await newDirectChat.save();
        res.status(200).json(savedDirectChat);
    } catch (error) {
        res.status(400).json(error);
    }
    
}

// This returns the chat with both the senderId and receiverId in the members array
const getADirectChatObj = async(req: Request, res: Response) => {
    const {senderId, receiverId} = req.params
    const directChatObj = await DirectChat.findOne({
        members: {$all: [senderId, receiverId]}
    })

    try {
        res.status(200).json(directChatObj)
    } catch (error) {
        res.status(400).json(error)
    }
}

// Get direct chat object using the direct_chat_id
const getADirectChatObjUsingRoomId = async(req: Request, res: Response) => {
    const {directId} = req.params
    // console.log(directId)
    const directChatObj = await DirectChat.findOne({space_id: directId})

    try {
        res.status(200).json({status: 'success', data: directChatObj})
    } catch (error) {
        res.status(400).json(error)
    }
}

// Creates a direct chat message between 2 users. it takes senderId, direct_chat_id and message body
const createDirectMessage = async(req: Request, res: Response) => { 
    const { sender_id, direct_chat_id, message_body, username } = req.body;
    const newDirectMessage = new DirectMessage({sender_id, direct_chat_id, message_body, username})

    try {
        const savedDirectMessage = await newDirectMessage.save();
        res.status(200).json(savedDirectMessage);
    } catch (error) {
        res.status(400).json(error);
    }
    
}

const getDirectChatMessages = async(req: Request, res: Response) => { 
    const { directId } = req.params
    const allDirectMessage = await DirectMessage.find({direct_chat_id: directId})

    try {
        res.status(200).json(allDirectMessage);
    } catch (error) {
        res.status(400).json(error);
    }
    
}



export {createDirectChat, 
        createDirectMessage, 
        getDirectChatMessages, 
        getADirectChatObj,
        getADirectChatObjUsingRoomId
    }