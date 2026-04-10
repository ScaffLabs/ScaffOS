import express from 'express';
import { createUser, getAllUsers, updateUser, deleteUser, findUserByEmail } from './storage';
import { emitUserCreatedEvent } from './eventBus';
import logger from './logger';
import { ValidationError } from './errors';
import { sanitizeUserInput } from './userValidation';
import { validateApiKey } from './apiKey';
import { rateLimit } from './rateLimit';

const router = express.Router();

// Middleware for rate limiting
router.use((req, res, next) => {
    const apiKey = req.headers['x-api-key'];
    if (!apiKey || !rateLimit(apiKey)) {
        return res.status(429).json({ error: 'Rate limit exceeded' });
    }
    next();
});

// Route to create a new user
router.post('/users', async (req, res) => {
    const { username, email } = sanitizeUserInput(req.body);
    try {
        const existingUser = await findUserByEmail(email);
        if (existingUser) {
            return res.status(409).json({ error: 'Email already in use' });
        }
        const user = await createUser(username, email);
        emitUserCreatedEvent(user); // Emit event on user creation
        logger.info('User created', { userId: user.id, username: user.username });
        res.status(201).json(user);
    } catch (error) {
        logger.error('Error creating user', { error: error.message });
        if (error instanceof ValidationError) {
            return res.status(400).json({ error: error.message, details: error.errors });
        }
        return res.status(500).json({ error: 'Internal Server Error' });
    }
});

// Route to get all users
router.get('/users', async (req, res) => {
    try {
        const users = await getAllUsers();
        res.status(200).json(users);
    } catch (error) {
        logger.error('Error fetching users', { error: error.message });
        return res.status(500).json({ error: 'Internal Server Error' });
    }
});

// Route to update a user
router.put('/users/:id', async (req, res) => {
    const { id } = req.params;
    const userData = sanitizeUserInput(req.body);
    try {
        const updatedUser = await updateUser(id, userData);
        if (!updatedUser) {
            return res.status(404).json({ error: 'User not found' });
        }
        res.status(204).send();
    } catch (error) {
        logger.error('Error updating user', { error: error.message });
        if (error instanceof ValidationError) {
            return res.status(400).json({ error: error.message, details: error.errors });
        }
        return res.status(500).json({ error: 'Internal Server Error' });
    }
});

// Route to delete a user
router.delete('/users/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const deleted = await deleteUser(id);
        if (!deleted) {
            return res.status(404).json({ error: 'User not found' });
        }
        res.status(204).send();
    } catch (error) {
        logger.error('Error deleting user', { error: error.message });
        return res.status(500).json({ error: 'Internal Server Error' });
    }
});

export default router;