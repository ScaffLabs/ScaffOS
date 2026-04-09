import express from 'express';
import { createUser, findUserById, updateUser, deleteUser, getAllUsers } from './storage';
import { validateUser } from './userValidation';
import logger from './logger';
import { ValidationError, NotFoundError } from './errors';
import { sanitizeUserInput } from './userValidation'; // Importing the sanitize function

const router = express.Router();

// Route to create a new user
router.post('/users', async (req, res) => {
    const { username, email } = sanitizeUserInput(req.body); // Sanitize inputs
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

// Other routes remain unchanged, ensuring they also handle validation errors appropriately.

export default router;