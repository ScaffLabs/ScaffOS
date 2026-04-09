import express from 'express';
import dotenv from 'dotenv';
import helmet from 'helmet';
import bodyParser from 'body-parser';
import config from './config';
import Database from './storage/Database';
import healthRouter from './routes/health';
import configRouter from './routes/config';
import errorHandler from './middleware/errorHandler';
import { ServiceError } from './errors/CustomErrors';

dotenv.config();
const app = express();
const db = new Database();

app.use(helmet());
app.use(bodyParser.json());
app.use('/api/health', healthRouter);
app.use('/api/config', configRouter);

app.use(errorHandler);

const startServer = async () => {
    try {
        await db.connect();
        const server = app.listen(config.port, () => {
            console.log(`Server running on http://localhost:${config.port}`);
        });

        const gracefulShutdown = (signal) => {
            console.log(`Received ${signal}. Shutting down gracefully...`);
            server.close(async () => {
                console.log('Closed out remaining connections.');
                await db.closeConnection();
                process.exit(0);
            });
        };

        process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
        process.on('SIGINT', () => gracefulShutdown('SIGINT'));
    } catch (error) {
        throw new ServiceError(`Failed to start server: ${error.message}`);
    }
};

startServer();