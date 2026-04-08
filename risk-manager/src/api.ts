import express from 'express';
import riskManager from './riskManager';
import logger from './logger';
import { body, query, param, validationResult } from 'express-validator';
import { NotFoundError, ValidationError } from './errors';

const router = express.Router();

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
 *         schema:
 *           type: integer
 *       - name: offset
 *         in: query
 *         description: Number of results to skip
 *         required: false
 *         schema:
 *           type: integer
 *       - name: sort
 *         in: query
 *         description: Field to sort by
 *         required: false
 *         schema:
 *           type: string
 *       - name: filter
 *         in: query
 *         description: Field to filter by
 *         required: false
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: A list of risk positions
 *       500:
 *         description: Error retrieving risk positions
 */
router.get('/risk', [
    query('limit').optional().isInt({ min: 1 }).toInt(),
    query('offset').optional().isInt({ min: 0 }).toInt(),
    query('sort').optional().isString(),
    query('filter').optional().isString(),
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    try {
        const { limit = 10, offset = 0, sort, filter } = req.query;
        const positions = await riskManager.getRiskPositions(Number(limit), Number(offset), sort, filter);
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
 *     responses:
 *       201:
 *         description: Risk position created
 *       400:
 *         description: Invalid input
 */
router.post('/risk', [
    body('asset').isString().notEmpty(),
    body('position').isNumeric().isFloat({ min: 0 }),
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    try {
        const { asset, position } = req.body;
        const newPosition = await riskManager.createRiskPosition(asset, position);
        res.status(201).json(newPosition);
    } catch (error) {
        logger.error('Error creating risk position: ', error);
        res.status(400).json({ error: error.message });
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
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               position:
 *                 type: number
 *     responses:
 *       204:
 *         description: Risk position updated
 *       404:
 *         description: Risk position not found
 */
router.put('/risk/:id', [
    param('id').isString(),
    body('position').isNumeric().isFloat({ min: 0 }),
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    try {
        const { id } = req.params;
        const { position } = req.body;
        const updatedPosition = await riskManager.updateRiskPosition(id, position);
        if (!updatedPosition) {
            return res.status(404).send();
        }
        res.status(204).send();
    } catch (error) {
        logger.error('Error updating risk position: ', error);
        res.status(400).json({ error: error.message });
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
 *         schema:
 *           type: string
 *     responses:
 *       204:
 *         description: Risk position deleted
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
        const deleted = await riskManager.deleteRiskPosition(id);
        if (!deleted) {
            return res.status(404).send();
        }
        res.status(204).send();
    } catch (error) {
        logger.error('Error deleting risk position: ', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

export default router;