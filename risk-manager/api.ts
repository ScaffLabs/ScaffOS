import express, { Request, Response } from 'express';
import { body, validationResult } from 'express-validator';
import RateLimit from 'express-rate-limit';
import RiskManager from './riskManager';
import authMiddleware from './authMiddleware';

const router = express.Router();
const riskManager = new RiskManager();

// Rate limiting middleware
const limiter = RateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
});

/**
 * @swagger
 * /risk:
 *   get:
 *     summary: Retrieve risk positions
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         description: Number of results to return
 *       - in: query
 *         name: offset
 *         schema:
 *           type: integer
 *         description: Number of results to skip
 *     responses:
 *       200:
 *         description: A list of risk positions
 */
router.get('/risk', limiter, async (req: Request, res: Response) => {
  const { limit = 10, offset = 0 } = req.query;
  const positions = await riskManager.getRiskPositions(Number(limit), Number(offset));
  res.status(200).json(positions);
});

/**
 * @swagger
 * /risk:
 *   post:
 *     summary: Create a new risk position
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               asset:
 *                 type: string
 *               position:
 *                 type: number
 *     responses:
 *       201:
 *         description: Risk position created
 *       400:
 *         description: Invalid input
 */
router.post('/risk', limiter, authMiddleware, body('asset').isString(), body('position').isNumeric(), async (req: Request, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  const { asset, position } = req.body;
  const newPosition = await riskManager.createRiskPosition(asset, position);
  res.status(201).json(newPosition);
});

/**
 * @swagger
 * /risk/{id}:
 *   put:
 *     summary: Update a risk position
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: Risk position ID
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               position:
 *                 type: number
 *     responses:
 *       204:
 *         description: Risk position updated
 *       404:
 *         description: Risk position not found
 */
router.put('/risk/:id', limiter, authMiddleware, body('position').isNumeric(), async (req: Request, res: Response) => {
  const { id } = req.params;
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  const { position } = req.body;
  const updated = await riskManager.updateRiskPosition(id, position);
  if (!updated) {
    return res.status(404).send('Risk position not found');
  }
  res.status(204).send();
});

/**
 * @swagger
 * /risk/{id}:
 *   delete:
 *     summary: Delete a risk position
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: Risk position ID
 *         schema:
 *           type: string
 *     responses:
 *       204:
 *         description: Risk position deleted
 *       404:
 *         description: Risk position not found
 */
router.delete('/risk/:id', limiter, authMiddleware, async (req: Request, res: Response) => {
  const { id } = req.params;
  const deleted = await riskManager.deleteRiskPosition(id);
  if (!deleted) {
    return res.status(404).send('Risk position not found');
  }
  res.status(204).send();
});

export default router;