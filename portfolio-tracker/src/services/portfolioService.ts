import storage from './storage';
import { Portfolio, PortfolioUpdate, HealthCheckResponse } from '../types';
import { publishPortfolioUpdate } from '../eventBus';
import CircuitBreaker from 'circuit-breaker-js';

const circuitBreaker = new CircuitBreaker({
    timeout: 3000,
    errorsThreshold: 2,
    resetTimeout: 10000
});

export const createPortfolio = async (data: Omit<Portfolio, 'id'>): Promise<Portfolio> => {
    if (!data.name || !Array.isArray(data.positions)) {
        throw new Error('Invalid portfolio data');
    }
    const newPortfolio = storage.create(data);
    await publishPortfolioUpdate(newPortfolio);
    return newPortfolio;
};

export const getPortfolio = async (id: string): Promise<Portfolio> => {
    const portfolio = storage.read(id);
    if (!portfolio) throw new Error('Portfolio not found');
    return portfolio;
};

export const updatePortfolio = async (id: string, data: PortfolioUpdate): Promise<Portfolio> => {
    const portfolio = storage.update(id, data);
    if (!portfolio) throw new Error('Portfolio not found');
    await publishPortfolioUpdate(portfolio);
    return portfolio;
};

export const fetchPortfolios = async (): Promise<Portfolio[]> => {
    return storage.getAll();
};

export const clearPortfolios = () => {
    storage.clear();
};

export const healthCheckPortfolioService = async (): Promise<boolean> => {
    // Simulating health check logic
    return true;
};

export const healthCheckAllServices = async (): Promise<HealthCheckResponse> => {
    const portfolioServiceStatus = await healthCheckPortfolioService();
    return {
        status: 'UP',
        portfolioService: portfolioServiceStatus
    };
};

export const healthCheck = async (req: Request, res: Response) => {
    try {
        const healthStatus = await healthCheckAllServices();
        res.json(healthStatus);
    } catch (error) {
        res.status(503).json({ status: 'DOWN', error: error.message });
    }
};