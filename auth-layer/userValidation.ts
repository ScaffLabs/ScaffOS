import { z } from 'zod';
import sanitizeHtml from 'sanitize-html';
import { User } from './types';

const userSchema = z.object({
    username: z.string().min(1, { message: 'Username is required' }),
    email: z.string().email({ message: 'Invalid email format' }),
});

export const validateUser = (user: Partial<User>) => {
    return userSchema.parse(user);
};

export const sanitizeUserInput = (user: Partial<User>) => {
    return {
        username: sanitizeHtml(user.username ? user.username.trim() : ''),
        email: sanitizeHtml(user.email ? user.email.trim() : ''),
    };
};

// Middleware to validate and sanitize input before processing
export const validateAndSanitizeUserInput = (req, res, next) => {
    try {
        req.body = sanitizeUserInput(req.body);
        validateUser(req.body);
        next();
    } catch (error) {
        logger.error('Validation error', { error: error.message });
        return res.status(400).json({ error: error.message });
    }
};