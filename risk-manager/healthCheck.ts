import express from 'express';
import { performance } from 'perf_hooks';

const router = express.Router();
let isReady = true;

router.get('/health', (req, res) => {
    res.status(200).json({ status: 'healthy' });
});

router.get('/ready', (req, res) => {
    isReady ? res.status(200).json({ status: 'ready' }) : res.status(503).json({ status: 'not ready' });
});

export const setReady = (ready: boolean) => {
    isReady = ready;
};

export default router;