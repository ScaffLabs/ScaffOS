import express from 'express';
import { InMemoryStore } from './storage/InMemoryStore';
import { migrateData, seedData } from './storage/migrations';
import { Position } from './types';
import logger, { logRequest, logStartup, generateRequestId } from './utils/logger';
import errorHandler from './middleware/errorHandler';
import { registerShutdownHandlers, monitorMemoryUsage } from './utils/healthCheck';
import rateLimit from 'express-rate-limit';
import { validateInput, validatePositionId } from './middleware/inputValidation';

const app = express();
app.use(express.json());

const positionStore = new InMemoryStore<Position>();
migrateData(positionStore, seedData());

const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per windowMs
});
app.use(limiter);

app.use((req, res, next) => {
    const requestId = generateRequestId();
    const start = Date.now();
    res.on('finish', () => {
        const duration = Date.now() - start;
        logRequest(req.method, req.path, res.statusCode, duration, requestId);
    });
    next();
});

/**
 * @swagger
 * /api/positions:
 *   get:
 *     summary: Get all positions
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         description: Number of positions to return
 *       - in: query
 *         name: offset
 *         schema:
 *           type: integer
 *         description: Number of positions to skip
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *         description: Field to sort by
 *       - in: query
 *         name: order
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *         description: Sort order
 *     responses:
 *       200:
 *         description: A list of positions
 *       500:
 *         description: Internal server error
 */
app.get('/api/positions', async (req, res) => {
    const { limit = 10, offset = 0, sortBy = 'id', order = 'asc' } = req.query;
    try {
        const positions = await positionStore.findByIndex('symbol', 'AAPL'); // Example filtering
        res.status(200).json(positions);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching positions', error: error.message });
    }
});

/**
 * @swagger
 * /api/positions:
 *   post:
 *     summary: Create a new position
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               id:
 *                 type: string
 *               symbol:
 *                 type: string
 *               quantity:
 *                 type: integer
 *     responses:
 *       201:
 *         description: Position created successfully
 *       400:
 *         description: Invalid input
 *       500:
 *         description: Internal server error
 */
app.post('/api/positions', validateInput, async (req, res) => {
    const newPosition = req.body;
    try {
        const createdPosition = positionStore.create(newPosition);
        res.status(201).json({ message: 'Position created successfully', position: createdPosition });
    } catch (error) {
        res.status(400).json({ message: 'Invalid position data', error: error.message });
    }
});

/**
 * @swagger
 * /api/positions/{id}:
 *   put:
 *     summary: Update an existing position
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID of the position
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               quantity:
 *                 type: integer
 *     responses:
 *       204:
 *         description: Position updated successfully
 *       404:
 *         description: Position not found
 *       400:
 *         description: Invalid input
 */
app.put('/api/positions/:id', validatePositionId, validateInput, async (req, res) => {
    const { id } = req.params;
    const updateData = req.body;
    const updatedPosition = positionStore.update(id, updateData);
    if (updatedPosition) {
        res.status(204).send();
    } else {
        res.status(404).json({ message: 'Position not found' });
    }
});

/**
 * @swagger
 * /api/positions/{id}:
 *   delete:
 *     summary: Delete an existing position
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID of the position
 *         schema:
 *           type: string
 *     responses:
 *       204:
 *         description: Position deleted successfully
 *       404:
 *         description: Position not found
 */
app.delete('/api/positions/:id', validatePositionId, async (req, res) => {
    const { id } = req.params;
    const deleted = positionStore.delete(id);
    if (deleted) {
        res.status(204).send();
    } else {
        res.status(404).json({ message: 'Position not found' });
    }
});

app.use(errorHandler);

const PORT = process.env.PORT || 3000;
const server = app.listen(PORT, () => {
    logStartup({ port: PORT });
    console.log(`Server is running on port ${PORT}`);
});

registerShutdownHandlers(server);
setInterval(monitorMemoryUsage, 60000); // Log memory usage every minute

export default app;