import express from 'express';
import { body, validationResult } from 'express-validator';
import InMemoryStore from '../storage/InMemoryStore';
import { ConfigurationItem } from '../types';
import { NotFoundError } from '../errors/CustomErrors';

const router = express.Router();
const db = new InMemoryStore<ConfigurationItem>();

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
        await db.create(key, { key, value });
        return res.status(201).json({ message: 'Configuration created successfully!' });
    } catch (error) {
        console.error('Create Configuration Error:', error);
        return res.status(500).json({ error: 'Failed to create configuration' });
    }
});

router.get('/:key', async (req, res) => {
    const { key } = req.params;
    try {
        const item = await db.read(key);
        if (!item) throw new NotFoundError('Configuration not found');
        return res.json(item);
    } catch (error) {
        if (error instanceof NotFoundError) {
            return res.status(404).json({ error: error.message });
        }
        console.error('Get Configuration Error:', error);
        return res.status(500).json({ error: 'Internal Server Error' });
    }
});

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
        await db.update(key, { key, value });
        return res.status(200).json({ message: 'Configuration updated successfully!' });
    } catch (error) {
        if (error instanceof NotFoundError) {
            return res.status(404).json({ error: 'Configuration not found' });
        }
        console.error('Update Configuration Error:', error);
        return res.status(500).json({ error: 'Failed to update configuration' });
    }
});

router.delete('/:key', async (req, res) => {
    const { key } = req.params;
    try {
        await db.delete(key);
        return res.status(204).send();
    } catch (error) {
        if (error instanceof NotFoundError) {
            return res.status(404).json({ error: 'Configuration not found' });
        }
        console.error('Delete Configuration Error:', error);
        return res.status(500).json({ error: 'Failed to delete configuration' });
    }
});

export default router;