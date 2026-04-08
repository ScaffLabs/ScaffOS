import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { healthCheckHandler } from './handlers/healthCheck';
import { dependentHealthCheckHandler } from './handlers/dependentHealthCheck';
import { auditLogger } from './middleware/auditLogger';
import { validateQueryParams } from './middleware/inputValidator';
import { validateStrategy } from './middleware/strategyValidator';

const app = express();

// CORS configuration
app.use(cors({
    origin: ['https://your-allowed-origin.com'], // specify allowed origins
    methods: ['GET', 'POST'],
}));

// Security middleware
app.use(helmet());

// Rate limiting middleware
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
});
app.use(limiter);

app.use(express.json());
app.use(auditLogger);

// Health check endpoints
app.get('/api/health', healthCheckHandler);
app.get('/api/dependent-health', dependentHealthCheckHandler);

// Example strategy route using validation
app.post('/api/strategies', validateStrategy, async (req, res) => {
    // Your strategy creation logic here
    res.status(201).json({ message: 'Strategy created successfully.' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});