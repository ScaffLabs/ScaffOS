import { Request, Response, NextFunction } from 'express';
import validator from 'validator';

export const validateInput = (req: Request, res: Response, next: NextFunction) => {
    const { quantity } = req.body;
    if (typeof quantity !== 'number' || quantity <= 0) {
        return res.status(400).json({ message: 'Invalid quantity' });
    }
    next();
};

export const validatePositionId = (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;
    if (!validator.isUUID(id)) {
        return res.status(400).json({ message: 'Invalid position ID' });
    }
    next();
};