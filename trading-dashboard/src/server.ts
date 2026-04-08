import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import bodyParser from 'body-parser';
import { fetchPositions, createPosition, updatePosition, deletePosition } from './api/portfolioApi';
import { validateInput } from './middleware/inputValidation';
import errorHandler from './middleware/errorHandler';
import logger from './utils/logger';

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(helmet());
app.use(cors());
app.use(bodyParser.json({ limit: '1mb' }));
app.use(rateLimit({ windowMs: 15 * 60 * 1000, max: 100 }));

// Routes
app.get('/api/positions', async (req, res) => {
    const { limit = 10, offset = 0, sortBy = 'id', order = 'asc' } = req.query;
    try {
        const positions = await fetchPositions(Number(limit), Number(offset), sortBy, order);
        res.json(positions);
    } catch (error) {
        logger.error(error);
        res.status(500).json({ message: 'Error fetching positions' });
    }
});

app.post('/api/positions', async (req, res) => {
    try {
        await createPosition(req.body);
        res.status(201).json({ message: 'Position created successfully' });
    } catch (error) {
        logger.error(error);
        res.status(500).json({ message: 'Error creating position' });
    }
});

app.put('/api/positions/:id', validateInput, async (req, res) => {
    const { id } = req.params;
    const { quantity } = req.body;
    try {
        await updatePosition(id, quantity);
        res.status(204).send();
    } catch (error) {
        logger.error(error);
        res.status(500).json({ message: 'Error updating position' });
    }
});

app.delete('/api/positions/:id', async (req, res) => {
    const { id } = req.params;
    try {
        await deletePosition(id);
        res.status(204).send();
    } catch (error) {
        logger.error(error);
        res.status(500).json({ message: 'Error deleting position' });
    }
});

// Error handling middleware
app.use(errorHandler);

app.listen(PORT, () => {
    logger.info(`Server is running on port ${PORT}`);
});
