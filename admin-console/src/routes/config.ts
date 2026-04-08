import express from 'express';
import { body, validationResult } from 'express-validator';
import Database from '../storage/Database';
import { ConfigurationItem } from '../types';
import { ValidationError, NotFoundError, ServiceError } from '../errors/CustomErrors';

const router = express.Router();
const db = new Database();

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

export default router;