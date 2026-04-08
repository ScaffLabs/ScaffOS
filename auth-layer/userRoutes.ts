import express from 'express';
import { body, validationResult } from 'express-validator';
import { createUser, findUserById, updateUser, deleteUser, getAllUsers } from './storage';
import { authMiddleware } from './middleware';
import { emitUserCreatedEvent } from './eventBus';
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
            emitUserCreatedEvent(user);
            res.status(201).json(user);
        } catch (error) {
            if (error.message === 'Email already in use') {
                return res.status(409).json({ error: error.message });
            }
            next(error);
        }
    }
);

export default router;