import { Request, Response } from 'express';
import { OrderBook } from './orderBook';
import { Order, OrderSchemas } from './types';
import { logAudit } from './logger';
import { queryDatabase } from './db';

const orderBook = new OrderBook();

export const createOrder = async (req: Request, res: Response): Promise<void> => {
  const parsedResult = OrderSchemas.OrderSchema.safeParse(req.body);

  if (!parsedResult.success) {
    return res.status(400).json({ errors: parsedResult.error.errors });
  }

  const order: Order = parsedResult.data;
  console.log('[INFO] Creating order:', order.id);
  orderBook.addOrder(order);
  logAudit('CREATE_ORDER', order.id);

  // Persist order to the database
  const query = 'INSERT INTO orders (id, type, price, quantity, status) VALUES ($1, $2, $3, $4, $5)';
  await queryDatabase(query, [order.id, order.type, order.price, order.quantity, order.status]);

  res.status(201).send({ ...order });
};

export const getOrders = async (req: Request, res: Response): Promise<void> => {
  const orders = orderBook.getOrders();
  res.status(200).json(orders);
};

export const updateOrder = async (req: Request, res: Response): Promise<void> => {
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
  logAudit('UPDATE_ORDER', updatedOrder.id);

  // Update order in the database
  const query = 'UPDATE orders SET type = $1, price = $2, quantity = $3, status = $4 WHERE id = $5';
  await queryDatabase(query, [updatedOrder.type, updatedOrder.price, updatedOrder.quantity, updatedOrder.status, id]);

  res.status(200).send(updatedOrder);
};

export const deleteOrder = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  const orderIndex = orderBook.getOrders().findIndex(order => order.id === id);
  if (orderIndex === -1) {
    return res.status(404).json({ message: 'Order not found' });
  }

  // Remove order from the order book
  orderBook.getOrders().splice(orderIndex, 1);
  logAudit('DELETE_ORDER', id);

  // Delete order from the database
  const query = 'DELETE FROM orders WHERE id = $1';
  await queryDatabase(query, [id]);

  res.status(204).send();
};

export const matchOrders = async (req: Request, res: Response): Promise<void> => {
  orderBook.matchOrders();
  res.status(200).send({ message: 'Orders matched successfully.' });
};
