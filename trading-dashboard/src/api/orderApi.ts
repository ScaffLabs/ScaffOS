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

/**
 * Submits a new order after validating it.
 * @param order - The order to be submitted.
 * @returns The submitted order data.
 * @throws Will throw a ServiceError if the order is invalid or submission fails.
 */
export const submitOrder = circuitBreaker(retry(async (order: Order) => {
    // Validate order
    const validationResult = OrderSchema.safeParse(order);
    if (!validationResult.success) {
        throw new ServiceError('Invalid order details');
    }
    // Submit order
    const result = await submitOrderRequest(validationResult.data);
    publishEvent('ORDER_SUBMITTED', { type: 'ORDER_SUBMITTED', order: result });
    return result;
}));
