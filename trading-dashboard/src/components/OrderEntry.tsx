import React, { useState } from 'react';
import { submitOrder } from '../api/orderApi';
import { publishEvent } from '../utils/eventBus';
import { Order, OrderSchema } from '../types';

const OrderEntry: React.FC = () => {
    const [orderDetails, setOrderDetails] = useState<Order>({ id: '' as OrderId, symbol: '', quantity: 0, type: 'buy' });
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const validationResult = OrderSchema.safeParse(orderDetails);
        if (!validationResult.success) {
            alert('Invalid order details!');
            return;
        }
        try {
            await submitOrder(validationResult.data);
            publishEvent('ORDER_SUBMITTED', validationResult.data);
        } catch (err) {
            setError('Failed to submit order: ' + (err instanceof Error ? err.message : 'Unknown error'));
        }
    };

    return (
        <form onSubmit={handleSubmit}>
            <input type='text' placeholder='Symbol' onChange={(e) => setOrderDetails({ ...orderDetails, symbol: e.target.value })} />
            <input type='number' placeholder='Quantity' onChange={(e) => setOrderDetails({ ...orderDetails, quantity: +e.target.value })} />
            <button type='submit'>Place Order</button>
            {error && <div style={{ color: 'red' }}>{error}</div>}
        </form>
    );
};

export default OrderEntry;