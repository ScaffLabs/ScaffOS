import express from 'express';
import { body, validationResult } from 'express-validator';
import Database from '../storage/Database';
import { ConfigurationItem } from '../types';

const router = express.Router();
const db = new Database();

// Route to create a new configuration
router.post('/', [
    body('key').trim().escape().notEmpty().withMessage('Key is required'),
    body('value').trim().escape().notEmpty().withMessage('Value is required'),
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        // If validation fails, return the errors
        return res.status(400).json({ errors: errors.array() });
    }
    try {
        const { key, value }: ConfigurationItem = req.body;
        await db.createConfiguration({ key, value });
        // Successful creation returns a 201 status
        res.status(201).json({ message: 'Configuration created successfully!' });
    } catch (error) {
        // Handle any errors that occur during database operations
        res.status(500).json({ error: 'Failed to create configuration' });
    }
});

// Route to get all configurations with pagination and sorting
router.get('/', async (req, res) => {
    const { limit = '10', offset = '0', sortBy = 'key', order = 'asc' } = req.query;
    const parsedLimit = parseInt(limit as string);
    const parsedOffset = parseInt(offset as string);

    try {
        const items = await db.findAll({ limit: parsedLimit, offset: parsedOffset, sortBy: sortBy as string, order: order as 'asc' | 'desc' });
        // Return the list of configurations
        res.status(200).json(items);
    } catch (error) {
        // Handle errors when retrieving configurations
        res.status(500).json({ error: 'Failed to retrieve configurations' });
    }
});

// Route to get a specific configuration by key
router.get('/:key', async (req, res) => {
    try {
        const item = await db.readConfiguration(req.params.key);
        if (!item) return res.status(404).json({ error: 'Configuration not found' });
        // Return the found configuration
        res.json(item);
    } catch (error) {
        // Handle errors during the read operation
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// Route to update an existing configuration
router.put('/', [
    body('key').trim().escape().notEmpty().withMessage('Key is required'),
    body('value').trim().escape().notEmpty().withMessage('Value is required'),
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        // If validation fails, return the errors
        return res.status(400).json({ errors: errors.array() });
    }
    try {
        const { key, value }: ConfigurationItem = req.body;
        await db.updateConfiguration({ key, value });
        // Return success message on successful update
        res.status(200).json({ message: 'Configuration updated successfully!' });
    } catch (error) {
        // Handle errors during the update operation
        res.status(500).json({ error: 'Failed to update configuration' });
    }
});

// Route to delete a configuration by key
router.delete('/:key', async (req, res) => {
    try {
        await db.deleteConfiguration(req.params.key);
        // Return 204 status on successful deletion
        res.status(204).send();
    } catch (error) {
        // Handle errors during the delete operation
        res.status(500).json({ error: 'Failed to delete configuration' });
    }
});

export default router;