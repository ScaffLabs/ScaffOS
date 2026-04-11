import express from 'express';
import { createUser, getAllUsers, updateUser, deleteUser, findUserByEmail } from './storage';
import { emitUserCreatedEvent } from './eventBus';
import logger from './logger';
import { ValidationError, NotFoundError, EmptyArrayError } from './errors';
import { UserSchema } from './types';
import { requestSizeLimitMiddleware, validateAndSanitizeUserInput } from './middleware';
import { notifyUserService } from './interServiceClient';

const router = express.Router();

router.use(requestSizeLimitMiddleware);
router.use(validateAndSanitizeUserInput);

router.post('/users', async (req, res) => {
    const sanitizedInput = req.body;
    try {
        UserSchema.parse(sanitizedInput);
        const existingUser = await findUserByEmail(sanitizedInput.email);
        if (existingUser) {
            throw new ValidationError(['Email already in use']);
        }
        const user = await createUser(sanitizedInput.username, sanitizedInput.email);
        emitUserCreatedEvent(user);
        await notifyUserService(user);
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

router.get('/users', async (req, res) => {
    const { limit = 10, offset = 0, sort = 'username', order = 'asc', filter } = req.query;
    try {
        let users = await getAllUsers();
        if (filter) {
            users = users.filter(user => user.username.includes(filter) || user.email.includes(filter));
        }
        users.sort((a, b) => {
            const aValue = a[sort];
            const bValue = b[sort];
            return order === 'asc' ? (aValue > bValue ? 1 : -1) : (aValue < bValue ? 1 : -1);
        });
        const paginatedUsers = users.slice(offset, offset + limit);
        res.status(200).json(paginatedUsers);
    } catch (error) {
        logger.error('Error fetching users', { error: error.message });
        if (error instanceof EmptyArrayError) {
            return res.status(404).json({ error: error.message });
        }
        return res.status(500).json({ error: 'Internal Server Error' });
    }
});

router.put('/users/:id', async (req, res) => {
    const { id } = req.params;
    const sanitizedInput = req.body;
    try {
        UserSchema.parse(sanitizedInput);
        const updatedUser = await updateUser(id, sanitizedInput);
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

router.delete('/users/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const deleted = await deleteUser(id);
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