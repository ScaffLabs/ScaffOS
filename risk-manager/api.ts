import express from 'express';
import riskManager from './riskManager';
import logger from './logger';
import loggingMiddleware from './middleware/loggingMiddleware';

const router = express.Router();

router.use(loggingMiddleware);

router.get('/risk', async (req, res) => {
  try {
    const { limit, offset, sort, filter } = req.query;
    const positions = await riskManager.getRiskPositions(Number(limit), Number(offset));
    res.status(200).json(positions);
  } catch (error) {
    logger.error('Error retrieving risk positions: ', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

router.post('/risk', async (req, res) => {
  try {
    const { asset, position } = req.body;
    const newPosition = await riskManager.createRiskPosition(asset, position);
    res.status(201).json(newPosition);
  } catch (error) {
    logger.error('Error creating risk position: ', error);
    res.status(400).json({ error: error.message });
  }
});

// Additional routes for updating and deleting risk positions...

export default router; 
