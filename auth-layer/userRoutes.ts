import express from 'express';
import { body, validationResult } from 'express-validator';
import { createUser, findUserById, updateUser, deleteUser, getAllUsers } from './storage';
import { authMiddleware } from './middleware';
import { ValidationError, NotFoundError } from './errors';

const router = express.Router();

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
            const user = createUser(username, email);
            res.status(201).json(user);
        } catch (error) {
            if (error.message === 'Email already in use') {
                return res.status(409).json({ error: error.message });
            }
            next(error);
        }
    }
);

router.get('/users', authMiddleware, async (req, res) => {
    const users = getAllUsers();
    res.status(200).json(users);
});

router.get('/users/:id', authMiddleware, async (req, res, next) => {
    const userId = req.params.id;
    const user = findUserById(userId);
    if (!user) {
        return next(new NotFoundError('User not found'));
    }
    res.status(200).json(user);
});

router.put('/users/:id', authMiddleware,
    body('username').optional().isString().trim().notEmpty().withMessage('Username is required'),
    body('email').optional().isEmail().withMessage('Valid email is required'),
    async (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return next(new ValidationError(errors.array()));
        }
        const userId = req.params.id;
        const updatedUser = updateUser(userId, req.body);
        if (!updatedUser) {
            return next(new NotFoundError('User not found'));
        }
        res.status(204).send();
    }
);

router.delete('/users/:id', authMiddleware, async (req, res, next) => {
    const userId = req.params.id;
    const deleted = deleteUser(userId);
    if (!deleted) {
        return next(new NotFoundError('User not found'));
    }
    res.status(204).send();
});

export default router;