import dotenv from 'dotenv';
import Joi from 'joi';

dotenv.config();

const envSchema = Joi.object({
    PORT: Joi.number().default(3000),
    NODE_ENV: Joi.string().valid('development', 'staging', 'production').default('development'),
    ORDER_SERVICE_URL: Joi.string().required(),
    DATA_SERVICE_URL: Joi.string().required(),
    DATABASE_URL: Joi.string().required(),
    LOG_LEVEL: Joi.string().valid('info', 'warn', 'error').default('info'),
}).unknown();

const { error, value: envVars } = envSchema.validate(process.env);

if (error) {
    throw new Error(`Config validation error: ${error.message}`);
}

export const config = {
    port: envVars.PORT,
    nodeEnv: envVars.NODE_ENV,
    orderServiceUrl: envVars.ORDER_SERVICE_URL,
    dataServiceUrl: envVars.DATA_SERVICE_URL,
    databaseUrl: envVars.DATABASE_URL,
    logLevel: envVars.LOG_LEVEL,
};
