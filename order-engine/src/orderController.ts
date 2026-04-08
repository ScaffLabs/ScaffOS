import { Request, Response } from 'express';
import { OrderBook } from './orderBook';
import { Order, OrderSchemas } from './types';

const orderBook = new OrderBook();

// Create a new order
export const createOrder = (req: Request, res: Response): void => {
  const parsedResult = OrderSchemas.OrderSchema.safeParse(req.body);

  if (!parsedResult.success) {
    return res.status(400).json({ errors: parsedResult.error.errors });
  }

  const order: Order = parsedResult.data;
  console.log('[INFO] Creating order:', order.id);
  orderBook.addOrder(order);
  res.status(201).send({ ...order });
};

// Get all orders with pagination, filtering, and sorting
export const getOrders = (req: Request, res: Response): void => {
  const { limit = 10, offset = 0, sort = 'id', order = 'asc', status } = req.query;

  let orders = orderBook.getOrders();

  // Filter by status if provided
  if (status) {
    orders = orders.filter(order => order.status === status);
  }

  // Sort orders
  orders.sort((a, b) => {
    const comparison = a[sort] < b[sort] ? -1 : a[sort] > b[sort] ? 1 : 0;
    return order === 'asc' ? comparison : -comparison;
  });

  // Paginate results
  const paginatedOrders = orders.slice(offset, offset + limit);
  res.status(200).send({ total: orders.length, data: paginatedOrders });
};

// Update an existing order
export const updateOrder = (req: Request, res: Response): void => {
  const { id } = req.params;
  const parsedResult = OrderSchemas.OrderSchema.safeParse(req.body);

  if (!parsedResult.success) {
    return res.status(400).json({ errors: parsedResult.error.errors });
  }

  const orderIndex = orderBook.getOrders().findIndex(order => order.id === id);
  if (orderIndex === -1) {
    return res.status(404).json({ message: 'Order not found' });
  }

  const updatedOrder = parsedResult.data;
  orderBook.getOrders()[orderIndex] = updatedOrder;
  res.status(200).send(updatedOrder);
};

// Delete an order
export const deleteOrder = (req: Request, res: Response): void => {
  const { id } = req.params;
  const orderIndex = orderBook.getOrders().findIndex(order => order.id === id);

  if (orderIndex === -1) {
    return res.status(404).json({ message: 'Order not found' });
  }

  orderBook.getOrders().splice(orderIndex, 1);
  res.status(204).send();
};
