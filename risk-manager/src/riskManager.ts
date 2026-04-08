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
            const newPosition: RiskPosition = { id: this.generateId(), asset, position };
            const validationResult = RiskPositionSchema.safeParse(newPosition);
            if (!validationResult.success) {
                throw new ValidationError('Invalid risk position data: ' + validationResult.error.errors);
            }
            const createdPosition = await this.storage.create(newPosition);
            await notifyEventBus({ type: 'RiskPositionCreated', position: createdPosition });
            return createdPosition;
        } catch (error) {
            if (error instanceof ValidationError) {
                logger.warn('Validation error while creating risk position:', error.message);
                throw error;
            }
            logger.error('Error creating risk position:', error);
            throw new ServiceError('Error creating risk position.');
        }
    }

    async deleteRiskPosition(id: OrderId): Promise<boolean> {
        try {
            const deleted = await this.storage.delete(id);
            if (!deleted) {
                throw new NotFoundError('Risk position not found.');
            }
            await notifyEventBus({ type: 'RiskPositionDeleted', id });
            return true;
        } catch (error) {
            if (error instanceof NotFoundError) {
                logger.warn('Attempted to delete non-existing risk position:', id);
                throw error;
            }
            logger.error('Error deleting risk position:', error);
            throw new ServiceError('Error deleting risk position.');
        }
    }

    private generateId(): OrderId {
        return Math.random().toString(36).substr(2, 9) as OrderId;
    }
}