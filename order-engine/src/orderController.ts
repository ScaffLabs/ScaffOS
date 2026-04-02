import { Request, Response } from 'express';
import { OrderBook } from './orderBook';
import { Order } from './types';

const orderBook = new OrderBook();

export const createOrder = (req: Request, res: Response): void => {
  const order: Order = req.body;
  orderBook.addOrder(order);
  res.status(201).send(order);
};

export const getOrders = (req: Request, res: Response): void => {
  const orders = orderBook.getOrders();
  res.status(200).send(orders);
};