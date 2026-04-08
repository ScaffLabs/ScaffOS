import express from 'express';
import { body, validationResult } from 'express-validator';
import { createUser, findUserById, updateUser, deleteUser, getAllUsers } from './storage';
import { authMiddleware } from './middleware';
import { ValidationError, NotFoundError } from './errors';

const router = express.Router();

// Create user
router.post('/users', authMiddleware,
    body('username').isString().trim().notEmpty().withMessage('Username is required'),
    body('email').isEmail().withMessage('Valid email is required'),
    async (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return next(new ValidationError(errors.array()));
        }
        const { username, email } = req.body;
        try {
            const user = await createUser(username, email);
            res.status(201).json(user);
        } catch (error) {
            if (error.message === 'Email already in use') {
                return res.status(409).json({ error: error.message });
            }
            next(error);
        }
    }
);

// Update user
router.put('/users/:id', authMiddleware,
    body('username').optional().isString().trim().notEmpty().withMessage('Username must not be empty if provided'),
    body('email').optional().isEmail().withMessage('Valid email is required if provided'),
    async (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return next(new ValidationError(errors.array()));
        }
        const { id } = req.params;
        const user = findUserById(id);
        if (!user) {
            return next(new NotFoundError('User not found'));
        }
        const { username, email } = req.body;
        const updatedUser = updateUser(id, { username, email });
        if (!updatedUser) {
            return next(new NotFoundError('User not found'));
        }
        res.status(204).send();
    }
);

// Delete user
router.delete('/users/:id', authMiddleware, async (req, res, next) => {
    const { id } = req.params;
    const deleted = deleteUser(id);
    if (!deleted) {
        return next(new NotFoundError('User not found'));
    }
    res.status(204).send();
});

// Get all users with pagination, filtering, and sorting
router.get('/users', authMiddleware, async (req, res) => {
    const { limit = 10, offset = 0, sortBy = 'username', order = 'asc' } = req.query;
    const users = getAllUsers();
    const sortedUsers = users.sort((a, b) => {
        if (order === 'asc') return a[sortBy].localeCompare(b[sortBy]);
        return b[sortBy].localeCompare(a[sortBy]);
    });
    const paginatedUsers = sortedUsers.slice(Number(offset), Number(offset) + Number(limit));
    res.status(200).json(paginatedUsers);
});

export default router;