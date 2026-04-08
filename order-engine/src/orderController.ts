import { body } from 'express-validator';

// Validation middleware for creating an order
export const createOrderValidators = [
    body('id').isString().withMessage('ID must be a string'),
    body('type').isIn(['limit', 'market', 'stop']).withMessage('Type must be one of limit, market, or stop'),
    body('price').isNumeric().isPositive().withMessage('Price must be a positive number'),
    body('quantity').isInt({ gt: 0 }).withMessage('Quantity must be a positive integer'),
    body('status').isIn(['open', 'filled', 'cancelled']).withMessage('Status must be one of open, filled, or cancelled')
];

// Attach validators to the createOrder method
export const createOrder = [createOrderValidators, async (req: Request, res: Response): Promise<void> => {
    const validationErrors = validationResult(req);
    if (!validationErrors.isEmpty()) {
        return res.status(400).json({ errors: validationErrors.array() });
    }
    try {
        await OrderSchema.parseAsync(req.body);
        const order: Order = req.body;
        const createdOrder = await createOrderService(order);
        res.status(201).json(createdOrder);
        logger.info('Order created successfully', { order: createdOrder, requestId: req.headers['x-request-id'] });
    } catch (error) {
        logger.error('Error creating order', { error: error.message, requestId: req.headers['x-request-id'] });
        if (error instanceof ValidationError) {
            res.status(400).json({ message: error.message });
        } else {
            res.status(500).json({ message: 'Internal Server Error', error: error.message });
        }
    }
}];