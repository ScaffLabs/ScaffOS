import { RiskPosition, RiskPositionSchema, OrderId } from './sharedTypes';
import { RiskPositionStorage } from './storage';
import logger from './logger';
import { ServiceError, ValidationError, NotFoundError } from './errors';
import { PositionLimits } from './positionLimits';

export default class RiskManager {
    private storage: RiskPositionStorage;
    private positionLimits: PositionLimits;

    constructor(storage: RiskPositionStorage) {
        this.storage = storage;
        this.positionLimits = new PositionLimits(); // Initialize PositionLimits
    }

    async setPositionLimit(asset: string, limit: number): Promise<void> {
        this.positionLimits.setLimit(asset, limit);
    }

    async createRiskPosition(asset: string, position: number): Promise<RiskPosition> {
        try {
            if (!this.positionLimits.checkLimit(asset, position)) {
                throw new ValidationError('Position exceeds limit for asset: ' + asset);
            }
            const newPosition: RiskPosition = { id: this.generateId(), asset, position };
            const validationResult = RiskPositionSchema.safeParse(newPosition);
            if (!validationResult.success) {
                throw new ValidationError('Invalid risk position data: ' + validationResult.error.errors);
            }
            const createdPosition = await this.storage.create(newPosition);
            logger.info('Created new risk position', createdPosition);
            return createdPosition;
        } catch (error) {
            if (error instanceof ValidationError) {
                throw error;
            }
            logger.error('Error creating risk position: ', error);
            throw new ServiceError('Error creating risk position.');
        }
    }

    async updateRiskPosition(id: string, position: number): Promise<RiskPosition | null> {
        try {
            const existingPosition = await this.storage.read(id);
            if (!existingPosition) {
                throw new NotFoundError('Risk position not found.');
            }
            if (!this.positionLimits.checkLimit(existingPosition.asset, position)) {
                throw new ValidationError('Position exceeds limit for asset: ' + existingPosition.asset);
            }
            const updatedPosition: RiskPosition = { ...existingPosition, position };
            const validationResult = RiskPositionSchema.safeParse(updatedPosition);
            if (!validationResult.success) {
                throw new ValidationError('Invalid risk position data: ' + validationResult.error.errors);
            }
            const result = await this.storage.update(id, updatedPosition);
            logger.info('Updated risk position', result);
            return result;
        } catch (error) {
            logger.error('Error updating risk position: ', error);
            throw error;
        }
    }

    async deleteRiskPosition(id: OrderId): Promise<boolean> {
        try {
            const deleted = await this.storage.delete(id);
            if (!deleted) {
                throw new NotFoundError('Risk position not found.');
            }
            logger.info('Deleted risk position with id:', id);
            return true;
        } catch (error) {
            logger.error('Error deleting risk position: ', error);
            throw new ServiceError('Error deleting risk position.');
        }
    }

    private generateId(): OrderId {
        return Math.random().toString(36).substr(2, 9) as OrderId;
    }
}