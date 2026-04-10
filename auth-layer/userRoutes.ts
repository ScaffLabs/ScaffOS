import express from 'express';
import { createUser, getAllUsers, updateUser, deleteUser, findUserByEmail } from './storage';
import { emitUserCreatedEvent } from './eventBus';
import logger from './logger';
import { ValidationError, NotFoundError } from './errors';
import { sanitizeUserInput } from './userValidation';
import { validateUser } from './userValidation';

const router = express.Router();

// Create User
router.post('/users', async (req, res) => {
    const sanitizedInput = sanitizeUserInput(req.body); // Sanitize input to prevent XSS
    try {
        validateUser(sanitizedInput); // Validate the sanitized input to ensure it conforms to the User schema
        const existingUser = await findUserByEmail(sanitizedInput.email);
        if (existingUser) {
            throw new ValidationError(['Email already in use']); // Throw validation error if email is already taken
        }
        const user = await createUser(sanitizedInput.username, sanitizedInput.email); // Create new user
        emitUserCreatedEvent(user); // Emit an event for user creation
        logger.info('User created', { userId: user.id, username: user.username });
        res.status(201).json(user); // Respond with the created user
    } catch (error) {
        logger.error('Error creating user', { error: error.message });
        if (error instanceof ValidationError) {
            return res.status(400).json({ error: error.message, details: error.errors }); // Respond with validation error details
        }
        return res.status(500).json({ error: 'Internal Server Error' }); // Handle unexpected errors
    }
});

// Get All Users
router.get('/users', async (req, res) => {
    try {
        const users = await getAllUsers(); // Fetch all users from the database
        res.status(200).json(users); // Respond with the list of users
    } catch (error) {
        logger.error('Error fetching users', { error: error.message });
        return res.status(500).json({ error: 'Internal Server Error' }); // Handle unexpected errors
    }
});

// Update User
router.put('/users/:id', async (req, res) => {
    const { id } = req.params; // Get user ID from request parameters
    const sanitizedInput = sanitizeUserInput(req.body); // Sanitize input to prevent XSS
    try {
        validateUser(sanitizedInput); // Validate the sanitized input
        const updatedUser = await updateUser(id, sanitizedInput); // Update user in the database
        if (!updatedUser) {
            throw new NotFoundError('User not found for update'); // Throw error if user not found
        }
        logger.info('User updated', { userId: id });
        res.status(204).send(); // Respond with no content on success
    } catch (error) {
        logger.error('Error updating user', { error: error.message });
        if (error instanceof ValidationError) {
            return res.status(400).json({ error: error.message, details: error.errors }); // Respond with validation error details
        }
        if (error instanceof NotFoundError) {
            return res.status(404).json({ error: error.message }); // Respond with not found error
        }
        return res.status(500).json({ error: 'Internal Server Error' }); // Handle unexpected errors
    }
});

// Delete User
router.delete('/users/:id', async (req, res) => {
    const { id } = req.params; // Get user ID from request parameters
    try {
        const deleted = await deleteUser(id); // Delete user from the database
        if (!deleted) {
            throw new NotFoundError('User not found'); // Throw error if user not found
        }
        logger.info('User deleted', { userId: id });
        res.status(204).send(); // Respond with no content on success
    } catch (error) {
        logger.error('Error deleting user', { error: error.message });
        if (error instanceof NotFoundError) {
            return res.status(404).json({ error: error.message }); // Respond with not found error
        }
        return res.status(500).json({ error: 'Internal Server Error' }); // Handle unexpected errors
    }
});

export default router;