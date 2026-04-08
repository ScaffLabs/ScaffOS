import { Router } from 'express';
import { body, param, validationResult } from 'express-validator';
import { createPortfolio, getPortfolio, updatePortfolio, fetchPortfolios } from '../services/portfolioService';
import { auditLog } from '../services/auditService';

const router = Router();

router.post('/', [
    body('name').isString().notEmpty().trim().escape(),
    body('positions').isArray().optional()  
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    try {
        const portfolio = await createPortfolio(req.body);
        await auditLog('CREATE', portfolio);
        res.status(201).json(portfolio);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

router.get('/:id', [
    param('id').isString().trim().escape()
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    try {
        const portfolio = await getPortfolio(req.params.id);
        res.json(portfolio);
    } catch (error) {
        res.status(404).json({ error: error.message });
    }
});

router.put('/:id', [
    param('id').isString().trim().escape(),
    body('name').optional().isString().notEmpty().trim().escape(),
    body('positions').optional().isArray()
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    try {
        const updatedPortfolio = await updatePortfolio(req.params.id, req.body);
        await auditLog('UPDATE', updatedPortfolio);
        res.json(updatedPortfolio);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

router.get('/', async (req, res) => {
    try {
        const portfolios = await fetchPortfolios();
        res.json(portfolios);
    } catch (error) {
        res.status(503).json({ error: 'Service unavailable' });
    }
});

export default router;