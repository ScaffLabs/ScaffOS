import { InMemoryStore } from '../storage/inMemoryStore';
import { Strategy } from '../types';
import { ValidationError } from '../errors/customErrors';

const strategyStore = new InMemoryStore<Strategy>();

const seedData: Strategy[] = [
    { name: 'Strategy A', parameters: { param1: 'value1' } },
    { name: 'Strategy B', parameters: { param1: 'value2' } },
];

const initializeStore = async () => {
    for (const data of seedData) {
        await strategyStore.create(data);
    }
};

const createStrategy = async (strategy: Strategy) => {
    if (!strategy.name || !strategy.parameters) {
        throw new ValidationError('Strategy name and parameters are required.');
    }
    return await strategyStore.create(strategy);
};

const getStrategy = async (id: string) => {
    return await strategyStore.read(id);
};

const updateStrategy = async (id: string, strategy: Strategy) => {
    return await strategyStore.update(id, strategy);
};

const deleteStrategy = async (id: string) => {
    return await strategyStore.delete(id);
};

const findStrategies = async (query: Partial<Strategy>) => {
    return await strategyStore.find(query);
};

export { initializeStore, createStrategy, getStrategy, updateStrategy, deleteStrategy, findStrategies };