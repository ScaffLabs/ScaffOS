import express from 'express';
import riskManager from './riskManager';
import logger from './logger';
import { body, query, param, validationResult } from 'express-validator';
import { NotFoundError, ValidationError, ServiceError } from './errors';
import rateLimit from 'express-rate-limit';

const router = express.Router();

// Rate limiting middleware
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    message: 'Too many requests from this IP, please try again later',
});
router.use(limiter);

/**
 * GET /risk - Retrieve risk positions with pagination, filtering, and sorting
 * @param {number} [limit] - Number of results to return
 * @param {number} [offset] - Number of results to skip
 * @param {string} [sortBy] - Field to sort by
 * @param {string} [filterBy] - Filter by asset
 */
router.get('/risk', [
    query('limit').optional().isInt({ min: 1 }).toInt(),
    query('offset').optional().isInt({ min: 0 }).toInt(),
    query('sortBy').optional().isString(),
    query('filterBy').optional().isString(),
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    try {
        const { limit = 10, offset = 0, sortBy, filterBy } = req.query;
        const positions = await riskManager.getRiskPositions(limit, offset, sortBy, filterBy);
        res.status(200).json(positions);
    } catch (error) {
        logger.error('Error retrieving risk positions: ', error);
        if (error instanceof ServiceError) {
            return res.status(500).json({ error: error.message });
        }
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

/**
 * POST /risk - Create a new risk position
 * @param {CreateRiskPositionRequest} requestBody - The risk position to create
 */
router.post('/risk', [
    body('asset').isString().notEmpty().withMessage('Asset field cannot be empty.').escape(),
    body('position').isNumeric().isFloat({ min: 0 }).withMessage('Position must be a non-negative number.'),
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    try {
        const { asset, position } = req.body;
        const newPosition = await riskManager.createRiskPosition(asset, position);
        logger.info('Created new risk position:', newPosition);
        res.status(201).json(newPosition);
    } catch (error) {
        logger.error('Error creating risk position: ', error);
        if (error instanceof ValidationError) {
            return res.status(400).json({ error: error.message });
        }
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

/**
 * PUT /risk/:id - Update a risk position by ID
 * @param {string} id - The ID of the risk position to update
 * @param {UpdateRiskPositionRequest} requestBody - The updated position
 */
router.put('/risk/:id', [
    param('id').isString().notEmpty(),
    body('position').isNumeric().isFloat({ min: 0 }).withMessage('Position must be a non-negative number.'),
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    try {
        const { id } = req.params;
        const { position } = req.body;
        await riskManager.updateRiskPosition(id, position);
        logger.info('Updated risk position with id:', id);
        res.status(204).send();
    } catch (error) {
        logger.error('Error updating risk position: ', error);
        if (error instanceof NotFoundError) {
            return res.status(404).send();
        }
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

/**
 * DELETE /risk/:id - Delete a risk position by ID
 * @param {string} id - The ID of the risk position to delete
 */
router.delete('/risk/:id', [
    param('id').isString().notEmpty(),
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    try {
        const { id } = req.params;
        await riskManager.deleteRiskPosition(id);
        logger.info('Deleted risk position with id:', id);
        res.status(204).send();
    } catch (error) {
        logger.error('Error deleting risk position: ', error);
        if (error instanceof NotFoundError) {
            return res.status(404).send();
        }
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

export default router;