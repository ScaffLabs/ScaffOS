import { Request, Response } from 'express';
import { Order, OrderSchemas } from './types';
import { logAudit } from './logger';
import { storage } from './storage';

export const createOrder = async (req: Request, res: Response): Promise<void> => {
  const parsedResult = OrderSchemas.OrderSchema.safeParse(req.body);

  if (!parsedResult.success) {
    return res.status(400).json({ errors: parsedResult.error.errors });
  }

  const order: Order = parsedResult.data;
  await storage.create(order);
  logAudit('CREATE_ORDER', order.id);

  res.status(201).send(order);
};

export const getOrders = async (req: Request, res: Response): Promise<void> => {
  const orders = await storage.findAll();
  res.status(200).json(orders);
};

export const updateOrder = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  const parsedResult = OrderSchemas.OrderSchema.safeParse(req.body);

  if (!parsedResult.success) {
    return res.status(400).json({ errors: parsedResult.error.errors });
  }

  const updatedOrder = await storage.update(id, parsedResult.data);
  if (!updatedOrder) {
    return res.status(404).json({ message: 'Order not found' });
  }

  logAudit('UPDATE_ORDER', updatedOrder.id);
  res.status(200).send(updatedOrder);
};

export const deleteOrder = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  await storage.delete(id);
  logAudit('DELETE_ORDER', id);
  res.status(204).send();
};
