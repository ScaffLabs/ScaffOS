import { RiskPosition, RiskPositionSchema, OrderId } from './sharedTypes';
import { RiskPositionStorage } from './storage';
import logger from './logger';
import { ValidationError, NotFoundError } from './errors';
import { PositionLimits } from './positionLimits';
import { riskAlerting } from './riskAlerting';

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
            throw new ValidationError(`Invalid risk position data: ${JSON.stringify(validationResult.error.errors)}`);
        }
        const newPosition = validationResult.data;
        if (!this.positionLimits.checkLimit(asset, position)) {
            throw new ValidationError(`Position exceeds limit for asset: ${asset}`);
        }
        const createdPosition = await this.storage.create(newPosition);
        logger.info(`Created new risk position: ${JSON.stringify(createdPosition)}`);
        riskAlerting.triggerRiskAlert({ type: 'RiskPositionCreated', position: createdPosition });
        return createdPosition;
    }

    async updateRiskPosition(id: OrderId, position: number): Promise<RiskPosition | null> {
        const existingPosition = await this.storage.read(id);
        if (!existingPosition) {
            throw new NotFoundError(`Risk position with id ${id} not found.`);
        }

        const updatedPosition: RiskPosition = { ...existingPosition, position };
        const validationResult = RiskPositionSchema.safeParse(updatedPosition);
        if (!validationResult.success) {
            throw new ValidationError(`Invalid risk position data: ${JSON.stringify(validationResult.error.errors)}`);
        }

        if (!this.positionLimits.checkLimit(updatedPosition.asset, updatedPosition.position)) {
            throw new ValidationError(`Position exceeds limit for asset: ${updatedPosition.asset}`);
        }

        const updatedResult = await this.storage.update(id, updatedPosition);
        logger.info(`Updated risk position with id: ${id}`);
        riskAlerting.triggerRiskAlert({ type: 'RiskPositionUpdated', position: updatedResult });
        return updatedResult;
    }

    async deleteRiskPosition(id: OrderId): Promise<boolean> {
        const existingPosition = await this.storage.read(id);
        if (!existingPosition) {
            throw new NotFoundError(`Risk position with id ${id} not found.`);
        }
        const deleted = await this.storage.delete(id);
        riskAlerting.triggerRiskAlert({ type: 'RiskPositionDeleted', id });
        return deleted;
    }

    private generateId(): OrderId {
        return Math.random().toString(36).substr(2, 9) as OrderId;
    }
}