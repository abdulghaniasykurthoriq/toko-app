import { PrismaClient } from '@prisma/client';
import express, { NextFunction, Request, Response } from 'express';



const prisma = new PrismaClient();

const userController = {
    getUsers: async (req: Request, res: Response) => {
        const result = await prisma.users.findMany({
            select: {
                id: true,
                name: true,
                email: true,
                address: true
            }
        });
    
        res.json({
            message: 'Users List',
            data: result
        });
        // Implement logic to get all users
    },
    createUser: async () => {
        // Implement logic to create a new user
    },
    updateUser: async () => {
        // Implement logic to update a user
    },
    deleteUser: async () => {
        // Implement logic to delete a user
    }
};

module.exports = userController;
