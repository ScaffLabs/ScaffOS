import * as dotenv from 'dotenv';
import { cleanEnv, str, port, bool } from 'envalid';

dotenv.config();

const env = cleanEnv(process.env, {
  PORT: port({ default: 3000 }),
  PORTFOLIO_SERVICE_URL: str({ default: 'http://localhost:3001/api/portfolios' }),
  NODE_ENV: str({ choices: ['development', 'staging', 'production'], default: 'development' }),
  DATABASE_URL: str({ default: 'mongodb://mongo:27017/portfolio-tracker' }),
  LOG_LEVEL: str({ choices: ['debug', 'info', 'warn', 'error'], default: 'info' }),
  DEBUG_MODE: bool({ default: false }),
});

if (!env.DATABASE_URL) {
  throw new Error('DATABASE_URL environment variable is required');
}

export default env;