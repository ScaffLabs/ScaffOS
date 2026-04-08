import jwt from 'jsonwebtoken';
import { User } from './user'; // Assuming a user model is defined

const SECRET_KEY = process.env.JWT_SECRET || 'default_secret';
const EXPIRATION_TIME = '1h';

export const generateToken = (userId: string) => {
    return jwt.sign({ userId }, SECRET_KEY, { expiresIn: EXPIRATION_TIME });
};

export const verifyToken = (token: string): User => {
    try {
        return jwt.verify(token, SECRET_KEY) as User;
    } catch (error) {
        throw new Error('Invalid token');
    }
};

export const decodeToken = (token: string) => {
    return jwt.decode(token);
};
