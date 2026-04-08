import express from 'express';
import bodyParser from 'body-parser';
import { securityMiddleware, validateRequest, errorHandlingMiddleware } from './middleware';
// Other imports...

const app = express();
const PORT = process.env.PORT || 3000;

app.use(bodyParser.json());
app.use(securityMiddleware);

app.get('/health', healthCheck);
app.get('/ready', readyCheck);
app.post('/orders', validateRequest, createOrder);
app.get('/orders', getOrders);
app.put('/orders/:id', validateRequest, updateOrder);
app.delete('/orders/:id', deleteOrder);

app.use(errorHandlingMiddleware);

const startServer = async () => {
    await connectToDatabase();
    app.listen(PORT, () => {
        console.log(`Order Engine listening on port ${PORT}`);
    });
};

setupGracefulShutdown();
initializeMonitoring();

startServer().catch(err => {
    console.error('Failed to start the server:', err);
    process.exit(1);
});