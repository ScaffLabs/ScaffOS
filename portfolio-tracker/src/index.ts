import express from 'express';
import { json } from 'body-parser';
import { connectToEventBus } from './eventBus';
import portfolioRoutes from './routes/portfolioRoutes';
import { healthCheckPortfolioService } from './services/portfolioService';

const app = express();
app.use(json());

connectToEventBus();

app.use('/api/portfolios', portfolioRoutes);

app.get('/health', async (req, res) => {
    try {
        const portfolioServiceStatus = await healthCheckPortfolioService();
        res.json({ status: 'UP', portfolioService: portfolioServiceStatus });
    } catch (error) {
        res.status(503).json({ status: 'DOWN', error: error.message });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Portfolio Tracker service running on port ${PORT}`);
});