import { Request, Response } from 'express';
import { OrderBook } from './orderBook';
import { Order } from './types';

const orderBook = new OrderBook();

export const createOrder = (req: Request, res: Response): void => {
  const order: Order = req.body;
  // Log sensitive operations, avoid logging sensitive data
  console.log('[INFO] Creating order:', order.id);
  orderBook.addOrder(order);
  res.status(201).send({ ...order, id: escape(order.id) });
};

export const getOrders = (req: Request, res: Response): void => {
  const orders = orderBook.getOrders();
  // Escape output to prevent XSS
  const escapedOrders = orders.map(order => ({
    ...order,
    id: escape(order.id),
    type: escape(order.type),
    status: escape(order.status)
  }));
  res.status(200).send(escapedOrders);
};

const escape = (str: string) => {
  return str.replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;');
};