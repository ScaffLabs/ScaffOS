import * as dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config();

const envSchema = z.object({
    PORT: z.string().default('3000'),
    ORDER_SERVICE_URL: z.string().url(),
    USER_SERVICE_URL: z.string().url(),
});

const env = envSchema.safeParse(process.env);

if (!env.success) {
    console.error('Invalid environment variables:', env.error.format());
    process.exit(1);
}

const config = env.data;

export default config;
