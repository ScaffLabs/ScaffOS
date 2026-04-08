
/**
 * @swagger
 * tags:
 *   name: Configurations
 *   description: Configuration management operations
 */

/**
 * @swagger
 * /api/config:
 *   post:
 *     tags: [Configurations]
 *     summary: Create a new configuration
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               key:
 *                 type: string
 *               value:
 *                 type: string
 *     responses:
 *       201:
 *         description: Configuration created successfully
 *       400:
 *         description: Invalid input
 */

/**
 * @swagger
 * /api/config:
 *   get:
 *     tags: [Configurations]
 *     summary: Get all configurations with pagination
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         description: Number of items to retrieve
 *       - in: query
 *         name: offset
 *         schema:
 *           type: integer
 *         description: Offset for pagination
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *         description: Field to sort by
 *       - in: query
 *         name: order
 *         schema:
 *           type: string
 *         description: Order of sorting (asc/desc)
 *     responses:
 *       200:
 *         description: A list of configurations
 *       500:
 *         description: Failed to retrieve configurations
 */

/**
 * @swagger
 * /api/config/{key}:
 *   get:
 *     tags: [Configurations]
 *     summary: Get a configuration by key
 *     parameters:
 *       - in: path
 *         name: key
 *         required: true
 *         description: Configuration key
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
 *     tags: [Configurations]
 *     summary: Update an existing configuration
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               key:
 *                 type: string
 *               value:
 *                 type: string
 *     responses:
 *       200:
 *         description: Configuration updated successfully
 *       400:
 *         description: Invalid input
 */

/**
 * @swagger
 * /api/config/{key}:
 *   delete:
 *     tags: [Configurations]
 *     summary: Delete a configuration by key
 *     parameters:
 *       - in: path
 *         name: key
 *         required: true
 *         description: Configuration key
 *     responses:
 *       204:
 *         description: Configuration deleted successfully
 *       404:
 *         description: Configuration not found
 */