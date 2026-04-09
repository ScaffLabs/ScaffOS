import dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config();

const envSchema = z.object({
  PORT: z.string().default('3000'),
  BASE_URL: z.string().url().default('http://localhost:3000'),
  DATABASE_URL: z.string().url().nonempty(),
  ANOTHER_SERVICE_URL: z.string().url().nonempty(),
  ORDER_SERVICE_URL: z.string().url().nonempty(),
  MEMORY_LIMIT: z.string().default('80%'),
  LOG_LEVEL: z.string().default('info'),
});

const env = envSchema.safeParse(process.env);

if (!env.success) {
  console.error('Environment variable validation failed:', env.error.format());
  process.exit(1);
}

export const config = env.data;
