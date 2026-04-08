import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import bodyParser from 'body-parser';
import { fetchPositions, updatePosition, deletePosition } from './api/portfolioApi';
import { validateInput } from './middleware/inputValidation';
import errorHandler from './middleware/errorHandler';
import { createServer } from 'http';

const app = express();
const PORT = process.env.PORT || 3000;
const server = createServer(app);

// Middleware
app.use(helmet());
app.use(cors());
app.use(bodyParser.json());
app.use(rateLimit({ windowMs: 15 * 60 * 1000, max: 100 }));

// Routes
app.get('/api/positions', async (req, res) => {
    const positions = await fetchPositions();
    res.json(positions);
});

app.put('/api/positions/:id', validateInput, async (req, res) => {
    const { id } = req.params;
    const { quantity } = req.body;
    await updatePosition(id, quantity);
    res.status(204).send();
});

app.delete('/api/positions/:id', async (req, res) => {
    const { id } = req.params;
    await deletePosition(id);
    res.status(204).send();
});

// Error handling middleware
app.use(errorHandler);

server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});