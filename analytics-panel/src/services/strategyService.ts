import { InMemoryStore } from '../storage/inMemoryStore';
import { Strategy, PerformanceMetrics } from '../types';
import { ValidationError, NotFoundError } from '../errors/customErrors';

const strategyStore = new InMemoryStore<Strategy>();

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
    return await strategyStore.create(strategy);
};

const getPerformanceMetrics = async (): Promise<PerformanceMetrics> => {
    const strategies = await strategyStore.find({});
    if (strategies.length === 0) {
        throw new ValidationError('No strategies available for performance metrics calculation.');
    }
    return calculatePerformanceMetrics(strategies.map(s => s.data));
};

const getStrategy = async (id: string) => {
    const strategy = await strategyStore.read(id);
    if (!strategy) throw new NotFoundError('Strategy not found.');
    return strategy;
};

const updateStrategy = async (id: string, strategy: Strategy) => {
    const existingStrategy = await getStrategy(id);
    const updated = { ...existingStrategy.data, ...strategy };
    return await strategyStore.update(id, updated);
};

const deleteStrategy = async (id: string) => {
    const deleted = await strategyStore.delete(id);
    if (!deleted) throw new NotFoundError('Strategy not found.');
    return deleted;
};

const findStrategies = async (query: Partial<Strategy>) => {
    return await strategyStore.find(query);
};

const initializeStore = async () => {
    console.log('Initializing strategy store...');
};

export { createStrategy, getStrategy, updateStrategy, deleteStrategy, findStrategies, getPerformanceMetrics, initializeStore };