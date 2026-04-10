import express from 'express';
import { createUser, getAllUsers, updateUser, deleteUser, findUserByEmail } from './storage';
import { emitUserCreatedEvent } from './eventBus';
import logger from './logger';
import { ValidationError, NotFoundError } from './errors';
import { sanitizeUserInput } from './userValidation';

const router = express.Router();

// Create User
router.post('/users', async (req, res) => {
    const { username, email } = sanitizeUserInput(req.body);
    try {
        const existingUser = await findUserByEmail(email);
        if (existingUser) {
            throw new ValidationError(['Email already in use']);
        }
        const user = await createUser(username, email);
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

// Get All Users with Pagination, Filtering, and Sorting
router.get('/users', async (req, res) => {
    const { limit = 10, offset = 0, sort = 'username', order = 'asc' } = req.query;
    const filter = req.query.filter ? JSON.parse(req.query.filter) : {};
    try {
        const users = await getAllUsers();
        let filteredUsers = users;

        // Filtering
        if (filter.username) {
            filteredUsers = filteredUsers.filter(user => user.username.includes(filter.username));
        }
        if (filter.email) {
            filteredUsers = filteredUsers.filter(user => user.email.includes(filter.email));
        }

        // Sorting
        filteredUsers.sort((a, b) => {
            if (order === 'asc') {
                return a[sort] > b[sort] ? 1 : -1;
            }
            return a[sort] < b[sort] ? 1 : -1;
        });

        // Pagination
        const paginatedUsers = filteredUsers.slice(offset, offset + limit);
        res.status(200).json(paginatedUsers);
    } catch (error) {
        logger.error('Error fetching users', { error: error.message });
        return res.status(500).json({ error: 'Internal Server Error' });
    }
});

// Update User
router.put('/users/:id', async (req, res) => {
    const { id } = req.params;
    const userData = sanitizeUserInput(req.body);
    try {
        const updatedUser = await updateUser(id, userData);
        if (!updatedUser) {
            throw new NotFoundError('User not found for update');
        }
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
        const deleted = await deleteUser(id);
        if (!deleted) {
            throw new NotFoundError('User not found');
        }
        res.status(204).send();
    } catch (error) {
        logger.error('Error deleting user', { error: error.message });
        if (error instanceof NotFoundError) {
            return res.status(404).json({ error: error.message });
        }
        return res.status(500).json({ error: 'Internal Server Error' });
    }
});

// Fetch User by ID
router.get('/users/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const user = await findUserById(id);
        if (!user) {
            throw new NotFoundError('User not found');
        }
        res.status(200).json(user);
    } catch (error) {
        logger.error('Error fetching user', { error: error.message });
        if (error instanceof NotFoundError) {
            return res.status(404).json({ error: error.message });
        }
        return res.status(500).json({ error: 'Internal Server Error' });
    }
});

export default router;