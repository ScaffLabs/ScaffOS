import { LatencyData } from './types';

const latencyRecords: LatencyData[] = [];

export const recordLatency = (data: LatencyData) => {
    latencyRecords.push(data);
};