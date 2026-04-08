import express from 'express';
import riskManager from './riskManager';
import logger from './logger';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { body, query, param, validationResult } from 'express-validator';
import { NotFoundError, ValidationError } from './errors';

const router = express.Router();

// CORS configuration
const allowedOrigins = ['http://example.com', 'http://anotherdomain.com'];
router.use(cors({ origin: allowedOrigins }));
router.use(helmet()); // Set security-related HTTP headers

// Rate limiting middleware
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100,
    message: 'Too many requests from this IP, please try again later.'
});
router.use(limiter);

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
        const { limit = 10, offset = 0 } = req.query;
        const positions = await riskManager.getRiskPositions(Number(limit), Number(offset));
        res.status(200).json(positions);
    } catch (error) {
        logger.error('Error retrieving risk positions: ', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

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
        if (error instanceof ValidationError) {
            return res.status(400).json({ error: error.message });
        }
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

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