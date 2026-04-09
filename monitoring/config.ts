import * as dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config();

const envSchema = z.object({
    PORT: z.string().default('3000'),
    ORDER_SERVICE_URL: z.string().url().default('http://localhost:4000'),
    USER_SERVICE_URL: z.string().url().default('http://localhost:5000'),
    NODE_ENV: z.enum(['development', 'staging', 'production']).default('development'),
});

const env = envSchema.safeParse(process.env);

if (!env.success) {
    console.error('Invalid environment variables:', env.error.format());
    process.exit(1);
}

const config = env.data;

export default config;