import express from 'express';
import { backtestRouter } from './routes/backtest';
import { errorHandler } from './middleware/errorHandler';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use('/api/backtest', backtestRouter);
app.use(errorHandler);

const server = app.listen(PORT, () => {
  console.log(`Backtester service running on port ${PORT}`);
});

const shutdown = () => {
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
};

process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);