import express from 'express';
import { createUser, getAllUsers, updateUser, deleteUser, findUserByEmail } from './storage';
import { emitUserCreatedEvent } from './eventBus';
import logger from './logger';
import { ValidationError, NotFoundError } from './errors';
import { sanitizeUserInput } from './userValidation';
import { UserSchema } from './types';
import { requestSizeLimitMiddleware } from './middleware';

const router = express.Router();

// Middleware for size limit
router.use(requestSizeLimitMiddleware);

// Create User
router.post('/users', async (req, res) => {
    const sanitizedInput = sanitizeUserInput(req.body);
    try {
        // Validate input against the User schema
        UserSchema.parse(sanitizedInput);
        const existingUser = await findUserByEmail(sanitizedInput.email);
        if (existingUser) {
            throw new ValidationError(['Email already in use']);
        }
        const user = await createUser(sanitizedInput.username, sanitizedInput.email);
        emitUserCreatedEvent(user);
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

// Get All Users
router.get('/users', async (req, res) => {
    try {
        const users = await getAllUsers();
        res.status(200).json(users);
    } catch (error) {
        logger.error('Error fetching users', { error: error.message });
        return res.status(500).json({ error: 'Internal Server Error' });
    }
});

// Update User
router.put('/users/:id', async (req, res) => {
    const { id } = req.params;
    const sanitizedInput = sanitizeUserInput(req.body);
    try {
        // Validate input against the User schema
        UserSchema.parse(sanitizedInput);
        const updatedUser = await updateUser(id as UserId, sanitizedInput);
        if (!updatedUser) {
            throw new NotFoundError('User not found for update');
        }
        logger.info('User updated', { userId: id });
        res.status(204).send();
    } catch (error) {
        logger.error('Error updating user', { error: error.message });
        if (error instanceof ValidationError) {
            return res.status(400).json({ error: error.message, details: error.errors });
        }
        if (error instanceof NotFoundError) {
            return res.status(404).json({ error: error.message });
        }
        return res.status(500).json({ error: 'Internal Server Error' });
    }
});

// Delete User
router.delete('/users/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const deleted = await deleteUser(id as UserId);
        if (!deleted) {
            throw new NotFoundError('User not found');
        }
        logger.info('User deleted', { userId: id });
        res.status(204).send();
    } catch (error) {
        logger.error('Error deleting user', { error: error.message });
        if (error instanceof NotFoundError) {
            return res.status(404).json({ error: error.message });
        }
        return res.status(500).json({ error: 'Internal Server Error' });
    }
});

export default router;