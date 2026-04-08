import { Router } from 'express';
import { body, param, validationResult } from 'express-validator';
import { createPortfolio, getPortfolio, updatePortfolio } from '../services/portfolioService';
import logger from '../services/logger';
import { auditLog } from '../services/auditService';

const router = Router();

// Middleware for input validation and sanitization
const portfolioValidation = [
    body('name').isString().trim().escape().notEmpty().withMessage('Name is required'),
    body('positions').isArray().optional().custom((positions) => {
        positions.forEach(pos => {
            if (!pos.symbol || typeof pos.quantity !== 'number' || pos.quantity < 0 || typeof pos.averagePrice !== 'number' || pos.averagePrice < 0) {
                throw new Error('Invalid position data');
            }
        });
        return true;
    })
];

// Create a new portfolio
router.post('/', portfolioValidation, async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    try {
        const portfolio = await createPortfolio(req.body);
        await auditLog('Create Portfolio', portfolio);
        res.status(201).json(portfolio);
    } catch (error) {
        logger.error('Error creating portfolio', { error: error.message });
        res.status(400).json({ error: 'Failed to create portfolio.' });
    }
});

// Get a portfolio by ID
router.get('/:id', [param('id').isString().trim().escape()], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    try {
        const portfolio = await getPortfolio(req.params.id);
        res.status(200).json(portfolio);
    } catch (error) {
        logger.error('Error fetching portfolio', { error: error.message });
        res.status(404).json({ error: 'Portfolio not found.' });
    }
});

// Update a portfolio
router.put('/:id', [param('id').isString().trim().escape(), ...portfolioValidation], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    try {
        const updatedPortfolio = await updatePortfolio(req.params.id, req.body);
        await auditLog('Update Portfolio', updatedPortfolio);
        res.status(200).json(updatedPortfolio);
    } catch (error) {
        logger.error('Error updating portfolio', { error: error.message });
        res.status(404).json({ error: 'Portfolio not found.' });
    }
});

export default router;