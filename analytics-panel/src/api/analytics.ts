import axios from 'axios';
import { EventEmitter } from 'events';

const eventBus = new EventEmitter();

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:3000';

export const fetchPerformanceMetrics = async () => {
    try {
        const response = await axios.get(`${API_BASE_URL}/api/performance`);
        return response.data;
    } catch (error) {
        console.error('Failed to fetch performance metrics:', error);
        throw new Error('Failed to fetch performance metrics');
    }
};

export const fetchComparisonData = async (strategyA: string, strategyB: string) => {
    try {
        const response = await axios.get(`${API_BASE_URL}/api/compare`, { params: { strategyA, strategyB } });
        return response.data;
    } catch (error) {
        console.error('Failed to fetch comparison data:', error);
        throw new Error('Failed to fetch comparison data');
    }
};

export const emitEvent = (eventName: string, data: any) => {
    eventBus.emit(eventName, data);
};

export const subscribeToEvent = (eventName: string, listener: (data: any) => void) => {
    eventBus.on(eventName, listener);
};

export const healthCheck = async () => {
    try {
        const response = await axios.get(`${API_BASE_URL}/api/health`);
        return response.data;
    } catch (error) {
        console.error('Health check failed:', error);
        throw new Error('Health check failed');
    }
};

export const getStrategies = async () => {
    try {
        const response = await axios.get(`${API_BASE_URL}/api/strategies`);
        return response.data;
    } catch (error) {
        console.error('Failed to fetch strategies:', error);
        throw new Error('Failed to fetch strategies');
    }
};
