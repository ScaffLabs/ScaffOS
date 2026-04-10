import express from 'express';
import os from 'os';
import { logger } from '../middleware/logger';
import { fetchHealthStatus } from '../services/ServiceClient';
import { ServiceError } from '../errors/CustomErrors';

const router = express.Router();

router.get('/', async (req, res) => {
    try {
        const status = await fetchHealthStatus();
        res.status(200).json({
            application: 'running',
            database: status.database,
            externalService: status.externalService,
            memoryUsage: process.memoryUsage(),
            uptime: os.uptime(),
            freeMemory: os.freemem(),
            totalMemory: os.totalmem(),
            loadAvg: os.loadavg(),
            cpuCount: os.cpus().length
        });
    } catch (error) {
        logger.error(`Health check failed: ${error.message}`);
        res.status(500).json({ error: 'Health check failed: ' + error.message });
    }
});

export default router;