import express from 'express';
import bodyParser from 'body-parser';
import { healthCheck, readyCheck } from './health';
import { createOrder, getOrders, updateOrder, deleteOrder } from './orderController';
import { migrateData } from './migrations';
import { setupGracefulShutdown } from './shutdown';
import { setupRequestQueue } from './requestQueue';
import { monitorMemoryUsage } from './memoryMonitor';
import { setupConnectionPooling } from './db';
import { errorHandlingMiddleware } from './middleware';
import { connectToDatabase } from './db';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(bodyParser.json());

app.get('/health', healthCheck);
app.get('/ready', readyCheck);
app.post('/orders', createOrder);
app.get('/orders', getOrders);
app.put('/orders/:id', updateOrder);
app.delete('/orders/:id', deleteOrder);

const startServer = async () => {
    await migrateData();
    await setupConnectionPooling();
    setupRequestQueue(app);
    setupGracefulShutdown();
    monitorMemoryUsage();
    app.use(errorHandlingMiddleware);
    app.listen(PORT, () => {
        console.log(`Order Engine listening on port ${PORT}`);
    });
};

startServer().catch(err => {
    console.error('Failed to start the server:', err);
    process.exit(1);
});