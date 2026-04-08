import express from 'express';
import { fetchHealthStatus } from '../services/ServiceClient';
import axios from 'axios';

const router = express.Router();

const checkServiceHealth = async (serviceUrl: string) => {
    try {
        const response = await axios.get(serviceUrl);
        return response.status === 200;
    } catch (error) {
        return false;
    }
};

router.get('/', async (req, res) => {
    try {
        const healthStatus = await fetchHealthStatus();
        const dbHealth = await checkServiceHealth(process.env.DATABASE_URL);
        const status = {
            serviceHealth: healthStatus,
            database: dbHealth ? 'up' : 'down',
        };
        res.status(200).json(status);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch health status' });
    }
});

export default router;