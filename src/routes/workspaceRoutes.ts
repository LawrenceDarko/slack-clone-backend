import express from 'express';
import { createWorkspace,  createUserWorkspace, fetchAllWorkspaceForAUser, fetchAllUsersForAWorkspace, findOneWorkspaceById} from '../controllers/workspaceController';

const router = express.Router()

// This creates a workspace
router.post('/create', createWorkspace)

// This creates the junction table between the user and the table
router.post('/user-workspace', createUserWorkspace)

// Get a single workspace by id
router.get('/:workspaceId', findOneWorkspaceById)

// This fetches all workspaces belonging to a user
router.get('/all-user-workspaces/:userId', fetchAllWorkspaceForAUser)

// This fetches all users belonging to a workspace
router.get('/all-workspace-users/:workspaceId', fetchAllUsersForAWorkspace)

export default router