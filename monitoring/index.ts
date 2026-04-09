import express from 'express';
import { createServer } from 'http';
import { healthCheck } from './healthCheck';
import errorMiddleware from './errorMiddleware';
import { logRequest, logStartup } from './logger';
import helmet from 'helmet';
import cors from 'cors';
import config from './config';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(helmet());
app.use(express.json());
app.use(logRequest);

app.get('/health', healthCheck);
app.use(errorMiddleware);

const server = createServer(app);

server.listen(PORT, () => {
    logStartup();
    console.log(`Monitoring service running on port ${PORT}`);
});

// Middleware to generate request IDs
app.use((req, res, next) => {
    req.headers['x-request-id'] = req.headers['x-request-id'] || require('crypto').randomBytes(16).toString('hex');
    next();
});