import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
// import { generateRefreshToken } from './userController';
import dotevn from 'dotenv'
dotevn.config()



const jwtRefreshTokenSecret = process.env.REFRESH_TOKEN_SECRET as string
const jwtAccessTokenSecret = process.env.ACCESS_TOKEN_SECRET as string
interface JwtPayload {
    userId: string;
}

export const generateAccessToken = (userId: any) => {
    return jwt.sign({userId}, jwtAccessTokenSecret, {
        expiresIn: '1h'
    })
}

const refreshAToken = async(req: Request, res: Response) => {
    // res.status(200).json('token refreshed')
    const refreshToken = req.cookies['token'];
    if (!refreshToken) {
        return res.status(401).send('Access Denied. No refresh token provided.');
    }

    try {
        const decoded = jwt.verify(refreshToken, jwtRefreshTokenSecret) as JwtPayload;
        const accessToken = generateAccessToken(decoded.userId)

        req.headers.authorization = `Bearer ${accessToken}`
        res.status(200).json({
            userId: decoded.userId,
            newAccessToken: accessToken
        });
    } catch (error) {
        return res.status(400).send('Invalid refresh token.');
    }
}

export default refreshAToken