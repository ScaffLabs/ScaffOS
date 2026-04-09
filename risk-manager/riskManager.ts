import { RiskPosition, RiskPositionSchema, OrderId, RiskEvent, RiskEventSchema } from './sharedTypes';
import { RiskPositionStorage } from './storage';
import logger from './logger';
import { ServiceError, ValidationError, NotFoundError } from './errors';
import { PositionLimits } from './positionLimits';

export default class RiskManager {
    private storage: RiskPositionStorage;
    private positionLimits: PositionLimits;

    constructor(storage: RiskPositionStorage) {
        this.storage = storage;
        this.positionLimits = new PositionLimits();
    }

    async createRiskPosition(asset: string, position: number): Promise<RiskPosition> {
        if (!this.positionLimits.checkLimit(asset, position)) {
            const event: RiskEvent = { type: 'RiskPositionLimitExceeded', asset, attemptedPosition: position };
            logger.warn('Risk position limit exceeded', event);
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
    }

    async updateRiskPosition(id: OrderId, position: number): Promise<RiskPosition | null> {
        const existingPosition = await this.storage.read(id);
        if (!existingPosition) {
            throw new NotFoundError('Risk position not found.');
        }
        if (!this.positionLimits.checkLimit(existingPosition.asset, position)) {
            const event: RiskEvent = { type: 'RiskPositionLimitExceeded', asset: existingPosition.asset, attemptedPosition: position };
            logger.warn('Risk position limit exceeded on update', event);
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
    }

    private generateId(): OrderId {
        return Math.random().toString(36).substr(2, 9) as OrderId;
    }
}