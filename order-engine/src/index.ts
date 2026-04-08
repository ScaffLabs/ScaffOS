import express from 'express';
import bodyParser from 'body-parser';
import { healthCheck, readyCheck } from './health';
import { createOrder, getOrders, updateOrder, deleteOrder } from './orderController';
import { migrateData } from './migrations';

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
    app.listen(PORT, () => {
        console.log(`Order Engine listening on port ${PORT}`);
    });
};

startServer().catch(err => {
    console.error('Failed to start the server:', err);
    process.exit(1);
});
