import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import bodyParser from 'body-parser';
import { fetchPositions, updatePosition, deletePosition } from './api/portfolioApi';
import { validateInput } from './middleware/inputValidation';

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(helmet());
app.use(cors({ origin: ['https://yourdomain.com', 'https://anotherdomain.com'] }));
app.use(bodyParser.json({ limit: '1mb' })); // Limit request size
app.use(rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100 // limit each IP to 100 requests per windowMs
}));

// Routes
app.get('/api/positions', async (req, res) => {
    try {
        const positions = await fetchPositions();
        res.json(positions);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching positions' });
    }
});

app.put('/api/positions/:id', validateInput, async (req, res) => {
    const { id } = req.params;
    const { quantity } = req.body;
    try {
        await updatePosition(id, quantity);
        res.status(204).send();
    } catch (error) {
        res.status(500).json({ message: 'Error updating position' });
    }
});

app.delete('/api/positions/:id', async (req, res) => {
    const { id } = req.params;
    try {
        await deletePosition(id);
        res.status(204).send();
    } catch (error) {
        res.status(500).json({ message: 'Error deleting position' });
    }
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});