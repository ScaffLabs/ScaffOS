import { DatabaseService, InMemoryStore } from '../storage/database';
import { Strategy, PerformanceMetrics } from '../types';
import { ValidationError, NotFoundError } from '../errors/customErrors';

const strategyService = new DatabaseService(new InMemoryStore<Strategy>());

const calculatePerformanceMetrics = (strategies: Strategy[]): PerformanceMetrics => {
    const drawdown = strategies.map(strategy => Math.random() * 100);
    const maxDrawdown = Math.max(...drawdown);
    const sharpeRatio = (Math.random() * 2) - 1;
    return { drawdown, maxDrawdown, sharpeRatio };
};

const createStrategy = async (strategy: Strategy) => {
    if (!strategy.name || !strategy.parameters) {
        throw new ValidationError('Strategy name and parameters are required.');
    }
    return await strategyService.create(strategy);
};

const getPerformanceMetrics = async (): Promise<PerformanceMetrics> => {
    const strategies = await strategyService.find({});
    if (strategies.length === 0) {
        throw new ValidationError('No strategies available for performance metrics calculation.');
    }
    return calculatePerformanceMetrics(strategies.map(s => s.data));
};

const getStrategy = async (id: string) => {
    const strategy = await strategyService.read(id);
    if (!strategy) throw new NotFoundError('Strategy not found.');
    return strategy;
};

const updateStrategy = async (id: string, strategy: Strategy) => {
    const existingStrategy = await getStrategy(id);
    const updated = { ...existingStrategy.data, ...strategy };
    return await strategyService.update(id, updated);
};

const deleteStrategy = async (id: string) => {
    const deleted = await strategyService.delete(id);
    if (!deleted) throw new NotFoundError('Strategy not found.');
    return deleted;
};

const findStrategies = async (query: Partial<Strategy>) => {
    return await strategyService.find(query);
};

const initializeStore = async () => {
    console.log('Initializing strategy store...');
};

export { createStrategy, getStrategy, updateStrategy, deleteStrategy, findStrategies, getPerformanceMetrics, initializeStore };