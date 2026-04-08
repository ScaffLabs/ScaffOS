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
 *               description: Title of the event
 *             description:
 *               type: string
 *               description: Description of the event
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
 *         description: Number of events to return (default: 10)
 *       - in: query
 *         name: offset
 *         type: integer
 *         description: Number of events to skip (default: 0)
 *       - in: query
 *         name: sortBy
 *         type: string
 *         description: Field to sort by (e.g., createdAt)
 *       - in: query
 *         name: order
 *         type: string
 *         description: Sort order (asc or desc)
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