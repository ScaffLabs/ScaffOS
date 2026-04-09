import { RiskPosition, RiskPositionSchema, OrderId, RiskEvent, RiskEventSchema } from './sharedTypes';
import { RiskPositionStorage } from './storage';
import logger from './logger';
import { ServiceError, ValidationError, NotFoundError } from './errors';
import { PositionLimits } from './positionLimits';
import MemoryQueue from './memoryQueue';

export default class RiskManager {
    private storage: RiskPositionStorage;
    private positionLimits: PositionLimits;

    constructor(storage: RiskPositionStorage) {
        this.storage = storage;
        this.positionLimits = new PositionLimits();
    }

    async setPositionLimit(asset: string, limit: number): Promise<void> {
        this.positionLimits.setLimit(asset, limit);
    }

    async createRiskPosition(asset: string, position: number): Promise<RiskPosition> {
        if (!this.positionLimits.checkLimit(asset, position)) {
            const message = 'Position exceeds limit for asset: ' + asset;
            logger.warn(message);
            MemoryQueue.enqueue({ type: 'RiskPositionLimitExceeded', asset, attemptedPosition: position });
            throw new ValidationError(message);
        }
        const newPosition: RiskPosition = { id: this.generateId(), asset, position };
        const validationResult = RiskPositionSchema.safeParse(newPosition);
        if (!validationResult.success) {
            throw new ValidationError('Invalid risk position data: ' + validationResult.error.errors);
        }
        const createdPosition = await this.storage.create(newPosition);
        logger.info('Created new risk position', createdPosition);

        // Emit an event for the created position
        MemoryQueue.enqueue({ type: 'RiskPositionCreated', position: createdPosition });

        return createdPosition;
    }

    async updateRiskPosition(id: OrderId, position: number): Promise<RiskPosition | null> {
        const existingPosition = await this.storage.read(id);
        if (!existingPosition) {
            throw new NotFoundError('Risk position not found.');
        }
        if (!this.positionLimits.checkLimit(existingPosition.asset, position)) {
            const message = 'Position exceeds limit for asset: ' + existingPosition.asset;
            logger.warn(message);
            MemoryQueue.enqueue({ type: 'RiskPositionLimitExceeded', asset: existingPosition.asset, attemptedPosition: position });
            throw new ValidationError(message);
        }
        const updatedPosition: RiskPosition = { ...existingPosition, position };
        const validationResult = RiskPositionSchema.safeParse(updatedPosition);
        if (!validationResult.success) {
            throw new ValidationError('Invalid risk position data: ' + validationResult.error.errors);
        }
        const result = await this.storage.update(id, updatedPosition);
        logger.info('Updated risk position', result);

        // Emit an event for the updated position
        MemoryQueue.enqueue({ type: 'RiskPositionUpdated', position: updatedPosition });

        return result;
    }

    async deleteRiskPosition(id: OrderId): Promise<boolean> {
        const deleted = await this.storage.delete(id);
        if (!deleted) {
            throw new NotFoundError('Risk position not found.');
        }
        logger.info('Deleted risk position with id:', id);

        // Emit an event for deletion
        MemoryQueue.enqueue({ type: 'RiskPositionDeleted', id });

        return true;
    }

    private generateId(): OrderId {
        return Math.random().toString(36).substr(2, 9) as OrderId;
    }
}