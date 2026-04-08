import { LatencyData } from './types';
import { ValidationError } from './errorClasses';

const latencyRecords: LatencyData[] = [];

export const recordLatency = (data: LatencyData) => {
    if (!data || !data.path || typeof data.duration !== 'number') {
        throw new ValidationError('Invalid latency data');
    }
    if (data.duration < 0) {
        throw new ValidationError('Latency duration cannot be negative.');
    }
    latencyRecords.push(data);
};