import { Request, Response } from 'express';
import Workspace from '../models/WorkSpace';
import UserWorkspace from '../models/UserWorkspace';
import Channel from '../models/Channel';
import { generateChannelId } from '../helpers/generateAChannelId';

const createWorkspace = async(req: Request, res: Response) => {

    const { name, description, created_by } = req.body
    const space_id = await generateChannelId()

    const newWorkspace = new Workspace({name, description, created_by})
    try {
        const savedWorkspace = await newWorkspace.save()

        await UserWorkspace.create({user: created_by, workspace: savedWorkspace._id})

        // Create the 'genera' channel in the workspace
        const generalChannel = new Channel({
            name: 'general',
            workspace_id: savedWorkspace._id,
            members: [created_by], // Add the creator as the first member
            created_by,
            space_id,
            access_type: 'public',
        });

        const savedGeneraChannel = await generalChannel.save();
        
        res.status(200).json({status: 'success', data: savedWorkspace, message: 'Workpace created Successfully'})
    } catch (error) {
        res.status(400).json(error)
    }
}

const createUserWorkspace = async(req: Request, res: Response) => {
    const { user, workspace } = req.body
    const existingUser = await UserWorkspace.findOne({user, workspace})

    if(existingUser){
        return res.status(403).json("User already exist")
    }

    const newUserWorkspace = await UserWorkspace.create({user, workspace})
    try {
        const savedUserWorkspace = await newUserWorkspace.save()
        res.status(200).json({status: 'success', data: savedUserWorkspace, message: 'Workspace created Successfully'})
    } catch (error) {
        res.status(400).json(error)
    }
}

const fetchAllWorkspaceForAUser = async(req: Request, res: Response) => {
    const {userId} = req.params;
    const allUserWorkspace = await UserWorkspace.find({user: userId}).populate('workspace').exec()
    try {
        res.status(200).json(allUserWorkspace)
    } catch (error) {
        res.status(400).json(error)
    }
}

const fetchAllUsersForAWorkspace = async(req: Request, res: Response) => {
    const {workspaceId} = req.params;
    
    const allWorkspaceUsers = await UserWorkspace.find({workspace: workspaceId}).populate('user').exec()
    try {
        res.status(200).json(allWorkspaceUsers)
    } catch (error) {
        res.status(400).json(error)
    }
}

// Write a controller to find one workspace with an id
const findOneWorkspaceById = async(req: Request, res: Response) => {
    const {workspaceId} = req.params;
    const workspace = await Workspace.findById(workspaceId)
    try {
        res.status(200).json({status: 'success', data: workspace})
    } catch (error) {
        res.status(400).json(error)
    }
}

export {createWorkspace, findOneWorkspaceById, createUserWorkspace, fetchAllWorkspaceForAUser, fetchAllUsersForAWorkspace}