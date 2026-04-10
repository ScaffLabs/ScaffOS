import { Request, Response, NextFunction } from 'express';
import helmet from 'helmet';
import cors from 'cors';

// CORS configuration
const allowedOrigins = ['http://your-allowed-origin.com'];

export const corsMiddleware = cors({
    origin: function (origin, callback) {
        if (allowedOrigins.indexOf(origin) !== -1 || !origin) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true,
});

// Use Helmet for security headers
export const helmetMiddleware = helmet();

// Combine middlewares
export const applyMiddleware = (app: any) => {
    app.use(helmetMiddleware);
    app.use(corsMiddleware);
};