import { ServiceError, ValidationError, NotFoundError } from './errors';

router.get('/risk', async (req, res) => {
    try {
        const { limit = 10, offset = 0 } = req.query;
        const positions = await riskManager.getRiskPositions(Number(limit), Number(offset));
        if (!positions.length) {
            throw new NotFoundError('No risk positions found.');
        }
        res.status(200).json(positions);
    } catch (error) {
        if (error instanceof NotFoundError) {
            return res.status(404).json({ error: error.message });
        }
        logger.error('Error retrieving risk positions: ', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

router.post('/risk', async (req, res) => {
    try {
        const { asset, position } = req.body;
        if (!asset || typeof asset !== 'string') {
            throw new ValidationError('Asset must be a non-empty string.');
        }
        if (typeof position !== 'number' || position < 0) {
            throw new ValidationError('Position must be a non-negative number.');
        }
        const newPosition = await riskManager.createRiskPosition(asset, position);
        res.status(201).json(newPosition);
    } catch (error) {
        if (error instanceof ValidationError) {
            return res.status(400).json({ error: error.message });
        }
        logger.error('Error creating risk position: ', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});