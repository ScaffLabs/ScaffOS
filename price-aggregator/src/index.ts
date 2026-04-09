import { requestQueueMiddleware } from './middleware/requestQueueingMiddleware';

app.use(requestQueueMiddleware); // This line should be added before your other middleware or routes.