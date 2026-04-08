import express from 'express';
import { json } from 'body-parser';
import { connectToEventBus } from './eventBus';
import portfolioRoutes from './routes/portfolioRoutes';

const app = express();
app.use(json());

connectToEventBus();

app.use('/api/portfolios', portfolioRoutes);

app.get('/health', async (req, res) => {
  try {
    // Check connectivity to dependent services
    const portfoliosResponse = await axios.get(process.env.PORTFOLIO_SERVICE_URL);
    res.json({ status: 'UP', portfolioService: portfoliosResponse.status === 200 });
  } catch (error) {
    res.status(503).json({ status: 'DOWN', error: error.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Portfolio Tracker service running on port ${PORT}`);
});