import axios from 'axios';
import { publishEvent } from '../utils/eventBus';
import config from '../config';
import { Order } from '../types';
import { retry, circuitBreaker } from '../utils/retry';

const BASE_URL = `${config.API_URL}/orders`;

const submitOrderRequest = async (order: Order) => {
    const response = await axios.post(BASE_URL, order);
    return response.data;
};

export const submitOrder = circuitBreaker(retry(async (order: Order) => {
    const result = await submitOrderRequest(order);
    publishEvent('ORDER_SUBMITTED', { type: 'ORDER_SUBMITTED', order: result });
    return result;
}));