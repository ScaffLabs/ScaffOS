import express from 'express';
import { body, validationResult } from 'express-validator';
import Database from '../storage/Database';
import { ConfigurationItem } from '../types';

const router = express.Router();
const db = new Database();

// Middleware for pagination and sorting
const paginationMiddleware = (req, res, next) => {
    const { limit = 10, offset = 0, sortBy = 'key', order = 'asc' } = req.query;
    req.pagination = { limit: parseInt(limit), offset: parseInt(offset), sortBy, order };
    next();
};

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
        res.status(500).json({ error: 'Failed to create configuration' });
    }
});

router.get('/', paginationMiddleware, async (req, res) => {
    try {
        const { limit, offset, sortBy, order } = req.pagination;
        const configurations = await db.findAll({ limit, offset, sortBy, order });
        res.json(configurations);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch configurations' });
    }
});

router.get('/:key', async (req, res) => {
    try {
        const item = await db.readConfiguration(req.params.key);
        if (!item) return res.status(404).json({ error: 'Configuration not found' });
        res.json(item);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch configuration' });
    }
});

router.put('/', async (req, res) => {
    const { key, value }: ConfigurationItem = req.body;
    try {
        await db.updateConfiguration({ key, value });
        res.json({ message: 'Configuration updated successfully!' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to update configuration' });
    }
});

router.delete('/:key', async (req, res) => {
    try {
        await db.deleteConfiguration(req.params.key);
        res.status(204).send();
    } catch (error) {
        res.status(500).json({ error: 'Failed to delete configuration' });
    }
});

export default router;