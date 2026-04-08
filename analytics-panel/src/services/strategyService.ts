import { InMemoryStore } from '../storage/inMemoryStore';
import { Strategy } from '../types';
import { ValidationError, NotFoundError } from '../errors/customErrors';

const strategyStore = new InMemoryStore<Strategy>();

const initializeStore = async () => {
    // Seed strategies if needed
    const seedData: Strategy[] = [
        { name: 'Strategy A', parameters: { param1: 'value1' } },
        { name: 'Strategy B', parameters: { param1: 'value2' } },
    ];
    for (const strategy of seedData) {
        await createStrategy(strategy);
    }
};

const createStrategy = async (strategy: Strategy) => {
    if (!strategy.name || !strategy.parameters) {
        throw new ValidationError('Strategy name and parameters are required.');
    }
    return await strategyStore.create(strategy);
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

const performTransaction = async (operations: Array<() => Promise<any>>) => {
    return await strategyStore.transaction(operations);
};

export { initializeStore, createStrategy, getStrategy, updateStrategy, deleteStrategy, findStrategies, performTransaction };