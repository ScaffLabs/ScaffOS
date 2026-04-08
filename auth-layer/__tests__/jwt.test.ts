import { generateToken, verifyToken, decodeToken } from '../jwt';
import jwt from 'jsonwebtoken';

const userId = 'user123';
const secret = process.env.JWT_SECRET || 'default_secret';

describe('JWT Functions', () => {
    it('should generate a valid token', () => {
        const token = generateToken(userId);
        expect(token).toBeDefined();
        expect(jwt.verify(token, secret)).toBeTruthy();
    });

    it('should verify a valid token', () => {
        const token = generateToken(userId);
        const decoded = verifyToken(token);
        expect(decoded.userId).toBe(userId);
    });

    it('should throw an error for an invalid token', () => {
        expect(() => verifyToken('invalid_token')).toThrow('Invalid token');
    });

    it('should decode a token', () => {
        const token = generateToken(userId);
        const decoded = decodeToken(token);
        expect(decoded).toHaveProperty('userId', userId);
    });

    it('should handle empty token on verification', () => {
        expect(() => verifyToken('')).toThrow('Invalid token');
    });

    it('should handle expired token', () => {
        jest.spyOn(Date, 'now').mockImplementationOnce(() => 0);
        const token = jwt.sign({ userId }, secret, { expiresIn: -1 }); // Expired token
        expect(() => verifyToken(token)).toThrow('Invalid token');
        jest.restoreAllMocks();
    });
});
