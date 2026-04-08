import express from 'express';
import { createServer } from 'http';
import InMemoryStore from './dataStore';
import { seedData } from './seedData';
import { healthCheck } from './healthCheck';
import errorMiddleware from './errorMiddleware';
import { logRequest, logStartup } from './logger';
import config from './config';

const app = express();
const PORT = config.PORT;
const store = new InMemoryStore<{ value: number }>();

// Seed initial data
seedData(store);

app.use(logRequest);
app.get('/health', healthCheck);
app.use(errorMiddleware);

app.listen(PORT, () => {
    logStartup();
    console.log(`Monitoring service running on port ${PORT}`);
});