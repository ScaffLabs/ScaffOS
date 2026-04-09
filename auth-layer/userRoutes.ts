import express from 'express';
import { createUser, getAllUsers } from './storage';
import { emitUserCreatedEvent } from './interServiceClient';
import logger from './logger';
import { ValidationError } from './errors';
import { sanitizeUserInput } from './userValidation';

const router = express.Router();

// Route to create a new user
router.post('/users', async (req, res) => {
    const { username, email } = sanitizeUserInput(req.body);
    try {
        const user = await createUser(username, email);
        emitUserCreatedEvent(user); // Emit event on user creation
        logger.info('User created', { userId: user.id, username: user.username });
        res.status(201).json(user);
    } catch (error) {
        logger.error('Error creating user', { error: error.message, stack: error.stack });
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
        logger.error('Error fetching users', { error: error.message, stack: error.stack });
        return res.status(500).json({ error: 'Internal Server Error' });
    }
});

export default router;