import dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config();

const envSchema = z.object({
    NODE_ENV: z.enum(['development', 'staging', 'production']).default('development'),
    BASE_URL: z.string().url().default('https://api.example.com'),
    PORT: z.number().int().default(3000),
    DB_USER: z.string().nonempty(),
    DB_PASSWORD: z.string().nonempty(),
    DB_HOST: z.string().nonempty(),
    DB_NAME: z.string().nonempty(),
    DB_PORT: z.number().int().default(5432),
});

const parsedEnv = envSchema.safeParse(process.env);

if (!parsedEnv.success) {
    console.error('Invalid environment variables:', parsedEnv.error.format());
    process.exit(1);
}

const env = parsedEnv.data;

export const config = {
    baseUrl: env.BASE_URL,
    port: env.PORT,
    nodeEnv: env.NODE_ENV,
    dbUser: env.DB_USER,
    dbPassword: env.DB_PASSWORD,
    dbHost: env.DB_HOST,
    dbName: env.DB_NAME,
    dbPort: env.DB_PORT,
};

export const isProduction = env.NODE_ENV === 'production';
export const isStaging = env.NODE_ENV === 'staging';
export const isDevelopment = env.NODE_ENV === 'development';
