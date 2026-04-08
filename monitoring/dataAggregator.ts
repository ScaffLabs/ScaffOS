import InMemoryStore from './dataStore';
import { LatencyData } from './types';
import { ServiceError } from './errorClasses';

const store = new InMemoryStore<LatencyData>();

export const aggregateLatencyData = async () => {
    const records = store.storage.values();
    const aggregatedData = Array.from(records).map(record => record.data);
    if (!aggregatedData.length) {
        throw new ServiceError('No latency data available for aggregation.');
    }
    return aggregatedData;
};

export const addLatencyRecord = (data: LatencyData) => {
    store.create(data, data.timestamp.toISOString());
};

export const getAggregatedData = async () => {
    return await aggregateLatencyData();
};

export const clearLatencyRecords = () => {
    store.storage.clear();
};