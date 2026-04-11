import * as dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config();

const envSchema = z.object({
    NODE_ENV: z.enum(['development', 'staging', 'production']).default('development'),
    PORT: z.number().default(3000),
    LOG_LEVEL: z.string().default('info'),
    REDIS_URL: z.string().url().default('redis://localhost:6379'),
    OTHER_SERVICE_URL: z.string().url().default('http://localhost:4000'),
});

const env = envSchema.safeParse(process.env);

if (!env.success) {
    console.error('Missing required environment variables:', env.error.errors);
    process.exit(1);
}

export const config = {
    environment: env.data.NODE_ENV,
    port: env.data.PORT,
    logLevel: env.data.LOG_LEVEL,
    redisUrl: env.data.REDIS_URL,
    otherServiceUrl: env.data.OTHER_SERVICE_URL,
};

export const isProduction = () => env.data.NODE_ENV === 'production';
export const isDevelopment = () => env.data.NODE_ENV === 'development';
export const isStaging = () => env.data.NODE_ENV === 'staging';

// Default configuration for local development
export const defaultConfig = {
    NODE_ENV: 'development',
    PORT: 3000,
    LOG_LEVEL: 'info',
    REDIS_URL: 'redis://localhost:6379',
    OTHER_SERVICE_URL: 'http://localhost:4000',
};

// Function to validate the environment variables on startup
export const validateConfig = () => {
    const requiredKeys = Object.keys(defaultConfig);
    const missingKeys = requiredKeys.filter(key => !process.env[key]);
    if (missingKeys.length > 0) {
        console.error(`Missing required environment variables: ${missingKeys.join(', ')}`);
        process.exit(1);
    }
};

validateConfig();
