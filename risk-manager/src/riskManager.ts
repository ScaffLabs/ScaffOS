import { RiskPosition, RiskPositionSchema, OrderId } from './sharedTypes';
import { RiskPositionStorage } from './storage';
import logger from './logger';
import { ValidationError, NotFoundError } from './errors';
import { PositionLimits } from './positionLimits';

export default class RiskManager {
    private storage: RiskPositionStorage;
    private positionLimits: PositionLimits;

    constructor(storage: RiskPositionStorage) {
        this.storage = storage;
        this.positionLimits = new PositionLimits();
    }

    async createRiskPosition(asset: string, position: number): Promise<RiskPosition> {
        const validationResult = RiskPositionSchema.safeParse({
            id: this.generateId(),
            asset,
            position,
        });
        if (!validationResult.success) {
            logger.warn(`Validation failed for createRiskPosition: ${JSON.stringify(validationResult.error.errors)}`);
            throw new ValidationError(`Invalid risk position data: ${JSON.stringify(validationResult.error.errors)}`);
        }
        const newPosition = validationResult.data;
        if (!this.positionLimits.checkLimit(asset, position)) {
            logger.warn(`Position exceeds limit for asset: ${asset}`);
            throw new ValidationError(`Position exceeds limit for asset: ${asset}`);
        }
        const createdPosition = await this.storage.create(newPosition);
        logger.info(`Created new risk position: ${JSON.stringify(createdPosition)}`);
        return createdPosition;
    }

    async updateRiskPosition(id: OrderId, position: number): Promise<RiskPosition | null> {
        const existingPosition = await this.storage.read(id);
        if (!existingPosition) {
            logger.warn(`Risk position with id ${id} not found.`);
            throw new NotFoundError(`Risk position with id ${id} not found.`);
        }

        const updatedPosition: RiskPosition = { ...existingPosition, position };
        const validationResult = RiskPositionSchema.safeParse(updatedPosition);
        if (!validationResult.success) {
            logger.warn(`Validation failed for updateRiskPosition: ${JSON.stringify(validationResult.error.errors)}`);
            throw new ValidationError(`Invalid risk position data: ${JSON.stringify(validationResult.error.errors)}`);
        }

        if (!this.positionLimits.checkLimit(updatedPosition.asset, updatedPosition.position)) {
            logger.warn(`Position exceeds limit for asset: ${updatedPosition.asset}`);
            throw new ValidationError(`Position exceeds limit for asset: ${updatedPosition.asset}`);
        }

        return await this.storage.update(id, updatedPosition);
    }

    async deleteRiskPosition(id: OrderId): Promise<boolean> {
        const existingPosition = await this.storage.read(id);
        if (!existingPosition) {
            logger.warn(`Risk position with id ${id} not found during deletion.`);
            throw new NotFoundError(`Risk position with id ${id} not found.`);
        }
        return await this.storage.delete(id);
    }

    private generateId(): OrderId {
        return Math.random().toString(36).substr(2, 9) as OrderId;
    }
}