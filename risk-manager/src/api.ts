import express from 'express';
import riskManager from './riskManager';
import logger from './logger';
import { body, query, param, validationResult } from 'express-validator';
import { NotFoundError, ValidationError } from './errors';

const router = express.Router();

router.get('/risk', [
    query('limit').optional().isInt({ min: 1 }).toInt(),
    query('offset').optional().isInt({ min: 0 }).toInt(),
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    try {
        const { limit = 10, offset = 0 } = req.query;
        const positions = await riskManager.getRiskPositions(limit, offset);
        res.status(200).json(positions);
    } catch (error) {
        logger.error('Error retrieving risk positions: ', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

router.post('/risk', [
    body('asset').isString().notEmpty().withMessage('Asset field cannot be empty.'),
    body('position').isNumeric().isFloat({ min: 0 }).withMessage('Position must be a non-negative number.'),
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
        if (error instanceof ValidationError) {
            return res.status(400).json({ error: error.message });
        }
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

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
        res.status(204).send();
    } catch (error) {
        logger.error('Error updating risk position: ', error);
        if (error instanceof NotFoundError) {
            return res.status(404).send();
        }
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

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