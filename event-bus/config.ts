import * as dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config();

const envSchema = z.object({
    NODE_ENV: z.enum(['development', 'staging', 'production']).default('development'),
    PORT: z.number().default(3000),
    LOG_LEVEL: z.string().default('info'),
    REDIS_URL: z.string().url().default('redis://localhost:6379'),
});

const env = envSchema.parse(process.env);

export const config = {
    environment: env.NODE_ENV,
    port: env.PORT,
    logLevel: env.LOG_LEVEL,
    redisUrl: env.REDIS_URL,
};

export const isProduction = () => env.NODE_ENV === 'production';
export const isDevelopment = () => env.NODE_ENV === 'development';
export const isStaging = () => env.NODE_ENV === 'staging';
