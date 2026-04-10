import mongoose from 'mongoose';
import config from '../config';
import { logError } from '../utils/errorLogger';

const connectToDatabase = async () => {
    const maxRetries = 5;
    let attempt = 0;
    while (attempt < maxRetries) {
        try {
            await mongoose.connect(config.DB_URL, { useNewUrlParser: true, useUnifiedTopology: true });
            console.log('Database connected successfully.');
            return;
        } catch (error) {
            attempt++;
            logError(error, 'Database connection failed');
            console.error(`Database connection attempt ${attempt} failed.`);
            if (attempt < maxRetries) {
                await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 1000)); // Exponential backoff
            } else {
                console.error('Max database connection attempts reached.');
                throw error;
            }
        }
    }
};

export { connectToDatabase };
