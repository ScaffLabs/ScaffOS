import React, { useState } from 'react';
import { submitOrder } from '../api/orderApi';

const OrderEntry: React.FC = () => {
    const [orderDetails, setOrderDetails] = useState({ symbol: '', quantity: 0, type: 'buy' });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        await submitOrder(orderDetails);
        // handle success or error
    };

    return (
        <form onSubmit={handleSubmit}>
            <input type='text' placeholder='Symbol' onChange={(e) => setOrderDetails({ ...orderDetails, symbol: e.target.value })} />
            <input type='number' placeholder='Quantity' onChange={(e) => setOrderDetails({ ...orderDetails, quantity: +e.target.value })} />
            <button type='submit'>Place Order</button>
        </form>
    );
};

export default OrderEntry;