import { InMemoryStore } from '../storage/inMemoryStore';
import { Strategy } from '../types';
import { runMigrations } from '../storage/migrations';
import { ValidationError, NotFoundError } from '../errors/customErrors';

const strategyStore = new InMemoryStore<Strategy>();

export const initializeStore = async () => {
    await runMigrations(strategyStore);
};

export const createStrategy = async (strategy: Strategy) => {
    if (!strategy.name || !strategy.parameters) {
        throw new ValidationError('Strategy name and parameters are required.');
    }
    return await strategyStore.create(strategy);
};

export const getStrategy = async (id: string) => {
    return await strategyStore.read(id);
};

export const updateStrategy = async (id: string, strategy: Strategy) => {
    return await strategyStore.update(id, strategy);
};

export const deleteStrategy = async (id: string) => {
    return await strategyStore.delete(id);
};

export const findStrategies = async (query: Partial<Strategy>) => {
    return await strategyStore.find(query);
};

export const performTransaction = async (operations: Array<() => Promise<any>>) => {
    return await strategyStore.transaction(operations);
};
