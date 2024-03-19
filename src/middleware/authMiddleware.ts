import express, { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';



interface UserData {
    id: string;
    name: string;
    address: string;
}

interface ValidationRequest extends Request {
    userData: UserData
}

const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
    const validationReq = req as ValidationRequest;
    const { authorization } = validationReq.headers;

    if (!authorization) {
        return res.status(401).json({
            message: 'Token diperlukan'
        });
    }

    const token = authorization.split(' ')[1];
    const secret = 'ssssssss';

    try {
        const jwtDecode = jwt.verify(token, secret);
        if (typeof jwtDecode !== 'string') {
            validationReq.userData = jwtDecode as UserData;
        }
    } catch (error) {
        return res.status(401).json({
            message: 'Unauthorized'
        });
    }
    next();
}

module.exports = authMiddleware;
