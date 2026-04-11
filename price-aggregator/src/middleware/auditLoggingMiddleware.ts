import { Request, Response, NextFunction } from 'express';
import { logError } from '../logger';

export const auditLoggingMiddleware = (req: Request, res: Response, next: NextFunction) => {
    if (req.body && req.body.password) {
        // Avoid logging sensitive data like passwords
        const { password, ...rest } = req.body;
        logError({ message: 'Sensitive operation', data: rest });
    } else {
        logError({ message: 'Operation', data: req.body });
    }
    next();
};

export default auditLoggingMiddleware;