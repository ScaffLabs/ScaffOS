import { Request, Response, NextFunction } from 'express';

const requestQueue: Array<{ req: Request; res: Response; next: NextFunction }> = [];
let processing = false;
const MAX_QUEUE_SIZE = 100;
const PROCESSING_DELAY = 200; // Delay for processing each request in the queue

const processQueue = () => {
    if (requestQueue.length === 0) {
        processing = false;
        return;
    }
    processing = true;
    const { req, res, next } = requestQueue.shift()!;
    // Simulate processing delay
    setTimeout(() => {
        next();  // Continue to process the next request in the queue
        processQueue();
    }, PROCESSING_DELAY);
};

export const requestQueueMiddleware = (req: Request, res: Response, next: NextFunction) => {
    if (requestQueue.length < MAX_QUEUE_SIZE) {
        requestQueue.push({ req, res, next });
        if (!processing) {
            processQueue();
        }
    } else {
        res.status(429).json({ error: 'Too many requests, please try again later.' });
    }
};
