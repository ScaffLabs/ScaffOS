import dotenv from 'dotenv';
import Joi from 'joi';

dotenv.config();

const envSchema = Joi.object({
    NODE_ENV: Joi.string().valid('development', 'staging', 'production').default('development'),
    JWT_SECRET: Joi.string().required(),
    API_KEY_SECRET: Joi.string().default('default_api_key_secret'),
}).unknown();

const { error, value: envVars } = envSchema.validate(process.env);

if (error) {
    throw new Error(`Config validation error: ${error.message}`);
}

const config = {
    environment: envVars.NODE_ENV,
    jwtSecret: envVars.JWT_SECRET,
    apiKeySecret: envVars.API_KEY_SECRET,
};

export default config;
