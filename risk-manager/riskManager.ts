import { RiskPosition, RiskPositionSchema, OrderId } from './sharedTypes';
import { RiskPositionStorage } from './storage';
import logger from './logger';
import { ServiceError, ValidationError, NotFoundError } from './errors';

export default class RiskManager {
    private storage: RiskPositionStorage;

    constructor(storage: RiskPositionStorage) {
        this.storage = storage;
    }

    async getRiskPositions(limit: number, offset: number): Promise<RiskPosition[]> {
        return this.storage.findAll(limit, offset);
    }

    async createRiskPosition(asset: string, position: number): Promise<RiskPosition> {
        const newPosition: RiskPosition = { id: this.generateId() as OrderId, asset, position };
        const validationResult = RiskPositionSchema.safeParse(newPosition);
        if (!validationResult.success) {
            logger.error('Invalid risk position data: ' + JSON.stringify(validationResult.error.errors));
            throw new ValidationError('Invalid risk position data: ' + validationResult.error.errors);
        }
        return this.storage.create(newPosition);
    }

    async updateRiskPosition(id: string, position: number): Promise<RiskPosition | null> {
        const existingPosition = await this.storage.read(id);
        if (!existingPosition) {
            logger.warn(`Risk position not found for update: ${id}`);
            throw new NotFoundError('Risk position not found.');
        }

        const updatedPosition: RiskPosition = { ...existingPosition, position };
        const validationResult = RiskPositionSchema.safeParse(updatedPosition);
        if (!validationResult.success) {
            logger.error('Invalid risk position data for update: ' + JSON.stringify(validationResult.error.errors));
            throw new ValidationError('Invalid risk position data: ' + validationResult.error.errors);
        }

        return this.storage.update(id, updatedPosition);
    }

    async deleteRiskPosition(id: string): Promise<boolean> {
        const deleted = await this.storage.delete(id);
        if (!deleted) {
            throw new NotFoundError('Risk position not found.');
        }
        return true;
    }

    private generateId(): OrderId {
        return Math.random().toString(36).substr(2, 9) as OrderId;
    }
}