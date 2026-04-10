import express from 'express';
import riskManager from './riskManager';
import logger from './logger';
import { body, query, param, validationResult } from 'express-validator';
import { NotFoundError, ValidationError } from './errors';
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
 * @swagger
 * /api/risk:
 *   get:
 *     summary: Retrieve risk positions
 *     parameters:
 *       - name: limit
 *         in: query
 *         description: Number of results to return
 *         required: false
 *         type: integer
 *       - name: offset
 *         in: query
 *         description: Number of results to skip
 *         required: false
 *         type: integer
 *       - name: sortBy
 *         in: query
 *         description: Field to sort by
 *         required: false
 *         type: string
 *       - name: filterBy
 *         in: query
 *         description: Field to filter by (e.g., asset name)
 *         required: false
 *         type: string
 *     responses:
 *       200:
 *         description: A list of risk positions
 *       400:
 *         description: Validation error
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
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

/**
 * @swagger
 * /api/risk:
 *   post:
 *     summary: Create a new risk position
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               asset:
 *                 type: string
 *               position:
 *                 type: number
 *             required:
 *               - asset
 *               - position
 *     responses:
 *       201:
 *         description: Risk position created successfully
 *       400:
 *         description: Validation error
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
 * @swagger
 * /api/risk/{id}:
 *   put:
 *     summary: Update a risk position
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: Risk position ID
 *       - name: position
 *         in: body
 *         required: true
 *         description: New position value
 *         schema:
 *           type: object
 *           properties:
 *             position:
 *               type: number
 *     responses:
 *       204:
 *         description: Risk position updated successfully
 *       404:
 *         description: Risk position not found
 *       400:
 *         description: Validation error
 */
router.put('/risk/:id', [
    param('id').isString(),
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
 * @swagger
 * /api/risk/{id}:
 *   delete:
 *     summary: Delete a risk position
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: Risk position ID
 *     responses:
 *       204:
 *         description: Risk position deleted successfully
 *       404:
 *         description: Risk position not found
 */
router.delete('/risk/:id', [
    param('id').isString(),
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