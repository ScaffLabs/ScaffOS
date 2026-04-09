import dotenv from 'dotenv';
import Joi from 'joi';

dotenv.config();

const schema = Joi.object({
    REACT_APP_API_BASE_URL: Joi.string().uri().default('http://localhost:3000'),
    PORT: Joi.number().default(3000),
    NODE_ENV: Joi.string().valid('development', 'staging', 'production').default('development'),
    STRATEGY_SERVICE_URL: Joi.string().uri().default('http://localhost:3001/api/health'),
    DB_URL: Joi.string().uri().required(),
    LOG_LEVEL: Joi.string().valid('debug', 'info', 'warn', 'error').default('info'),
}).unknown();

const { error, value: config } = schema.validate(process.env);

if (error) {
    throw new Error(`Config validation error: ${error.message}`);
}

export default config;
