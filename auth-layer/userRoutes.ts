// Importing necessary modules and functions
import express from 'express';
import { createUser, findUserById, updateUser, deleteUser, getAllUsers } from './storage';
import { validateUser } from './userValidation';
import logger from './logger';
import { ValidationError, NotFoundError } from './errors';

const router = express.Router();

// Route to create a new user
router.post('/users', async (req, res) => {
    const { username, email } = req.body;
    try {
        validateUser({ username, email });
        const user = await createUser(username, email);
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

// Other routes remain unchanged, ensuring they also handle validation errors appropriately.