import { RiskPosition, RiskPositionSchema, OrderId } from './sharedTypes';
import { RiskPositionStorage } from './storage';
import logger from './logger';
import { ValidationError, NotFoundError, ServiceError } from './errors';
import { PositionLimits } from './positionLimits';

export default class RiskManager {
    private storage: RiskPositionStorage;
    private positionLimits: PositionLimits;

    constructor(storage: RiskPositionStorage) {
        this.storage = storage;
        this.positionLimits = new PositionLimits();
    }

    async createRiskPosition(asset: string, position: number): Promise<RiskPosition> {
        try {
            if (!this.positionLimits.checkLimit(asset, position)) {
                throw new ValidationError(`Position exceeds limit for asset: ${asset}`);
            }
            const newPosition: RiskPosition = { id: this.generateId(), asset, position };
            const validationResult = RiskPositionSchema.safeParse(newPosition);
            if (!validationResult.success) {
                throw new ValidationError(`Invalid risk position data: ${JSON.stringify(validationResult.error.errors)}`);
            }
            const createdPosition = await this.storage.create(newPosition);
            logger.info(`Created new risk position: ${JSON.stringify(createdPosition)}`);
            return createdPosition;
        } catch (error) {
            logger.error('Error creating risk position:', error);
            throw new ServiceError('Error creating risk position.');
        }
    }

    async updateRiskPosition(id: OrderId, position: number): Promise<RiskPosition | null> {
        try {
            const existingPosition = await this.storage.read(id);
            if (!existingPosition) {
                throw new NotFoundError(`Risk position with id ${id} not found.`);
            }
            if (!this.positionLimits.checkLimit(existingPosition.asset, position)) {
                throw new ValidationError(`Position exceeds limit for asset: ${existingPosition.asset}`);
            }
            const updatedPosition: RiskPosition = { ...existingPosition, position };
            const validationResult = RiskPositionSchema.safeParse(updatedPosition);
            if (!validationResult.success) {
                throw new ValidationError(`Invalid risk position data: ${JSON.stringify(validationResult.error.errors)}`);
            }
            const result = await this.storage.update(id, updatedPosition);
            logger.info(`Updated risk position with id ${id}: ${JSON.stringify(result)}`);
            return result;
        } catch (error) {
            logger.error('Error updating risk position:', error);
            throw new ServiceError('Error updating risk position.');
        }
    }

    // Other methods remain unchanged
}