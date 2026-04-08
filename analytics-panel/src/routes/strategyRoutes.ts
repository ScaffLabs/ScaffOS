import { Router } from 'express';
import { getStrategiesHandler, createStrategyHandler, updateStrategyHandler, deleteStrategyHandler, initializeHandler } from '../handlers/strategyHandler';

const router = Router();

router.get('/', getStrategiesHandler);
router.post('/', createStrategyHandler);
router.put('/:id', updateStrategyHandler);
router.delete('/:id', deleteStrategyHandler);
router.post('/initialize', initializeHandler);

export default router;