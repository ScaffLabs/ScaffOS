import { RiskPosition, RiskPositionSchema, OrderId } from './sharedTypes';
import { RiskPositionStorage } from './storage';
import logger from './logger';
import { ServiceError, ValidationError, NotFoundError } from './errors';

export default class RiskManager {
    private storage: RiskPositionStorage;

    constructor(storage: RiskPositionStorage) {
        this.storage = storage;
    }

    async getRiskPositions(limit: number, offset: number, sort?: string, filter?: string): Promise<RiskPosition[]> {
        try {
            let positions = await this.storage.findAll(limit, offset);
            if (filter) {
                positions = positions.filter(pos => pos.asset.includes(filter));
            }
            if (sort) {
                positions.sort((a, b) => a.asset.localeCompare(b.asset));
            }
            return positions;
        } catch (error) {
            throw new ServiceError('Error retrieving risk positions.');
        }
    }

    async createRiskPosition(asset: string, position: number): Promise<RiskPosition> {
        try {
            const newPosition: RiskPosition = { id: this.generateId(), asset, position };
            const validationResult = RiskPositionSchema.safeParse(newPosition);
            if (!validationResult.success) {
                throw new ValidationError('Invalid risk position data: ' + validationResult.error.errors);
            }
            return await this.storage.create(newPosition);
        } catch (error) {
            if (error instanceof ValidationError) {
                throw error;
            }
            throw new ServiceError('Error creating risk position.');
        }
    }

    async updateRiskPosition(id: OrderId, position: number): Promise<RiskPosition | null> {
        try {
            const existingPosition = await this.storage.read(id);
            if (!existingPosition) {
                throw new NotFoundError('Risk position not found.');
            }

            const updatedPosition: RiskPosition = { ...existingPosition, position };
            const validationResult = RiskPositionSchema.safeParse(updatedPosition);
            if (!validationResult.success) {
                throw new ValidationError('Invalid risk position data: ' + validationResult.error.errors);
            }

            return await this.storage.update(id, updatedPosition);
        } catch (error) {
            if (error instanceof NotFoundError) {
                throw error;
            }
            throw new ServiceError('Error updating risk position.');
        }
    }

    async deleteRiskPosition(id: OrderId): Promise<boolean> {
        try {
            const deleted = await this.storage.delete(id);
            if (!deleted) {
                throw new NotFoundError('Risk position not found.');
            }
            return true;
        } catch (error) {
            throw new ServiceError('Error deleting risk position.');
        }
    }

    private generateId(): OrderId {
        return Math.random().toString(36).substr(2, 9) as OrderId;
    }
}