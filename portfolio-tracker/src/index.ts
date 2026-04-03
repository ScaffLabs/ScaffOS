import express from 'express';
import { json } from 'body-parser';
import { connectToEventBus } from './eventBus';
import portfolioRoutes from './routes/portfolioRoutes';

const app = express();
app.use(json());

connectToEventBus();

app.use('/api/portfolios', portfolioRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Portfolio Tracker service running on port ${PORT}`);
});