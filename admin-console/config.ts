import dotenv from 'dotenv';
import Joi from 'joi';
import winston from 'winston';

dotenv.config();

const envSchema = Joi.object({
    PORT: Joi.number().default(3000),
    NODE_ENV: Joi.string().valid('development', 'staging', 'production').default('development'),
    DATABASE_URL: Joi.string().required(),
    API_KEY: Joi.string().required(),
    API_URL: Joi.string().uri().required(),
    LOG_LEVEL: Joi.string().valid('info', 'debug', 'error').default('info'),
    ENABLE_CORS: Joi.boolean().default(true),
}).unknown(true);

const { error, value: envVars } = envSchema.validate(process.env);
if (error) {
    throw new Error(`Configuration validation error: ${error.message}`);
}

const config = {
    port: envVars.PORT,
    nodeEnv: envVars.NODE_ENV,
    databaseUrl: envVars.DATABASE_URL,
    apiKey: envVars.API_KEY,
    apiUrl: envVars.API_URL,
    logLevel: envVars.LOG_LEVEL,
    enableCors: envVars.ENABLE_CORS === 'true',
};

const logger = winston.createLogger({
    level: config.logLevel,
    format: winston.format.json(),
    transports: [new winston.transports.Console()],
});

logger.info(`Configuration loaded for environment: ${config.nodeEnv}`);

export default config;