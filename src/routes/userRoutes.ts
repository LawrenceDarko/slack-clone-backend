import express from 'express'
import { getAllUsers, registerUser, loginUser, getAUser, loginUserWithInvitation, registerUserWithInvitation, sendEmailInvitation, logoutUser } from '../controllers/userController';

const router = express.Router();

// Create a user
router.get('/', getAllUsers)
router.get('/:userId', getAUser)
router.post('/register', registerUser)
router.post('/register-with-invitation', registerUserWithInvitation); 
router.post('/login', loginUser)
router.post('/logout', logoutUser)
router.post('/login-with-invitation', loginUserWithInvitation);
router.post('/send-invitation', sendEmailInvitation);


export default router