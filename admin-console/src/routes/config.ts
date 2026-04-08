/**
 * @swagger
 * tags:
 *   name: Configurations
 *   description: API for managing configurations
 */

/**
 * @swagger
 * /api/config:
 *   post:
 *     summary: Create a new configuration
 *     tags: [Configurations]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               key:
 *                 type: string
 *                 example: testKey
 *               value:
 *                 type: string
 *                 example: testValue
 *     responses:
 *       201:
 *         description: Configuration created successfully
 *       400:
 *         description: Bad Request
 */

/**
 * @swagger
 * /api/config:
 *   get:
 *     summary: Get all configurations
 *     tags: [Configurations]
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           example: 10
 *       - in: query
 *         name: offset
 *         schema:
 *           type: integer
 *           example: 0
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *           example: key
 *       - in: query
 *         name: order
 *         schema:
 *           type: string
 *           example: asc
 *     responses:
 *       200:
 *         description: A list of configurations
 *       404:
 *         description: No configurations found
 */

/**
 * @swagger
 * /api/config/{key}:
 *   get:
 *     summary: Get configuration by key
 *     tags: [Configurations]
 *     parameters:
 *       - in: path
 *         name: key
 *         required: true
 *         description: The configuration key
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Configuration found
 *       404:
 *         description: Configuration not found
 */

/**
 * @swagger
 * /api/config:
 *   put:
 *     summary: Update an existing configuration
 *     tags: [Configurations]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               key:
 *                 type: string
 *                 example: testKey
 *               value:
 *                 type: string
 *                 example: newValue
 *     responses:
 *       200:
 *         description: Configuration updated successfully
 *       404:
 *         description: Configuration not found
 *       400:
 *         description: Bad Request
 */

/**
 * @swagger
 * /api/config/{key}:
 *   delete:
 *     summary: Delete a configuration
 *     tags: [Configurations]
 *     parameters:
 *       - in: path
 *         name: key
 *         required: true
 *         description: The configuration key
 *         schema:
 *           type: string
 *     responses:
 *       204:
 *         description: Configuration deleted successfully
 *       404:
 *         description: Configuration not found
 */