import express from 'express';
import { fetchHealthStatus } from '../services/ServiceClient';

const router = express.Router();

router.get('/', async (req, res) => {
    try {
        const healthStatus = await fetchHealthStatus();
        res.status(200).json(healthStatus);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch health status' });
    }
});

export default router;
