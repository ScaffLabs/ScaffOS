import express from 'express';
import { createServer } from 'http';
import InMemoryStore from './dataStore';
import { seedData } from './seedData';
import { healthCheck } from './healthCheck';
import errorMiddleware from './errorMiddleware';

const app = express();
const PORT = 3000;
const store = new InMemoryStore<{ value: number }>();

// Seed initial data
seedData(store);

app.get('/health', healthCheck);
app.use(errorMiddleware);

app.listen(PORT, () => {
    console.log(`Monitoring service running on port ${PORT}`);
});