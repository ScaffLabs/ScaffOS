// Importing necessary modules and functions
import express from 'express';
import { createUser, findUserById, updateUser, deleteUser, getAllUsers } from './storage';
import { validateAndSanitizeUserInput, authMiddleware } from './middleware';
import logger from './logger';
import { ValidationError, NotFoundError } from './errors';
import { validateUser } from './userValidation';

const router = express.Router();

// Route to create a new user
router.post('/users', authMiddleware, validateAndSanitizeUserInput, async (req, res) => {
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

// Route to get all users
router.get('/users', authMiddleware, async (req, res) => {
    const { limit = 10, offset = 0 } = req.query;
    try {
        const users = await getAllUsers();
        res.status(200).json(users);
    } catch (error) {
        logger.error('Error retrieving users', { error: error.message });
        return res.status(500).json({ error: 'Internal Server Error' });
    }
});

// Route to update an existing user
router.put('/users/:id', authMiddleware, validateAndSanitizeUserInput, async (req, res) => {
    const userId = req.params.id;
    try {
        validateUser(req.body);
        const updatedUser = await updateUser(userId, req.body);
        if (!updatedUser) throw new NotFoundError('User not found for update');
        logger.info('User updated', { userId });
        res.status(204).send();
    } catch (error) {
        logger.error('Error updating user', { error: error.message });
        if (error instanceof NotFoundError) {
            return res.status(404).json({ error: error.message });
        }
        return res.status(500).json({ error: 'Internal Server Error' });
    }
});

// Route to delete a user
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
        return res.status(500).json({ error: 'Internal Server Error' });
    }
});

// Route to get a user by ID
router.get('/users/:id', authMiddleware, async (req, res) => {
    const userId = req.params.id;
    try {
        const user = await findUserById(userId);
        res.status(200).json(user);
    } catch (error) {
        logger.error('Error retrieving user', { error: error.message });
        if (error instanceof NotFoundError) {
            return res.status(404).json({ error: error.message });
        }
        return res.status(500).json({ error: 'Internal Server Error' });
    }
});

export default router;