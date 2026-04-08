import { Request, Response } from 'express';

export const healthCheck = (req: Request, res: Response): void => {
  res.status(200).send('Order Engine is healthy!');
};

export const readyCheck = (req: Request, res: Response): void => {
  // Here you would check if your service is ready to handle requests
  res.status(200).send('Order Engine is ready!');
};
