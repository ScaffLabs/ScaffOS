import express from 'express';
import { body, validationResult } from 'express-validator';
import { createUser, findUserById, updateUser, deleteUser, getAllUsers } from './storage';
import { authMiddleware } from './middleware';
import { ValidationError } from './errors';

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
        const existingUser = await findUserById(email);
        if (existingUser) {
            return res.status(409).json({ error: 'Email already in use' });
        }
        const user = createUser(username, email);
        res.status(201).json(user);
    }
);

router.put('/users/:id', authMiddleware,
    body('username').optional().isString().trim().notEmpty().withMessage('Username must not be empty if provided'),
    body('email').optional().isEmail().withMessage('Valid email is required if provided'),
    async (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return next(new ValidationError(errors.array()));
        }
        const { id } = req.params;
        const user = await findUserById(id);
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

export default router;