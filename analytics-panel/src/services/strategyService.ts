// Import necessary modules
import { InMemoryStore } from '../storage/inMemoryStore';
import { Strategy } from '../types';
import { ValidationError, NotFoundError } from '../errors/customErrors';
import { logPerformance } from '../logger';

const strategyStore = new InMemoryStore<Strategy>();

const createStrategy = async (strategy: Strategy) => {
    const start = Date.now();
    if (!strategy.name || !strategy.parameters) {
        throw new ValidationError('Strategy name and parameters are required.');
    }
    const result = await strategyStore.create(strategy);
    logPerformance('Create Strategy', Date.now() - start);
    return result;
};

const getStrategy = async (id: string) => {
    const start = Date.now();
    const strategy = await strategyStore.read(id);
    if (!strategy) throw new NotFoundError('Strategy not found.');
    logPerformance('Get Strategy', Date.now() - start);
    return strategy;
};

const updateStrategy = async (id: string, strategy: Strategy) => {
    const start = Date.now();
    const existingStrategy = await getStrategy(id);
    const updated = { ...existingStrategy.data, ...strategy };
    const result = await strategyStore.update(id, updated);
    logPerformance('Update Strategy', Date.now() - start);
    return result;
};

const deleteStrategy = async (id: string) => {
    const start = Date.now();
    const deleted = await strategyStore.delete(id);
    if (!deleted) throw new NotFoundError('Strategy not found.');
    logPerformance('Delete Strategy', Date.now() - start);
    return deleted;
};

const findStrategies = async (query: Partial<Strategy>) => {
    const start = Date.now();
    const results = await strategyStore.find(query);
    logPerformance('Find Strategies', Date.now() - start);
    return results;
};

export { createStrategy, getStrategy, updateStrategy, deleteStrategy, findStrategies };