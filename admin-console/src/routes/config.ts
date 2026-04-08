import express from 'express';
import { body, validationResult } from 'express-validator';
import Database from '../storage/Database';
import { ConfigurationItem } from '../types';
import { ValidationError, NotFoundError, ServiceError } from '../errors/CustomErrors';

const router = express.Router();
const db = new Database();

// Endpoint to create a configuration
router.post('/', [
    body('key').trim().escape().notEmpty().withMessage('Key is required'),
    body('value').trim().escape().notEmpty().withMessage('Value is required'),
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    try {
        const { key, value }: ConfigurationItem = req.body;
        await db.createConfiguration({ key, value });
        res.status(201).json({ message: 'Configuration created successfully!' });
    } catch (error) {
        if (error instanceof ValidationError) {
            return res.status(400).json({ error: error.message });
        }
        if (error instanceof ServiceError) {
            return res.status(500).json({ error: 'Failed to create configuration' });
        }
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// Endpoint to retrieve all configurations with pagination and sorting
router.get('/', async (req, res) => {
    const { limit = '10', offset = '0', sortBy = 'key', order = 'asc' } = req.query;
    const parsedLimit = parseInt(limit as string);
    const parsedOffset = parseInt(offset as string);

    try {
        const items = await db.findAll({ limit: parsedLimit, offset: parsedOffset, sortBy: sortBy as string, order: order as 'asc' | 'desc' });
        res.status(200).json(items);
    } catch (error) {
        res.status(500).json({ error: 'Failed to retrieve configurations' });
    }
});

// Endpoint to get configuration by key
router.get('/:key', async (req, res) => {
    try {
        const item = await db.readConfiguration(req.params.key);
        if (!item) throw new NotFoundError('Configuration not found');
        res.json(item);
    } catch (error) {
        if (error instanceof NotFoundError) {
            return res.status(404).json({ error: error.message });
        }
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// Endpoint to update a configuration
router.put('/', [
    body('key').trim().escape().notEmpty().withMessage('Key is required'),
    body('value').trim().escape().notEmpty().withMessage('Value is required'),
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    try {
        const { key, value }: ConfigurationItem = req.body;
        const existingItem = await db.readConfiguration(key);
        if (!existingItem) throw new NotFoundError('Configuration not found');
        await db.updateConfiguration({ key, value });
        res.status(200).json({ message: 'Configuration updated successfully!' });
    } catch (error) {
        if (error instanceof NotFoundError) {
            return res.status(404).json({ error: error.message });
        }
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// Endpoint to delete a configuration
router.delete('/:key', async (req, res) => {
    try {
        const existingItem = await db.readConfiguration(req.params.key);
        if (!existingItem) throw new NotFoundError('Configuration not found');
        await db.deleteConfiguration(req.params.key);
        res.status(204).send();
    } catch (error) {
        if (error instanceof NotFoundError) {
            return res.status(404).json({ error: error.message });
        }
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

export default router;