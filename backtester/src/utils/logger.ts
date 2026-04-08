import winston from 'winston';

const isDevelopment = process.env.NODE_ENV !== 'production';

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  transports: [
    new winston.transports.Console({
      format: isDevelopment ? winston.format.simple() : winston.format.json(),
    }),
  ],
});

export default logger; 
