import express from 'express';
import { createUser, findUserById, findUserByEmail } from './user';
import { authMiddleware } from './middleware';
import { body, validationResult } from 'express-validator';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { sanitize } from 'some-sanitization-library'; // Assume a sanitization library is used
import cors from 'cors';
import { auditLog } from './audit'; // Audit logging utility

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

router.get('/users', authMiddleware, async (req, res) => {
    const limit = parseInt(req.query.limit as string) || 10;
    const offset = parseInt(req.query.offset as string) || 0;
    const users = await User.find().limit(limit).skip(offset);
    res.status(200).json(users);
});

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
    await auditLog('User created', { username, email }); // Log sensitive operations
    res.status(201).json(user);
});

router.put('/users/:id', authMiddleware, body('username').optional().isString().trim().escape(), body('email').optional().isEmail().normalizeEmail(), async (req, res) => {
    const { id } = req.params;
    const user = findUserById(id);
    if (!user) {
        return res.status(404).json({ error: 'User not found' });
    }

    const { username, email } = req.body;
    if (username) user.username = sanitize(username);
    if (email) user.email = sanitize(email);
    await auditLog('User updated', { id, username, email });
    res.status(204).send();
});

router.delete('/users/:id', authMiddleware, async (req, res) => {
    const { id } = req.params;
    const userIndex = users.findIndex(user => user.id === id);
    if (userIndex === -1) {
        return res.status(404).json({ error: 'User not found' });
    }
    users.splice(userIndex, 1);
    await auditLog('User deleted', { id });
    res.status(204).send();
});

export default router;