import { InMemoryStore } from './inMemoryStore';
import { Strategy } from '../types';
import { runMigrations } from './migrations';

const strategyStore = new InMemoryStore<Strategy>();

export const createStrategy = async (strategy: Strategy) => {
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

export const initializeStore = async () => {
    await runMigrations(strategyStore);
};

export default strategyStore;
