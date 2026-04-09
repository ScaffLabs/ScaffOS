import { Request, Response, NextFunction } from 'express';
import { body, validationResult } from 'express-validator';
import { verifyToken } from './jwt';
import { validateApiKey } from './apiKey';
import logger, { logError } from './logger';
import csrf from 'csurf';
import sanitizeHtml from 'sanitize-html';

const csrfProtection = csrf({ cookie: true });

export const requestIdMiddleware = (req: Request, res: Response, next: NextFunction) => {
    req.headers['x-request-id'] = req.headers['x-request-id'] || crypto.randomUUID();
    next();
};

export const sanitizeInput = (input: string) => {
    return sanitizeHtml(input, { allowedTags: [], allowedAttributes: {} });
};

export const validateAndSanitizeUserInput = (req: Request, res: Response, next: NextFunction) => {
    body('username')
        .isString()
        .trim()
        .notEmpty()
        .customSanitizer(value => sanitizeInput(value));
    body('email')
        .isEmail()
        .normalizeEmail()
        .customSanitizer(value => sanitizeInput(value));
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    next();
};

export const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
    const token = req.headers['authorization']?.split(' ')[1];
    const apiKey = req.headers['x-api-key'];

    if (!apiKey || !validateApiKey(apiKey)) {
        logger.error(`Unauthorized access attempt`, { requestId: req.headers['x-request-id'] });
        return res.status(401).json({ error: 'Invalid API key' });
    }

    if (!token) {
        logger.error(`Token required`, { requestId: req.headers['x-request-id'] });
        return res.status(401).json({ error: 'Token required' });
    }

    try {
        const { userId } = verifyToken(token);
        req.userId = userId;
        next();
    } catch (error) {
        logError(error, req);
        return res.status(401).json({ error: error.message });
    }
};

export const csrfMiddleware = csrfProtection;