import express from 'express';
import { body, validationResult } from 'express-validator';
import Database from '../storage/Database';
import { ConfigurationItem } from '../types';
import { NotFoundError } from '../errors/CustomErrors';
import rateLimit from 'express-rate-limit';

const router = express.Router();
const db = new Database();

const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    message: 'Too many requests, please try again later.'
});

router.use(limiter);

// Create a new configuration
router.post('/', [
    body('key').trim().escape().notEmpty().withMessage('Key is required'),
    body('value').trim().escape().notEmpty().withMessage('Value is required')
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    try {
        const { key, value } = req.body;
        await db.createConfiguration({ key, value });
        res.status(201).json({ message: 'Configuration created successfully!' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// Get all configurations with pagination, sorting and filtering
router.get('/', async (req, res) => {
    const { limit = 10, offset = 0, sortBy = 'key', order = 'asc' } = req.query;
    try {
        const configurations = await db.getConfigurations({ limit: Number(limit), offset: Number(offset), sortBy, order });
        res.status(200).json(configurations);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to retrieve configurations' });
    }
});

// Get a configuration by key
router.get('/:key', async (req, res) => {
    const { key } = req.params;
    try {
        const configuration = await db.getConfigurationByKey(key);
        if (!configuration) {
            throw new NotFoundError('Configuration not found');
        }
        res.status(200).json(configuration);
    } catch (error) {
        console.error(error);
        if (error instanceof NotFoundError) {
            return res.status(404).json({ error: error.message });
        }
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// Update a configuration
router.put('/', [
    body('key').trim().escape().notEmpty().withMessage('Key is required'),
    body('value').trim().escape().notEmpty().withMessage('Value is required')
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    try {
        const { key, value } = req.body;
        await db.updateConfiguration({ key, value });
        res.status(200).json({ message: 'Configuration updated successfully!' });
    } catch (error) {
        console.error(error);
        if (error instanceof NotFoundError) {
            return res.status(404).json({ error: error.message });
        }
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// Delete a configuration
router.delete('/:key', async (req, res) => {
    const { key } = req.params;
    try {
        await db.deleteConfiguration(key);
        res.status(204).send();
    } catch (error) {
        console.error(error);
        if (error instanceof NotFoundError) {
            return res.status(404).json({ error: error.message });
        }
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

export default router;