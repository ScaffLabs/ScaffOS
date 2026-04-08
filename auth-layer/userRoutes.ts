import express from 'express';
import { createUser, findUserById, updateUser, deleteUser, getAllUsers } from './storage';
import { validateAndSanitizeUserInput, authMiddleware } from './middleware';
import logger from './logger';
import { rateLimit } from './rateLimit';
import { ValidationError, NotFoundError } from './errors';
import { emitUserCreated } from './interServiceClient';

const router = express.Router();

router.post('/users', authMiddleware, validateAndSanitizeUserInput, async (req, res) => {
    const { username, email } = req.body;
    try {
        const user = await createUser(username, email);
        emitUserCreated(user);
        logger.info('User created', { userId: user.id, username: user.username });
        res.status(201).json(user);
    } catch (error) {
        logger.error('Error creating user', { error: error.message });
        if (error instanceof ValidationError) {
            return res.status(400).json({ error: error.message, details: error.errors });
        }
        if (error.message === 'Email already in use') {
            return res.status(409).json({ error: error.message });
        }
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

router.put('/users/:id', authMiddleware, validateAndSanitizeUserInput, async (req, res) => {
    const userId = req.params.id;
    try {
        const updatedUser = await updateUser(userId, req.body);
        if (!updatedUser) throw new NotFoundError('User not found for update');
        logger.info('User updated', { userId });
        res.status(204).send();
    } catch (error) {
        logger.error('Error updating user', { error: error.message });
        if (error instanceof NotFoundError) {
            return res.status(404).json({ error: error.message });
        }
        res.status(500).json({ error: 'Internal Server Error' });
    }
});