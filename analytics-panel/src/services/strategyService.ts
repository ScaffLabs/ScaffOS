import { InMemoryStore } from '../storage/inMemoryStore';
import { Strategy } from '../types';
import { ValidationError } from '../errors/customErrors';

const strategyStore = new InMemoryStore<Strategy>();

export const createStrategy = async (strategy: Strategy) => {
    if (!strategy.name || !strategy.parameters) {
        throw new ValidationError('Strategy name and parameters are required.');
    }
    return await strategyStore.create(strategy);
};

export const getStrategy = async (id: string) => {
    const strategy = await strategyStore.read(id);
    if (!strategy) {
        throw new ValidationError('Strategy not found.');
    }
    return strategy;
};

export const updateStrategy = async (id: string, strategy: Strategy) => {
    const existingStrategy = await strategyStore.read(id);
    if (!existingStrategy) {
        throw new ValidationError('Strategy not found.');
    }
    return await strategyStore.update(id, strategy);
};

export const deleteStrategy = async (id: string) => {
    const deleted = await strategyStore.delete(id);
    if (!deleted) {
        throw new ValidationError('Strategy not found.');
    }
    return;
};

export const findStrategies = async (query: Partial<Strategy>) => {
    return await strategyStore.find(query);
};

export const performTransaction = async (operations: Array<() => Promise<any>>) => {
    return await strategyStore.transaction(operations);
};

export const initializeStore = async () => {
    // Optional: Run migrations or seed data here if needed.
};

export default strategyStore;