import { Request, Response } from 'express';
import { body, validationResult } from 'express-validator';
import { createOrderService, updateOrderService, deleteOrderService, getOrdersService } from './orderService';
import logger from './logger';
import { ValidationError } from './errors';

// Validation middleware for creating an order
export const createOrderValidators = [
    body('id').isString().trim().escape().withMessage('ID must be a string'),
    body('type').isIn(['limit', 'market', 'stop']).withMessage('Type must be one of limit, market, or stop'),
    body('price').isNumeric().isFloat({ gt: 0 }).withMessage('Price must be a positive number'),
    body('quantity').isInt({ gt: 0 }).withMessage('Quantity must be a positive integer'),
    body('status').isIn(['open', 'filled', 'cancelled']).withMessage('Status must be one of open, filled, or cancelled')
];

// Create Order
export const createOrder = [createOrderValidators, async (req: Request, res: Response) => {
    // Check for validation errors
    const validationErrors = validationResult(req);
    if (!validationErrors.isEmpty()) {
        return res.status(400).json({ errors: validationErrors.array() }); // Respond with errors if validation fails
    }
    try {
        const order = req.body;
        const createdOrder = await createOrderService(order); // Call service to create the order
        res.status(201).json(createdOrder); // Respond with the created order
        logger.info('Order created successfully', { order: createdOrder }); // Log the creation
    } catch (error) {
        logger.error('Error creating order', { error: error.message });
        if (error instanceof ValidationError) {
            return res.status(400).json({ message: error.message }); // Handle validation errors specifically
        }
        res.status(500).json({ message: 'Internal Server Error' }); // Handle general errors
    }
}];

// Get Orders
export const getOrders = async (req: Request, res: Response) => {
    const { limit = 10, offset = 0, status } = req.query; // Extract query parameters
    try {
        const orders = await getOrdersService({ limit: Number(limit), offset: Number(offset), status }); // Fetch orders from service
        if (orders.length === 0) {
            return res.status(404).json({ message: 'No orders found.' }); // Respond if no orders exist
        }
        res.status(200).json(orders); // Respond with the orders
    } catch (error) {
        logger.error('Error retrieving orders', { error: error.message });
        res.status(500).json({ message: 'Internal Server Error' }); // Handle errors
    }
};

// Update Order
export const updateOrder = async (req: Request, res: Response) => {
    const { id } = req.params; // Get the order ID from parameters
    const updates = req.body; // Get update data from request body
    try {
        const updatedOrder = await updateOrderService(id, updates); // Call service to update the order
        if (!updatedOrder) {
            return res.status(404).json({ message: 'Order not found.' }); // Respond if order not found
        }
        res.status(200).json(updatedOrder); // Respond with the updated order
    } catch (error) {
        logger.error('Error updating order', { error: error.message });
        res.status(500).json({ message: 'Internal Server Error' }); // Handle errors
    }
};

// Delete Order
export const deleteOrder = async (req: Request, res: Response) => {
    const { id } = req.params; // Get the order ID from parameters
    try {
        await deleteOrderService(id); // Call service to delete the order
        res.status(204).send(); // Respond with no content on success
    } catch (error) {
        logger.error('Error deleting order', { error: error.message });
        if (error.message.includes('not found')) {
            return res.status(404).json({ message: 'Order not found.' }); // Handle order not found error
        }
        res.status(500).json({ message: 'Internal Server Error' }); // Handle general errors
    }
};

// Attach routes to the app
export const orderRouter = (app: any) => {
    app.post('/orders', createOrder); // Route for creating an order
    app.get('/orders', getOrders); // Route for retrieving orders
    app.put('/orders/:id', updateOrder); // Route for updating an order
    app.delete('/orders/:id', deleteOrder); // Route for deleting an order
};