import axios from 'axios';
import { publishEvent } from '../utils/eventBus';
import config from '../config';
import { Order, OrderSchema } from '../types';
import { ServiceError } from '../utils/errors';
import { retry, circuitBreaker } from '../utils/retry';

const BASE_URL = `${config.API_URL}/orders`;

const submitOrderRequest = async (order: Order) => {
    const response = await axios.post(BASE_URL, order);
    return response.data;
};

const submitOrderWithRetry = async (order: Order) => {
    const validationResult = OrderSchema.safeParse(order);
    if (!validationResult.success) {
        throw new ServiceError('Invalid order details');
    }
    return await submitOrderRequest(validationResult.data);
};

export const submitOrder = circuitBreaker(retry(submitOrderWithRetry));

export const notifyOrderSubmitted = (order: Order) => {
    publishEvent('ORDER_SUBMITTED', { type: 'ORDER_SUBMITTED', order });
};
