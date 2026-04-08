import express from 'express';
import { body, validationResult } from 'express-validator';
import { postConfiguration } from '../services/ServiceClient';
import csrf from 'csurf';

const router = express.Router();
const csrfProtection = csrf({ cookie: true });

// CSRF protection and data sanitization middleware
router.use(csrfProtection);

router.post('/', [
    body('key').trim().escape().notEmpty().withMessage('Key is required'),
    body('value').trim().escape().notEmpty().withMessage('Value is required'),
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    try {
        const { key, value } = req.body;
        await postConfiguration(key, value);
        res.status(201).json({ message: 'Configuration created successfully!' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to create configuration' });
    }
});

export default router;
