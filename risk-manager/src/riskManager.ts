import { RiskPosition, OrderId } from './sharedTypes';
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
        return await this.storage.transaction(async (storage) => {
            const newPosition = { id: this.generateId(), asset, position };
            if (!this.positionLimits.checkLimit(asset, position)) {
                throw new ValidationError(`Position exceeds limit for asset: ${asset}`);
            }
            const createdPosition = await storage.create(newPosition);
            logger.info(`Created new risk position: ${JSON.stringify(createdPosition)}`);
            riskAlerting.triggerRiskAlert({ type: 'RiskPositionCreated', position: createdPosition });
            return createdPosition;
        });
    }

    async updateRiskPosition(id: OrderId, position: number): Promise<RiskPosition | null> {
        return await this.storage.transaction(async (storage) => {
            const existingPosition = await storage.read(id);
            if (!existingPosition) {
                throw new NotFoundError(`Risk position with id ${id} not found.`);
            }
            const updatedPosition = { ...existingPosition, position };
            if (!this.positionLimits.checkLimit(updatedPosition.asset, updatedPosition.position)) {
                throw new ValidationError(`Position exceeds limit for asset: ${updatedPosition.asset}`);
            }
            const updatedResult = await storage.update(id, updatedPosition);
            logger.info(`Updated risk position with id: ${id}`);
            riskAlerting.triggerRiskAlert({ type: 'RiskPositionUpdated', position: updatedResult });
            return updatedResult;
        });
    }

    async deleteRiskPosition(id: OrderId): Promise<boolean> {
        return await this.storage.transaction(async (storage) => {
            const existingPosition = await storage.read(id);
            if (!existingPosition) {
                throw new NotFoundError(`Risk position with id ${id} not found.`);
            }
            const deleted = await storage.delete(id);
            riskAlerting.triggerRiskAlert({ type: 'RiskPositionDeleted', id });
            return deleted;
        });
    }

    private generateId(): OrderId {
        return Math.random().toString(36).substr(2, 9) as OrderId;
    }
}