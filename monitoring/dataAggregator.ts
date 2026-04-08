import InMemoryStore from './dataStore';
import { LatencyData } from './types';
import { ServiceError } from './errorClasses';

const store = new InMemoryStore<LatencyData>();

export const addLatencyRecord = (data: LatencyData) => {
    if (!data || !data.path || typeof data.duration !== 'number' || data.duration < 0) {
        throw new ValidationError('Invalid latency data');
    }
    store.create(data, data.timestamp.toISOString());
};

export const aggregateLatencyData = async () => {
    const records = Array.from(store.storage.values()).map(record => record.data);
    if (records.length === 0) {
        throw new ServiceError('No latency data available for aggregation.');
    }

    const totalDuration = records.reduce((acc, record) => acc + record.duration, 0);
    const avgLatency = totalDuration / records.length;
    return { total: totalDuration, average: avgLatency, count: records.length };
};

export const getAggregatedData = async () => {
    return await aggregateLatencyData();
};

export const clearLatencyRecords = () => {
    store.storage.clear();
};