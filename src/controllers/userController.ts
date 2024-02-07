import { Request, Response } from 'express';
import User from "../models/User";
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs'
import { generateRandomJWTSecret } from '../helpers/generateToken';
import crypto from 'crypto';
import nodemailer from 'nodemailer';
import dotevn from 'dotenv'
import Invitation from '../models/Invitation';
import UserWorkspace from '../models/UserWorkspace';
import Channel from '../models/Channel';
import { generateChannelId } from '../helpers/generateAChannelId';

dotevn.config()


// const jwtSecret = generateRandomJWTSecret(20)
const jwtSecret = process.env.ACCESS_TOKEN_SECRET as string;
const jwtRefreshToken = process.env.REFRESH_TOKEN_SECRET as string

export const generateAccessToken = (userId: any) => {
    return jwt.sign({userId}, jwtSecret, {
        expiresIn: '24h'
    })
}

export const generateRefreshToken = (userId: any) => {
    return jwt.sign({userId}, jwtRefreshToken, {
        expiresIn: '3m'
    })
}

const registerUser = async(req: Request, res: Response) => { 
    const {username, email, password} = req.body

    if(!username || !email || !password){
        return res.status(403).json('Enter all Fields')
    }
    
    const existingEmail = await User.findOne({email: email})

    if (existingEmail){
        return res.status(403).json("User already exist")
    }

    // Hash Password
    const salt = await bcrypt.genSalt(10)
    const hashedPassword = await bcrypt.hash(password, salt)
    
    try {
        const newUser = await User.create({username, email, password: hashedPassword})
        const savedUser = await newUser.save();
        const access_token = generateAccessToken(savedUser._id)
        // const refresh_token = generateRefreshToken(savedUser._id)
        res.status(201).json({
            status: 'success',
            data: {
                id: savedUser._id,
                username: savedUser.username,
                email: savedUser.email,
                accessToken: access_token,
            }
        });
    } catch (error) {
        res.status(400).json(error);
    }
    
}

// Registering users with email tokens
const registerUserWithInvitation = async (req: Request, res: Response) => {
    try {
        const { username, email, password, invitationToken, workspace_id } = req.body;

        // console.log(username, email, password, invitationToken, workspace_id)
        // Validate required fields
        if (!username || !email || !password) {
            return res.status(403).json('Please provide all required fields.');
        }

        // Verify the invitation token
        const invitation = await Invitation.findOne({ token: invitationToken, expires: { $gt: new Date() }, accepted: false });

        if (!invitation) {
            return res.status(403).json('Invalid or expired invitation token.');
        }

        // Check if the user with the given email already exists
        const existingEmail = await User.findOne({ email: email });

        if (existingEmail) {
            return res.status(403).json('User with this email already exists.');
        }

        // Hash Password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Create a new user
        const newUser = await User.create({ username, email, password: hashedPassword });
        const savedUser = await newUser.save();
        // const userId = savedUser._id;

        // Check if the user already exists in the specified workspace
        const existingUser = await UserWorkspace.findOne({ user: savedUser._id, workspace: workspace_id });

        if (existingUser) {
            return res.status(403).json('User already exists in the specified workspace.');
        }

        // Add the user to the workspace
        // await UserWorkspace.create({ user: savedUser._id, workspace: workspace_id });

        // Mark the invitation as accepted
        // invitation.accepted = true;
        // await invitation.save();

        // Generate access token
        const access_token = generateAccessToken(savedUser._id);

        // Respond with user details and access token
        res.status(201).json({
            status: 'success',
            data: {
                id: savedUser._id,
                username: savedUser.username,
                email: savedUser.email,
                accessToken: access_token,
            }
        });
    } catch (error) {
        res.status(500).json('Internal Server Error');
    }
};

const loginUser = async (req: Request, res: Response) => {
    const { email, password } = req.body;

    // Check if all the fields are not empty
    if (!email || !password) {
        return res.status(403).json("Enter all fields");
    }

    try {
        // Find one user witht the unique email 
        const user = await User.findOne({ email: email });

        // Return Invalid credential if user doesn't exist
        if (!user) {
            return res.status(401).json("Invalid credentials");
        }

        // If user exists decrypt their password and if the entered password is equal to the decrypted one
        if (user && user.password && (await bcrypt.compare(password, user.password))) {
            const access_token = generateAccessToken(user._id)
            // const refresh_token = generateRefreshToken(user._id)

            // console.log(refresh_token)
            res.cookie("token", access_token, {
                httpOnly: true,
                maxAge: 24 * 60 * 60 * 1000,
                secure: process.env.NODE_ENVIRONMENT === 'production',
                sameSite: 'none',
                domain: 'https://slack-clone-frontend-bice.vercel.app',
            })

            return res.status(200).json({
                status: 'success',
                data: {
                    id: user._id,
                    username: user.username,
                    email: user.email,
                    accessToken: access_token,
                    // refreshToken: refresh_token
                }
            });
        } else {
            return res.status(401).json("Invalid credentials");
        }
    } catch (error) {
        console.error("Error in loginUser:", error);
        return res.status(500).json("Internal Server Error");
    }
};

const loginUserWithInvitation = async (req: Request, res: Response) => {
    try {
        const { email, password, invitationToken, workspace_id } = req.body;

        // Validate required fields
        if (!email || !password) {
            return res.status(400).json('Please provide both email and password.');
        }

        // Find user with the given email
        const user = await User.findOne({ email: email });

        // Return unauthorized if user doesn't exist
        if (!user) {
            return res.status(401).json('Invalid credentials');
        }

        // Verify the invitation token
        const invitation = await Invitation.findOne({ token: invitationToken, expires: { $gt: new Date() }, accepted: false });

        if (!invitation) {
            return res.status(403).json('Invalid or expired invitation token.');
        } else {
            // Mark the invitation as accepted
            console.log("INVITATION", invitation)
            invitation.accepted = true;
            await invitation.save();
        }

        // Fetch all public channels in the specified workspace
        const publicChannels = await Channel.find({ workspace_id, access_type: 'public' });

        // Iterate through public channels and add the user to them if not already a member
        for (const publicChannel of publicChannels) {
            const { members } = publicChannel;

            if (!members.includes(user._id)) {
                // Add the user to the channel members
                members.push(user._id);

                // Update the channel with the new members
                await Channel.findByIdAndUpdate(publicChannel._id, { members });
            }
        }



        // Check if the entered password matches the stored hashed password
        if (user.password && (await bcrypt.compare(password, user.password))) {
            const access_token = generateAccessToken(user._id);

            // Check if the user already exists in the specified workspace
            const existingUser = await UserWorkspace.findOne({ user: user._id, workspace: workspace_id });

            if (existingUser) {
                return res.status(403).json('User already exists in the specified workspace.');
            }

            // Add the user to the workspace
            await UserWorkspace.create({ user: user._id, workspace: workspace_id });

            // Set token as a cookie with HttpOnly flag and limited max age
            res.cookie('token', access_token, {
                httpOnly: true,
                maxAge: 24 * 60 * 60 * 1000,
                secure: process.env.NODE_ENVIRONMENT === 'production',
                sameSite: 'none'
            });

            // Respond with user details and access token
            return res.status(200).json({
                status: 'success',
                data: {
                    id: user._id,
                    username: user.username,
                    email: user.email,
                    accessToken: access_token,
                },
            });
        } else {
            // Incorrect password
            return res.status(401).json('Invalid credentials');
        }
    } catch (error) {
        console.error('Error in loginUser:', error);
        return res.status(500).json('Internal Server Error');
    }
};


const getAllUsers = async(req: Request, res: Response) => { 
    // const id = req.user.userId
    const allUsers = await User.find({})
    try {
        res.status(200).json(allUsers)
    } catch (error) {
        res.status(400).json(error)
    }
}

// A controller to get a single user
const getAUser = async(req: Request, res: Response) => {
    const { userId } = req.params
    const user = await User.findById(userId)

    try {
        res.status(200).json({status: "success", data: user})
    } catch (error) {
        res.status(400).json(error)
    }
}

// Send Invitation
const sendEmailInvitation = async(req: Request, res: Response) => {
    try {
        const { email, workspace_id } = req.body;
    
        // Generate unique token
        const token = crypto.randomBytes(16).toString('hex');
    
        // Save invitation to the database
        const expirationTime = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours
        const invitation = new Invitation({ email, token, expires: expirationTime, accepted: false });
        await invitation.save();
    
        // Send invitation email
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: `${process.env.GMAILADDRESS}`,
                pass: `${process.env.GMAILPASS}`,
            },
        });
    
        await transporter.sendMail({
            to: email,
            subject: 'Invitation to Join Our Workspace',
            text: `Click the following link to join: ${process.env.FRONTEND_URL}/invite/${workspace_id}/${token}`,
        });
    
        res.status(200).json({ status: 'success', message: 'Invitation sent successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
}

const logoutUser = async(req: Request, res: Response) => {
    res.clearCookie('token')
    res.status(200).json({status: "success", message: "Logged out successfully"})
}

export {
        registerUser, 
        registerUserWithInvitation, 
        getAllUsers, 
        loginUser, 
        getAUser, 
        sendEmailInvitation,
        loginUserWithInvitation,
        logoutUser
    }