import express from 'express';
import { backtestRouter } from './routes/backtest';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use('/api/backtest', backtestRouter);

app.listen(PORT, () => {
  console.log(`Backtester service running on port ${PORT}`);
});