import express from 'express';
import { createServer } from 'http';
import { healthCheck } from './healthCheck';
import errorMiddleware from './errorMiddleware';
import { createConnectionPool } from './connectionPool';
import { logRequest, logStartup } from './logger';
import helmet from 'helmet';
import cors from 'cors';
import config from './config';

const app = express();
const PORT = process.env.PORT || 3000;
const connectionPool = createConnectionPool();

app.use(cors());
app.use(helmet());
app.use(express.json());
app.use(logRequest); // Add logging middleware

app.get('/health', healthCheck);

app.use(errorMiddleware);

const server = createServer(app);

server.listen(PORT, () => {
    logStartup();
    console.log(`Monitoring service running on port ${PORT}`);
});