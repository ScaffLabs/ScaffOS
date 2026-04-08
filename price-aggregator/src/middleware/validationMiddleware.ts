import { Request, Response, NextFunction } from 'express';
import { body, validationResult } from 'express-validator';

export const validatePriceData = [
    body('exchange')
        .isString()
        .notEmpty()
        .escape()
        .withMessage('Exchange must be a non-empty string'),
    body('price')
        .isFloat({ gt: 0 })
        .withMessage('Price must be a positive number'),
    body('volume')
        .isFloat({ gt: 0 })
        .withMessage('Volume must be a positive number'),
];

export const handleValidationErrors = (req: Request, res: Response, next: NextFunction) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    next();
};