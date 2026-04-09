import * as dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config();

const envSchema = z.object({
    NODE_ENV: z.enum(['development', 'staging', 'production']).default('development'),
    PORT: z.string().default('3000'),
    WEBHOOK_URL: z.string().nonempty(),
    EMAIL_SERVICE_URL: z.string().nonempty(),
    MONGO_URI: z.string().nonempty(),
});

const parsedEnv = envSchema.safeParse(process.env);

if (!parsedEnv.success) {
    console.error('Invalid environment variables:', parsedEnv.error.format());
    process.exit(1);
}

export const config = parsedEnv.data; 
export const isProduction = config.NODE_ENV === 'production';
