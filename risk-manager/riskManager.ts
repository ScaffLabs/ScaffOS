import { RiskPosition, RiskPositionSchema } from './sharedTypes';
import { RiskPositionStorage } from './storage';
import logger from './logger';
import { PositionLimits } from './positionLimits';

export default class RiskManager {
    private storage: RiskPositionStorage;
    private positionLimits: PositionLimits;

    constructor(storage: RiskPositionStorage) {
        this.storage = storage;
        this.positionLimits = new PositionLimits();
    }

    async getRiskPositions(limit: number, offset: number) {
        return this.storage.findAll(limit, offset);
    }

    async createRiskPosition(asset: string, position: number) {
        const limitCheck = this.positionLimits.checkLimit(asset, position);
        if (!limitCheck) {
            throw new Error(`Position exceeds limit for asset: ${asset}`);
        }

        const newPosition: RiskPosition = { id: this.generateId(), asset, position };
        const validationResult = RiskPositionSchema.safeParse(newPosition);
        if (!validationResult.success) {
            logger.error('Invalid risk position data: ' + validationResult.error);
            throw new Error('Invalid risk position data: ' + validationResult.error);
        }

        return this.storage.create(newPosition);
    }

    async updateRiskPosition(id: string, position: number) {
        const existingPosition = await this.storage.read(id);
        if (!existingPosition) {
            logger.warn(`Risk position not found for update: ${id}`);
            return null;
        }

        const limitCheck = this.positionLimits.checkLimit(existingPosition.asset, position);
        if (!limitCheck) {
            throw new Error(`Position exceeds limit for asset: ${existingPosition.asset}`);
        }

        const updatedPosition: RiskPosition = { ...existingPosition, position };
        const validationResult = RiskPositionSchema.safeParse(updatedPosition);
        if (!validationResult.success) {
            logger.error('Invalid risk position data for update: ' + validationResult.error);
            throw new Error('Invalid risk position data: ' + validationResult.error);
        }

        return this.storage.update(id, updatedPosition);
    }

    async deleteRiskPosition(id: string) {
        return this.storage.delete(id);
    }

    private generateId() {
        return Math.random().toString(36).substr(2, 9);
    }

    setPositionLimit(asset: string, limit: number) {
        this.positionLimits.setLimit(asset, limit);
    }
}