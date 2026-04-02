import jwt from 'jsonwebtoken';

const SECRET_KEY = process.env.JWT_SECRET || 'default_secret';
const EXPIRATION_TIME = '1h';

export const generateToken = (userId: string) => {
    return jwt.sign({ userId }, SECRET_KEY, { expiresIn: EXPIRATION_TIME });
};

export const verifyToken = (token: string) => {
    return jwt.verify(token, SECRET_KEY);
};

export const decodeToken = (token: string) => {
    return jwt.decode(token);
};