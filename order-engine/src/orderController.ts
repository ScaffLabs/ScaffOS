import { Request, Response } from 'express';
import { OrderBook } from './orderBook';
import { Order, OrderSchemas } from './types';

const orderBook = new OrderBook();

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

export const getOrders = (req: Request, res: Response): void => {
  const orders = orderBook.getOrders();
  res.status(200).send(orders);
};