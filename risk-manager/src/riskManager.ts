import { RiskPosition, RiskPositionSchema, OrderId } from './sharedTypes';
import { RiskPositionStorage } from './storage';
import logger from './logger';
import { ServiceError, ValidationError, NotFoundError } from './errors';
import { notifyEventBus } from './externalService';

export default class RiskManager {
    private storage: RiskPositionStorage;

    constructor(storage: RiskPositionStorage) {
        this.storage = storage; // Initialize storage for handling risk positions
    }

    async createRiskPosition(asset: string, position: number): Promise<RiskPosition> {
        // Attempt to create a new risk position
        try {
            const newPosition: RiskPosition = { id: this.generateId(), asset, position };
            // Validate the new position using Zod schema
            const validationResult = RiskPositionSchema.safeParse(newPosition);
            if (!validationResult.success) {
                throw new ValidationError('Invalid risk position data: ' + validationResult.error.errors);
            }
            // Store the new risk position
            const createdPosition = await this.storage.create(newPosition);
            // Notify other services about the new position
            await notifyEventBus({ type: 'RiskPositionCreated', position: createdPosition });
            return createdPosition;
        } catch (error) {
            if (error instanceof ValidationError) {
                logger.warn('Validation error while creating risk position:', error.message);
                throw error;
            }
            logger.error('Error creating risk position:', error);
            throw new ServiceError('Error creating risk position.'); // Log and handle unexpected errors
        }
    }

    async deleteRiskPosition(id: OrderId): Promise<boolean> {
        // Attempt to delete a risk position
        try {
            const deleted = await this.storage.delete(id);
            if (!deleted) {
                throw new NotFoundError('Risk position not found.'); // Handle case where position is not found
            }
            // Notify other services about the deletion
            await notifyEventBus({ type: 'RiskPositionDeleted', id });
            return true;
        } catch (error) {
            if (error instanceof NotFoundError) {
                logger.warn('Attempted to delete non-existing risk position:', id);
                throw error;
            }
            logger.error('Error deleting risk position:', error);
            throw new ServiceError('Error deleting risk position.'); // Log and handle unexpected errors
        }
    }

    private generateId(): OrderId {
        // Generate a unique ID for the risk position
        return Math.random().toString(36).substr(2, 9) as OrderId;
    }
}