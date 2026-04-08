import dotenv from 'dotenv';

dotenv.config();

interface Config {
  JWT_SECRET: string;
  EVENT_BUS_URL: string;
  ANOTHER_SERVICE_URL: string;
  NODE_ENV: 'development' | 'staging' | 'production';
  PORT: number;
}

const getConfig = (): Config => {
  const { JWT_SECRET, EVENT_BUS_URL, ANOTHER_SERVICE_URL, NODE_ENV = 'development', PORT = 3000 } = process.env;

  if (!JWT_SECRET) {
    throw new Error('Missing JWT_SECRET in environment variables');
  }

  return {
    JWT_SECRET,
    EVENT_BUS_URL,
    ANOTHER_SERVICE_URL,
    NODE_ENV: NODE_ENV as 'development' | 'staging' | 'production',
    PORT: Number(PORT),
  };
};

const config = getConfig();

export default config;