import express from 'express';
import dotenv from 'dotenv';
import helmet from 'helmet';
import bodyParser from 'body-parser';
import config from './config';
import Database from './storage/Database';
import healthRouter from './routes/health';
import configRouter from './routes/config';

dotenv.config();
const app = express();
const db = new Database();

app.use(helmet());
app.use(bodyParser.json());
app.use('/api/health', healthRouter);
app.use('/api/config', configRouter);

const startServer = async () => {
    await db.connect();
    app.listen(config.port, () => {
        console.log(`Server running on http://localhost:${config.port}`);
    });
};

startServer();