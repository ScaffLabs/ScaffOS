import express from 'express';
import dotenv from 'dotenv';
import helmet from 'helmet';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import healthRouter from './routes/health';
import config from './config';
import { logRequest, logError } from './middleware/logger';
import { logAudit } from './middleware/auditLogger';
import bodyParser from 'body-parser';

dotenv.config();
const app = express();

// Security middleware
app.use(helmet());
app.use(cors({ origin: ['https://your-allowed-origin.com'], credentials: true }));

// Rate limiting middleware
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    message: 'Too many requests, please try again later.',
});
app.use(limiter);

app.use(bodyParser.json());
app.use((req, res, next) => {
    req.headers['x-request-id'] = Math.random().toString(36).substring(7);
    next();
});
app.use(logRequest);
app.use(logAudit);
app.use('/api/health', healthRouter);

// Error handling middleware
app.use(logError);

app.listen(config.port, () => {
    console.log(`Server running on http://localhost:${config.port}`);
});