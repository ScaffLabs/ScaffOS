import * as dotenv from 'dotenv';
import { cleanEnv, str, port } from 'envalid';

dotenv.config();

const env = cleanEnv(process.env, {
  PORT: port({ default: 3000 }),
  PORTFOLIO_SERVICE_URL: str({ default: 'http://localhost:3001/api/portfolios' }),
  NODE_ENV: str({ choices: ['development', 'staging', 'production'], default: 'development' })
});

export default env;