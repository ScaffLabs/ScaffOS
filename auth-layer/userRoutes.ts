import express from 'express';
import { createUser, findUserById, findUserByEmail, updateUser, deleteUser, getAllUsers } from './storage';
import { authMiddleware } from './middleware';
import { body, validationResult } from 'express-validator';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import cors from 'cors';

const router = express.Router();

// CORS configuration
const allowedOrigins = ['https://example.com', 'https://another-domain.com'];
router.use(cors({ origin: allowedOrigins }));

// Helmet for security headers
router.use(helmet());

// Rate limiting middleware
const limiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 100,
    message: 'Too many requests, please try again later.'
});
router.use(limiter);

// Get all users with pagination
router.get('/users', authMiddleware, async (req, res) => {
    const limit = parseInt(req.query.limit as string) || 10;
    const offset = parseInt(req.query.offset as string) || 0;

    const users = getAllUsers().slice(offset, offset + limit);
    res.status(200).json(users);
});

// Create a new user
router.post('/users', authMiddleware, body('username').isString().trim().escape(), body('email').isEmail().normalizeEmail(), async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { username, email } = req.body;
    const existingUser = findUserByEmail(email);
    if (existingUser) {
        return res.status(409).json({ error: 'Email already in use' });
    }

    const user = createUser(username, email);
    res.status(201).json(user);
});

// Update a user
router.put('/users/:id', authMiddleware, body('username').optional().isString().trim().escape(), body('email').optional().isEmail().normalizeEmail(), async (req, res) => {
    const { id } = req.params;
    const user = findUserById(id);
    if (!user) {
        return res.status(404).json({ error: 'User not found' });
    }

    const { username, email } = req.body;
    if (username) user.username = username;
    if (email) user.email = email;
    updateUser(id, user);
    res.status(204).send();
});

// Delete a user
router.delete('/users/:id', authMiddleware, async (req, res) => {
    const { id } = req.params;
    const success = deleteUser(id);
    if (!success) {
        return res.status(404).json({ error: 'User not found' });
    }
    res.status(204).send();
});

export default router;