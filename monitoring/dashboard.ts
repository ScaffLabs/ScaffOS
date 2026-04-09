import { Request, Response } from 'express';
import { ValidationError, NotFoundError } from './errorClasses';
import logger from './logger';
import InMemoryStore from './dataStore';
import { LatencyData, LatencyDataSchema } from './types';

const store = new InMemoryStore<LatencyData>();

// List all dashboard entries with pagination support
export const listDashboardEntries = async (req: Request, res: Response) => {
    try {
        const limit = parseInt(req.query.limit as string) || 10; // Default limit is 10
        const offset = parseInt(req.query.offset as string) || 0; // Default offset is 0
        const entries = store.getAll().slice(offset, offset + limit); // Fetch entries with pagination
        if (entries.length === 0) {
            return res.status(204).json([]); // No content if no entries found
        }
        res.status(200).json(entries); // Return the entries found
    } catch (error) {
        logger.error(error, req);
        res.status(500).json({ error: 'Failed to fetch entries.' }); // Handle unexpected errors
    }
};

// Create a new entry in the dashboard
export const createDashboardEntry = async (req: Request, res: Response) => {
    try {
        const bodyValidation = LatencyDataSchema.safeParse({ ...req.body, timestamp: new Date() }); // Validate request body
        if (!bodyValidation.success) {
            throw new ValidationError('Invalid input data. Please provide valid path and duration.'); // Throw if validation fails
        }
        const { path, duration, timestamp } = bodyValidation.data;
        store.create({ path, duration, timestamp }, path); // Store the new entry
        logger.info(`Created new entry: ${path}`);
        res.status(201).json({ message: 'Entry created', id: path }); // Return success message
    } catch (error) {
        logger.error(error, req);
        if (error instanceof ValidationError) {
            return res.status(400).json({ error: error.message }); // Return error message if validation error
        }
        res.status(500).json({ error: 'Internal Server Error' }); // Handle unexpected errors
    }
};

// Update an existing dashboard entry
export const updateDashboardEntry = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const bodyValidation = LatencyDataSchema.partial().safeParse(req.body); // Validate partial update
        if (!bodyValidation.success) {
            throw new ValidationError('Invalid input data. Please ensure the fields are correct.'); // Throw if validation fails
        }
        const existingEntry = store.read(id); // Check for existing entry
        if (!existingEntry) {
            throw new NotFoundError('Entry not found.'); // Throw if entry not found
        }
        const updatedData = { ...existingEntry, ...bodyValidation.data }; // Merge existing and new data
        store.update(id, updatedData); // Update the store
        logger.info(`Updated entry: ${id}`);
        res.status(204).send(); // Return no content on success
    } catch (error) {
        logger.error(error, req);
        if (error instanceof NotFoundError) {
            return res.status(404).json({ error: error.message }); // Return error if entry not found
        }
        res.status(500).json({ error: 'Internal Server Error' }); // Handle unexpected errors
    }
};

// Delete a dashboard entry
export const deleteDashboardEntry = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const existingEntry = store.read(id); // Check for existing entry
        if (!existingEntry) {
            throw new NotFoundError('Entry not found.'); // Throw if entry not found
        }
        store.delete(id); // Delete from store
        logger.info(`Deleted entry: ${id}`);
        res.status(204).send(); // Return no content on success
    } catch (error) {
        logger.error(error, req);
        if (error instanceof NotFoundError) {
            return res.status(404).json({ error: error.message }); // Return error if entry not found
        }
        res.status(500).json({ error: 'Internal Server Error' }); // Handle unexpected errors
    }
};