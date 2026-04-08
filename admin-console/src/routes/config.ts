import express from 'express';
import { body, validationResult } from 'express-validator';
import Database from '../storage/Database';
import { ConfigurationItem } from '../types';
import { logAudit } from '../middleware/auditLogger';

const router = express.Router();
const db = new Database();

router.post('/', [
    body('key').trim().escape().notEmpty().withMessage('Key is required'),
    body('value').trim().escape().notEmpty().withMessage('Value is required'),
], logAudit, async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    try {
        const { key, value }: ConfigurationItem = req.body;
        await db.createConfiguration({ key, value });
        // Log the successful creation of a configuration item
        res.status(201).json({ message: 'Configuration created successfully!' });
    } catch (error) {
        // Catch any database or application errors
        console.error('Create Configuration Error:', error);
        res.status(500).json({ error: 'Failed to create configuration' });
    }
});

router.get('/', async (req, res) => {
    const { limit = '10', offset = '0', sortBy = 'key', order = 'asc' } = req.query;
    const parsedLimit = parseInt(limit as string);
    const parsedOffset = parseInt(offset as string);

    try {
        const items = await db.findAll({ limit: parsedLimit, offset: parsedOffset, sortBy: sortBy as string, order: order as 'asc' | 'desc' });
        res.status(200).json(items);
    } catch (error) {
        console.error('Get All Configurations Error:', error);
        res.status(500).json({ error: 'Failed to retrieve configurations' });
    }
});

router.get('/:key', async (req, res) => {
    try {
        const item = await db.readConfiguration(req.params.key);
        if (!item) return res.status(404).json({ error: 'Configuration not found' });
        res.json(item);
    } catch (error) {
        console.error('Get Configuration Error:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

router.put('/', [
    body('key').trim().escape().notEmpty().withMessage('Key is required'),
    body('value').trim().escape().notEmpty().withMessage('Value is required'),
], logAudit, async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    try {
        const { key, value }: ConfigurationItem = req.body;
        await db.updateConfiguration({ key, value });
        res.status(200).json({ message: 'Configuration updated successfully!' });
    } catch (error) {
        console.error('Update Configuration Error:', error);
        res.status(500).json({ error: 'Failed to update configuration' });
    }
});

router.delete('/:key', async (req, res) => {
    try {
        await db.deleteConfiguration(req.params.key);
        res.status(204).send();
    } catch (error) {
        console.error('Delete Configuration Error:', error);
        res.status(500).json({ error: 'Failed to delete configuration' });
    }
});

export default router;