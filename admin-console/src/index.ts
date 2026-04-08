import express from 'express';
import dotenv from 'dotenv';
import healthRouter from './routes/health';
import config from './config';

dotenv.config();
const app = express();
app.use(express.json());

app.use('/api/health', healthRouter);

app.listen(config.port, () => {
    console.log(`Server running on http://localhost:${config.port}`);
});
