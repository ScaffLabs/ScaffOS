import dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config();

interface Config {
  JWT_SECRET: string;
  EVENT_BUS_URL: string;
  ANOTHER_SERVICE_URL: string;
  NODE_ENV: 'development' | 'staging' | 'production';
  PORT: number;
}

const envSchema = z.object({
  JWT_SECRET: z.string().nonempty(),
  EVENT_BUS_URL: z.string().url(),
  ANOTHER_SERVICE_URL: z.string().url(),
  NODE_ENV: z.enum(['development', 'staging', 'production']).default('development'),
  PORT: z.coerce.number().default(3000),
});

const parseEnv = () => {
  const parsed = envSchema.safeParse(process.env);
  if (!parsed.success) {
    console.error('Invalid environment variables:', parsed.error.format());
    process.exit(1);
  }
  return parsed.data;
};

const config: Config = parseEnv();

export default config;