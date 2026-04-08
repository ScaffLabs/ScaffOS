import { Request, Response, NextFunction } from 'express'; 
import { ServiceError, ValidationError, NotFoundError } from './error.types'; 

export const errorMiddleware = (err: Error, req: Request, res: Response, next: NextFunction) => { 
    if (err instanceof ValidationError) { 
        return res.status(400).json({ message: err.message }); 
    } 
    if (err instanceof NotFoundError) { 
        return res.status(404).json({ message: err.message }); 
    } 
    if (err instanceof ServiceError) { 
        return res.status(500).json({ message: 'Service error: ' + err.message }); 
    } 
    return res.status(500).json({ message: 'An unexpected error occurred.' }); 
};