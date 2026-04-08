import { Router } from 'express';
import { createEvent, getEvents, updateEvent, deleteEvent, checkHealthEndpoint } from './eventController';
import { gracefulShutdown } from './healthCheck';

const router = Router();

/**
 * @swagger
 * /events:
 *   post:
 *     description: Create an event
 *     parameters:
 *       - in: body
 *         name: event
 *         description: Event object
 *         schema:
 *           type: object
 *           properties:
 *             title:
 *               type: string
 *             description:
 *               type: string
 *             type:
 *               type: string
 *               enum: [userCreated, orderPlaced]
 *     responses:
 *       201:
 *         description: Event created successfully
 *       400:
 *         description: Bad input
 *   get:
 *     description: Get a list of events
 *     parameters:
 *       - in: query
 *         name: limit
 *         type: integer
 *       - in: query
 *         name: offset
 *         type: integer
 *       - in: query
 *         name: sortBy
 *         type: string
 *       - in: query
 *         name: order
 *         type: string
 *     responses:
 *       200:
 *         description: A list of events
 *       404:
 *         description: No events found
 */
router.post('/', createEvent);
router.get('/', getEvents);
router.put('/:id', updateEvent);
router.delete('/:id', deleteEvent);
router.get('/health', checkHealthEndpoint);

process.on('SIGTERM', gracefulShutdown);
process.on('SIGINT', gracefulShutdown);

export default router;