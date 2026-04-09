import { Request, Response, NextFunction } from 'express';

const requestQueue: Array<{ req: Request; res: Response; next: NextFunction }> = [];
let processing = false;

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
    }, 100); // Adjust delay as necessary
};

export const requestQueueMiddleware = (req: Request, res: Response, next: NextFunction) => {
    requestQueue.push({ req, res, next });
    if (!processing) {
        processQueue();
    }
};