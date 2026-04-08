import dotenv from 'dotenv';
import Joi from 'joi';

dotenv.config();

const envSchema = Joi.object({
    NODE_ENV: Joi.string().valid('development', 'staging', 'production').default('development'),
    PORT: Joi.number().default(3000),
    API_URL: Joi.string().uri().required(),
    DB_HOST: Joi.string().required(),
    DB_USER: Joi.string().required(),
    DB_PASSWORD: Joi.string().required(),
    DB_NAME: Joi.string().required(),
    EXTERNAL_API_URL: Joi.string().uri().required(),
}).unknown();

const { error, value: envVars } = envSchema.validate(process.env);
if (error) {
    throw new Error(`Configuration error: ${error.message}`);
}

const config = {
    nodeEnv: envVars.NODE_ENV,
    port: envVars.PORT,
    apiUrl: envVars.API_URL,
    db: {
        host: envVars.DB_HOST,
        user: envVars.DB_USER,
        password: envVars.DB_PASSWORD,
        name: envVars.DB_NAME,
    },
    externalApiUrl: envVars.EXTERNAL_API_URL,
};

export default config;
