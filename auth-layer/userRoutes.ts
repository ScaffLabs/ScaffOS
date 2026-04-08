import express from 'express';
import { body, validationResult } from 'express-validator';
import { createUser, findUserById, updateUser, deleteUser, getAllUsers } from './storage';
import { validateAndSanitizeUserInput, authMiddleware } from './middleware';
import logger from './logger';

const router = express.Router();

router.post('/users', authMiddleware, validateAndSanitizeUserInput, async (req, res) => {
    const { username, email } = req.body;
    try {
        const user = createUser(username, email);
        logger.info('User created', { userId: user.id });
        res.status(201).json(user);
    } catch (error) {
        logger.error('Error creating user', { error: error.message });
        if (error.message === 'Email already in use') {
            return res.status(409).json({ error: error.message });
        }
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

router.get('/users', authMiddleware, async (req, res) => {
    const users = getAllUsers();
    res.status(200).json(users);
});

router.get('/users/:id', authMiddleware, async (req, res) => {
    const userId = req.params.id;
    const user = findUserById(userId);
    if (!user) {
        logger.warn('User not found', { userId });
        return res.status(404).json({ error: 'User not found' });
    }
    res.status(200).json(user);
});

router.put('/users/:id', authMiddleware, validateAndSanitizeUserInput, async (req, res) => {
    const userId = req.params.id;
    const updatedUser = updateUser(userId, req.body);
    if (!updatedUser) {
        logger.warn('User not found for update', { userId });
        return res.status(404).json({ error: 'User not found' });
    }
    logger.info('User updated', { userId });
    res.status(204).send();
});

router.delete('/users/:id', authMiddleware, async (req, res) => {
    const userId = req.params.id;
    const deleted = deleteUser(userId);
    if (!deleted) {
        logger.warn('User not found for deletion', { userId });
        return res.status(404).json({ error: 'User not found' });
    }
    logger.info('User deleted', { userId });
    res.status(204).send();
});

export default router;