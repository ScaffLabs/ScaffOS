import { Router } from 'express';
import { createEvent, getEvents, updateEvent, deleteEvent, checkHealthEndpoint } from './eventController';
import { gracefulShutdown } from './healthCheck';

const router = Router();

/**
 * @swagger
 * /events:
 *   get:
 *     summary: Retrieve a list of events
 *     parameters:
 *       - in: query
 *         name: limit
 *         required: false
 *         schema:
 *           type: integer
 *         description: Number of events to return
 *       - in: query
 *         name: offset
 *         required: false
 *         schema:
 *           type: integer
 *         description: Number of events to skip
 *       - in: query
 *         name: sortBy
 *         required: false
 *         schema:
 *           type: string
 *           enum: [title, createdAt]
 *         description: Sort events by this field
 *       - in: query
 *         name: order
 *         required: false
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *         description: Sort order
 *     responses:
 *       200:
 *         description: A list of events
 *       404:
 *         description: No events found
 */
router.get('/', getEvents);

/**
 * @swagger
 * /events:
 *   post:
 *     summary: Create a new event
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               type:
 *                 type: string
 *                 enum: [userCreated, orderPlaced]
 *     responses:
 *       201:
 *         description: Event created successfully
 *       400:
 *         description: Validation error
 */
router.post('/', createEvent);

/**
 * @swagger
 * /events/{id}:
 *   put:
 *     summary: Update an existing event
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID of the event to update
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *     responses:
 *       200:
 *         description: Event updated successfully
 *       404:
 *         description: Event not found
 */
router.put('/:id', updateEvent);

/**
 * @swagger
 * /events/{id}:
 *   delete:
 *     summary: Delete an event
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID of the event to delete
 *         schema:
 *           type: string
 *     responses:
 *       204:
 *         description: Event deleted successfully
 *       404:
 *         description: Event not found
 */
router.delete('/:id', deleteEvent);

router.get('/health', checkHealthEndpoint);

process.on('SIGTERM', gracefulShutdown);
process.on('SIGINT', gracefulShutdown);

export default router;