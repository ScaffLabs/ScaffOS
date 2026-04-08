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
        logger.info('User created', { userId: user.id });
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

router.get('/users', authMiddleware, async (req, res) => {
    const { limit = 10, offset = 0, sort = 'username', order = 'asc' } = req.query;
    try {
        const users = await getAllUsers();
        const sortedUsers = users.sort((a, b) => {
            if (order === 'asc') {
                return a[sort] > b[sort] ? 1 : -1;
            } else {
                return a[sort] < b[sort] ? 1 : -1;
            }
        });
        const paginatedUsers = sortedUsers.slice(Number(offset), Number(offset) + Number(limit));
        res.status(200).json(paginatedUsers);
    } catch (error) {
        logger.error('Error fetching users', { error: error.message });
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

router.get('/users/:id', authMiddleware, async (req, res) => {
    const userId = req.params.id;
    try {
        const user = await findUserById(userId);
        if (!user) throw new NotFoundError('User not found');
        res.status(200).json(user);
    } catch (error) {
        logger.error('Error fetching user', { error: error.message });
        if (error instanceof NotFoundError) {
            return res.status(404).json({ error: error.message });
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

router.delete('/users/:id', authMiddleware, async (req, res) => {
    const userId = req.params.id;
    try {
        const deleted = await deleteUser(userId);
        if (!deleted) throw new NotFoundError('User not found for deletion');
        logger.info('User deleted', { userId });
        res.status(204).send();
    } catch (error) {
        logger.error('Error deleting user', { error: error.message });
        if (error instanceof NotFoundError) {
            return res.status(404).json({ error: error.message });
        }
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

router.use((req, res, next) => {
    const apiKey = req.headers['x-api-key'];
    if (!rateLimit(apiKey)) {
        return res.status(429).json({ error: 'Rate limit exceeded' });
    }
    next();
});

export default router;