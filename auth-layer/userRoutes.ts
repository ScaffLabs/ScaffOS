// userRoutes.ts
import express from 'express';
import { body, validationResult } from 'express-validator';
import { createUser, findUserById, updateUser, deleteUser, getAllUsers } from './storage';
import { authMiddleware } from './middleware';
import { ValidationError, NotFoundError } from './errors';
import { UserSchema } from './types';

const router = express.Router();

router.post('/users', authMiddleware,
    body('username').isString().trim().notEmpty().withMessage('Username is required'),
    body('email').isEmail().withMessage('Valid email is required'),
    async (req, res, next) => {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return next(new ValidationError(errors.array().map(err => err.msg)));
            }
            const { username, email } = req.body;
            const existingUser = await findUserById(email);
            if (existingUser) {
                return res.status(409).json({ error: 'Email already in use' });
            }
            const user = await createUser(username, email);
            res.status(201).json(user);
        } catch (error) {
            next(error);
        }
    }
);

router.put('/users/:id', authMiddleware,
    body('username').optional().isString().trim().notEmpty().withMessage('Username must not be empty if provided'),
    body('email').optional().isEmail().withMessage('Valid email is required if provided'),
    async (req, res, next) => {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return next(new ValidationError(errors.array().map(err => err.msg)));
            }
            const { id } = req.params;
            const user = await findUserById(id);
            if (!user) {
                return next(new NotFoundError('User not found'));
            }
            const { username, email } = req.body;
            const updatedUser = await updateUser(id, { username, email });
            if (!updatedUser) {
                return next(new NotFoundError('User not found'));
            }
            res.status(204).send();
        } catch (error) {
            next(error);
        }
    }
);

router.delete('/users/:id', authMiddleware, async (req, res, next) => {
    try {
        const { id } = req.params;
        const deleted = await deleteUser(id);
        if (!deleted) {
            return next(new NotFoundError('User not found'));
        }
        res.status(204).send();
    } catch (error) {
        next(error);
    }
});

router.get('/users', authMiddleware, async (req, res, next) => {
    try {
        const users = await getAllUsers();
        res.status(200).json(users);
    } catch (error) {
        next(error);
    }
});

export default router;