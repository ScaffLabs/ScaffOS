import express from 'express';
import axios from 'axios';
import config from './config';
import logger from './logger';

const router = express.Router();

// Function to check the health of a service by making an HTTP GET request.
const checkServiceHealth = async (serviceName: string, url: string) => {
    try {
        // Attempt to reach the specified service URL.
        await axios.get(url);
        return { service: serviceName, status: 'healthy' };
    } catch (error) {
        // If the request fails, log the error and return unhealthy status.
        logger.error(`Health check failed for ${serviceName}`, { error: error.message });
        return { service: serviceName, status: 'unhealthy' };
    }
};

// Health check endpoint that returns the status of the service.
router.get('/health', async (req, res) => {
    // Check the health of dependent services.
    const userServiceHealth = await checkServiceHealth('User Service', `${config.USER_SERVICE_URL}/health`);
    const otherServiceHealth = await checkServiceHealth('Other Service', `${config.OTHER_SERVICE_URL}/health`);
    // Respond with the aggregated health status.
    res.status(200).json({ services: [userServiceHealth, otherServiceHealth] });
});

export default router;