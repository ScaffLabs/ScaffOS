import { fetchData, postData } from './axiosClient';
import { OrderEvent } from './types';
import { emitWithRetry } from './eventBus';

const ORDER_SERVICE_URL = process.env.ORDER_SERVICE_URL;

export const createOrderService = async (order: any) => {
    try {
        const response = await postData(`${ORDER_SERVICE_URL}/orders`, order);
        await emitWithRetry({ type: 'ORDER_CREATED', payload: response.data });
        return response.data;
    } catch (error) {
        console.error('Error creating order:', error);
        throw new Error('Service Unavailable');
    }
};

export const getOrdersService = async () => {
    try {
        const response = await fetchData(`${ORDER_SERVICE_URL}/orders`);
        return response.data;
    } catch (error) {
        console.error('Error fetching orders:', error);
        throw new Error('Service Unavailable');
    }
};

export const updateOrderService = async (id: string, updates: any) => {
    try {
        const response = await postData(`${ORDER_SERVICE_URL}/orders/${id}`, updates);
        await emitWithRetry({ type: 'ORDER_UPDATED', payload: response.data });
        return response.data;
    } catch (error) {
        console.error('Error updating order:', error);
        throw new Error('Service Unavailable');
    }
};

export const deleteOrderService = async (id: string) => {
    try {
        await postData(`${ORDER_SERVICE_URL}/orders/${id}`);
        await emitWithRetry({ type: 'ORDER_DELETED', payload: { id } });
    } catch (error) {
        console.error('Error deleting order:', error);
        throw new Error('Service Unavailable');
    }
};
