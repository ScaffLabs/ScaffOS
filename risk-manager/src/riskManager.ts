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
        try {
            // Create new risk position object with a unique ID
            const newPosition: RiskPosition = { id: this.generateId(), asset, position };
            // Validate the new position data against the schema
            const validationResult = RiskPositionSchema.safeParse(newPosition);
            if (!validationResult.success) {
                // If validation fails, throw a ValidationError
                throw new ValidationError('Invalid risk position data: ' + validationResult.error.errors);
            }
            // Store the new risk position in the storage
            const createdPosition = await this.storage.create(newPosition);
            // Notify the event bus about the new risk position
            await notifyEventBus({ type: 'RiskPositionCreated', position: createdPosition });
            return createdPosition;
        } catch (error) {
            if (error instanceof ValidationError) {
                throw error; // Propagate validation errors
            }
            // Log the error and throw a service error
            logger.error('Error creating risk position: ', error);
            throw new ServiceError('Error creating risk position.');
        }
    }

    async deleteRiskPosition(id: OrderId): Promise<boolean> {
        try {
            // Attempt to delete the risk position from storage
            const deleted = await this.storage.delete(id);
            if (!deleted) {
                // If deletion fails, throw a NotFoundError
                throw new NotFoundError('Risk position not found.');
            }
            // Notify the event bus about the deleted risk position
            await notifyEventBus({ type: 'RiskPositionDeleted', id });
            return true; // Return success status
        } catch (error) {
            if (error instanceof NotFoundError) {
                throw error; // Propagate not found errors
            }
            // Log the error and throw a service error
            logger.error('Error deleting risk position: ', error);
            throw new ServiceError('Error deleting risk position.');
        }
    }

    private generateId(): OrderId {
        // Generate a random ID for risk positions using base-36 encoding
        return Math.random().toString(36).substr(2, 9) as OrderId;
    }
}