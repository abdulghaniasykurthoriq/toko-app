import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import * as dotenv from 'dotenv';
import {google} from 'googleapis';

const prisma = new PrismaClient();

const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    'http://localhost:5000/auth/google/callback'
);

const scopes = [
    'https://www.googleapis.com/auth/userinfo.email',
    'https://www.googleapis.com/auth/userinfo.profile'
]

const authorizationUrl = oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: scopes,
    include_granted_scopes: true,
})

const authController = {
    register: async (req: Request, res: Response) => {
        const { name,email, password } = req.body;

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        try {
            // Create user in database
            const result = await prisma.users.create({
                data: {
                    name,
                    email,
                    password: hashedPassword,
                }
            });

            res.json({
                message: 'user created'
            });
        } catch (error) {
            res.status(500).json({
                message: 'Failed to register user'
            });
        }
    },

    login: async (req: Request, res: Response) => {
            const { email, password } = req.body;

    const user = await prisma.users.findUnique({
        where: {
            email: email
        }
    });

    if (!user) {
        return res.status(404).json({
            message: 'User not found'
        });
    }

    if (!user.password) {
        return res.status(404).json({
            message: 'Password not set'
        });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (isPasswordValid) {
        const payload = {
            id: user.id,
            name: user.name,
            address: user.address
        };

        const secret = 'sdsdsdsdsa';

        const expiresIn = 60 * 60 * 1;

        const token = jwt.sign(payload, secret, { expiresIn: expiresIn });

        return res.json({
            data: {
                id: user.id,
                name: user.name,
                address: user.address
            },
            token: token
        });
    } else {
        return res.status(403).json({
            message: 'Wrong password'
        });
    }
    },

    loginWithGoogle: async (req: Request, res:Response) => {
        res.redirect(authorizationUrl);
 
    },
    googleCallback: async(req:Request, res:Response) => {
        const {code} = req.query

    const {tokens} = await oauth2Client.getToken(code as string);

    oauth2Client.setCredentials(tokens);

    const oauth2 = google.oauth2({
        auth: oauth2Client,
        version: 'v2'
    })

    const {data} = await oauth2.userinfo.get();

    if(!data.email || !data.name){
        return res.json({
            data: data,
        })
    }

    let user = await prisma.users.findUnique({
        where: {
            email: data.email
        }
    })

    if(!user){
        user = await prisma.users.create({
            data: {
                name: data.name,
                email: data.email,
                address: "-"
            }
        })
    }

    const payload = {
        id: user?.id,
        name: user?.name,
        address: user?.address
    }

    const secret = 'ssssssss';

    const expiresIn = 60 * 60 * 1;

    const token = jwt.sign(payload, secret, {expiresIn: expiresIn})

    // return res.redirect(`http://localhost:3000/auth-success?token=${token}`)

    return res.json({
        data: {
            id: user.id,
            name: user.name,
            address: user.address
        },
        token: token
    })
    }
    
};

export default authController;
