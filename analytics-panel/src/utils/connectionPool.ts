import mongoose from 'mongoose';
import config from '../config';
import { logError } from '../utils/errorLogger';

const connectionPool = new Map<string, mongoose.Connection>();

const connectToDatabase = async (dbUrl: string) => {
    if (connectionPool.has(dbUrl)) {
        return connectionPool.get(dbUrl);
    }
    const connection = mongoose.createConnection(dbUrl, { useNewUrlParser: true, useUnifiedTopology: true });
    connectionPool.set(dbUrl, connection);

    connection.on('error', (error) => {
        logError(error, 'MongoDB connection error');
    });

    connection.once('open', () => {
        console.log('MongoDB connected successfully.');
    });

    return connection;
};

export { connectToDatabase };