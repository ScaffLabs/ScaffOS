import { RiskPosition, RiskPositionSchema } from './sharedTypes';
import { RiskPositionStorage } from './storage';
import logger from './logger';

export default class RiskManager {
    private storage: RiskPositionStorage;

    constructor() {
        this.storage = new RiskPositionStorage();
    }

    async getRiskPositions(limit: number, offset: number) {
        return this.storage.findAll(limit, offset);
    }

    async createRiskPosition(asset: string, position: number) {
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

        const updatedPosition = { ...existingPosition, position };
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
}