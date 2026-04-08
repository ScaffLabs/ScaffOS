import logger from '../logger';
import { ServiceError } from '../errors/customErrors';

export const logError = (error: Error, context: string) => {
    if (error instanceof ServiceError) {
        logger.error({ message: error.message, context });
    } else {
        logger.error({ message: 'Unexpected Error: ' + error.message, context });
    }
};

export const logServiceError = (error: ServiceError) => {
    logger.error({ message: error.message, stack: error.stack }, 'Service Error');
};