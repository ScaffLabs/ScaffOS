/**
 * @swagger
 * tags:
 *   name: Risk
 *   description: Risk management operations
 */

/**
 * @swagger
 * /risk:
 *   get:
 *     summary: Get risk positions
 *     tags: [Risk]
 *     parameters:
 *       - name: limit
 *         in: query
 *         description: Limit the number of results
 *         required: false
 *         schema:
 *           type: integer
 *       - name: offset
 *         in: query
 *         description: Offset for pagination
 *         required: false
 *         schema:
 *           type: integer
 *       - name: sort
 *         in: query
 *         description: Field to sort by
 *         required: false
 *         schema:
 *           type: string
 *       - name: filter
 *         in: query
 *         description: Field to filter by
 *         required: false
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: A list of risk positions
 *       500:
 *         description: Internal Server Error
 */

/**
 * @swagger
 * /risk:
 *   post:
 *     summary: Create a new risk position
 *     tags: [Risk]
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
 *         description: Bad Request
 *       500:
 *         description: Internal Server Error
 */

/**
 * @swagger
 * /risk/{id}:
 *   put:
 *     summary: Update a risk position
 *     tags: [Risk]
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: ID of the risk position to update
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
 *       500:
 *         description: Internal Server Error
 */

/**
 * @swagger
 * /risk/{id}:
 *   delete:
 *     summary: Delete a risk position
 *     tags: [Risk]
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: ID of the risk position to delete
 *         schema:
 *           type: string
 *     responses:
 *       204:
 *         description: Risk position deleted
 *       404:
 *         description: Risk position not found
 *       500:
 *         description: Internal Server Error
 */