import express from 'express';
import { createUser, findUserById, findUserByEmail } from './user';
import { authMiddleware } from './middleware';
import { body, validationResult } from 'express-validator';

const router = express.Router();

/**
 * @swagger
 * /users:
 *   get:
 *     summary: Retrieve a list of users
 *     parameters:
 *       - name: limit
 *         in: query
 *         description: Number of users to return
 *         required: false
 *         schema:
 *           type: integer
 *       - name: offset
 *         in: query
 *         description: Number of users to skip
 *         required: false
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: A list of users
 */
router.get('/users', authMiddleware, async (req, res) => {
    const limit = parseInt(req.query.limit as string) || 10;
    const offset = parseInt(req.query.offset as string) || 0;
    const users = await User.find().limit(limit).skip(offset);
    res.status(200).json(users);
});

/**
 * @swagger
 * /users:
 *   post:
 *     summary: Create a new user
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               username:
 *                 type: string
 *               email:
 *                 type: string
 *     responses:
 *       201:
 *         description: User created
 */
router.post('/users', authMiddleware, body('username').isString(), body('email').isEmail(), async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { username, email } = req.body;
    const existingUser = findUserByEmail(email);
    if (existingUser) {
        return res.status(409).json({ error: 'Email already in use' });
    }

    const user = createUser(username, email);
    res.status(201).json(user);
});

/**
 * @swagger
 * /users/{id}:
 *   put:
 *     summary: Update a user by ID
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: ID of user to update
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               username:
 *                 type: string
 *               email:
 *                 type: string
 *     responses:
 *       204:
 *         description: User updated
 */
router.put('/users/:id', authMiddleware, body('username').optional().isString(), body('email').optional().isEmail(), async (req, res) => {
    const { id } = req.params;
    const user = findUserById(id);
    if (!user) {
        return res.status(404).json({ error: 'User not found' });
    }

    const { username, email } = req.body;
    if (username) user.username = username;
    if (email) user.email = email;
    res.status(204).send();
});

/**
 * @swagger
 * /users/{id}:
 *   delete:
 *     summary: Delete a user by ID
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: ID of user to delete
 *     responses:
 *       204:
 *         description: User deleted
 */
router.delete('/users/:id', authMiddleware, async (req, res) => {
    const { id } = req.params;
    const userIndex = users.findIndex(user => user.id === id);
    if (userIndex === -1) {
        return res.status(404).json({ error: 'User not found' });
    }
    users.splice(userIndex, 1);
    res.status(204).send();
});

export default router;