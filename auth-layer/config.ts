import dotenv from 'dotenv';
import Joi from 'joi';

dotenv.config();

const envSchema = Joi.object({
    NODE_ENV: Joi.string().valid('development', 'staging', 'production').default('development'),
    JWT_SECRET: Joi.string().required(),
    API_KEY_SECRET: Joi.string().default('default_api_key_secret'),
    DATABASE_URL: Joi.string().uri().required(),
    USER_SERVICE_URL: Joi.string().uri().required(),
    ORDER_SERVICE_URL: Joi.string().uri().required(),
}).unknown();

const { error, value: envVars } = envSchema.validate(process.env);

if (error) {
    throw new Error(`Config validation error: ${error.message}`);
}

const config = {
    environment: envVars.NODE_ENV,
    jwtSecret: envVars.JWT_SECRET,
    apiKeySecret: envVars.API_KEY_SECRET,
    databaseUrl: envVars.DATABASE_URL,
    userServiceUrl: envVars.USER_SERVICE_URL,
    orderServiceUrl: envVars.ORDER_SERVICE_URL,
};

export default config;