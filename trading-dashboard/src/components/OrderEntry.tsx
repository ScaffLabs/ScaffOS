import React, { useState } from 'react';
import { submitOrder } from '../api/orderApi';
import { publishEvent } from '../utils/eventBus';
import { Order, OrderSchema } from '../types';

const OrderEntry: React.FC = () => {
    const [orderDetails, setOrderDetails] = useState<Order>({ id: '' as OrderId, symbol: '', quantity: 0, type: 'buy' });
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const validationResult = OrderSchema.safeParse(orderDetails);
        if (!validationResult.success) {
            setError('Invalid order details!');
            return;
        }
        try {
            await submitOrder(validationResult.data);
            publishEvent('ORDER_SUBMITTED', validationResult.data);
            setSuccess('Order submitted successfully!');
            setError(null);
            setOrderDetails({ id: '' as OrderId, symbol: '', quantity: 0, type: 'buy' }); // Reset form
        } catch (err) {
            setError('Failed to submit order: ' + (err instanceof Error ? err.message : 'Unknown error'));
            setSuccess(null);
        }
    };

    return (
        <form onSubmit={handleSubmit}>
            <input type='text' placeholder='Symbol' value={orderDetails.symbol} onChange={(e) => setOrderDetails({ ...orderDetails, symbol: e.target.value })} required />
            <input type='number' placeholder='Quantity' value={orderDetails.quantity} onChange={(e) => setOrderDetails({ ...orderDetails, quantity: +e.target.value })} required />
            <select value={orderDetails.type} onChange={(e) => setOrderDetails({ ...orderDetails, type: e.target.value })} required>
                <option value='buy'>Buy</option>
                <option value='sell'>Sell</option>
            </select>
            <button type='submit'>Place Order</button>
            {error && <div style={{ color: 'red' }}>{error}</div>}
            {success && <div style={{ color: 'green' }}>{success}</div>}
        </form>
    );
};

export default OrderEntry;