import { Router } from 'express';
import { createPortfolio, getPortfolio, updatePortfolio, fetchPortfolios } from '../services/portfolioService';

const router = Router();

router.post('/', async (req, res) => {
  try {
    const portfolio = await createPortfolio(req.body);
    res.status(201).json(portfolio);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const portfolio = await getPortfolio(req.params.id);
    res.json(portfolio);
  } catch (error) {
    res.status(404).json({ error: error.message });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const updatedPortfolio = await updatePortfolio(req.params.id, req.body);
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