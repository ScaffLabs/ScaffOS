import { fetchData, postData } from './axiosClient';
import { Order, OrderSchema } from './types';
import { emitWithRetry } from './eventBus';
import { ServiceError } from './errors';

const ORDER_SERVICE_URL = process.env.ORDER_SERVICE_URL;

export const createOrderService = async (orderData: unknown) => {
    const parsedOrder = OrderSchema.safeParse(orderData);
    if (!parsedOrder.success) {
        throw new ServiceError('Invalid order data.');
    }
    const order = parsedOrder.data;
    try {
        const response = await postData(`${ORDER_SERVICE_URL}/orders`, order);
        await emitWithRetry({ type: 'ORDER_CREATED', payload: response.data });
        return response.data;
    } catch (error) {
        console.error('Error creating order:', error);
        throw new ServiceError('Could not create order. Please try again later.');
    }
};

export const getOrdersService = async () => {
    try {
        const response = await fetchData(`${ORDER_SERVICE_URL}/orders`);
        if (!response.data || response.data.length === 0) {
            throw new ServiceError('No orders available.');
        }
        return response.data;
    } catch (error) {
        console.error('Error fetching orders:', error);
        throw new ServiceError('Could not fetch orders. Please try again later.');
    }
};

export const updateOrderService = async (id: string, updates: unknown) => {
    const parsedUpdates = OrderSchema.partial().safeParse(updates);
    if (!parsedUpdates.success) {
        throw new ServiceError('Invalid order update data.');
    }
    try {
        const response = await postData(`${ORDER_SERVICE_URL}/orders/${id}`, parsedUpdates.data);
        await emitWithRetry({ type: 'ORDER_UPDATED', payload: response.data });
        return response.data;
    } catch (error) {
        console.error('Error updating order:', error);
        throw new ServiceError('Could not update order. Please try again later.');
    }
};

export const deleteOrderService = async (id: string) => {
    try {
        await postData(`${ORDER_SERVICE_URL}/orders/${id}`, {});
        await emitWithRetry({ type: 'ORDER_DELETED', payload: { id } });
    } catch (error) {
        console.error('Error deleting order:', error);
        throw new ServiceError('Could not delete order. Please try again later.');
    }
};