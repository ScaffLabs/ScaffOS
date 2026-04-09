import { RiskPosition, RiskPositionSchema, OrderId } from './sharedTypes';
import { RiskPositionStorage } from './storage';
import logger from './logger';
import { ValidationError, NotFoundError, ServiceError } from './errors';
import { PositionLimits } from './positionLimits';

/**
 * Manages risk positions within the trading system.
 */
export default class RiskManager {
    private storage: RiskPositionStorage;
    private positionLimits: PositionLimits;

    constructor(storage: RiskPositionStorage) {
        this.storage = storage;
        this.positionLimits = new PositionLimits();
    }

    async setPositionLimit(asset: string, limit: number): Promise<void> {
        this.positionLimits.setLimit(asset, limit);
        logger.info(`Set position limit for ${asset}: ${limit}`);
    }

    async getRiskPositions(limit: number, offset: number, sort?: string, filter?: string): Promise<RiskPosition[]> {
        try {
            const positions = await this.storage.findAll(limit, offset);
            let filteredPositions = positions;

            if (filter) {
                filteredPositions = filteredPositions.filter(position => position.asset.includes(filter));
            }

            if (sort) {
                filteredPositions.sort((a, b) => {
                    return sort === 'asc' ? a.position - b.position : b.position - a.position;
                });
            }
            logger.info(`Retrieved ${filteredPositions.length} risk positions`);
            return filteredPositions;
        } catch (error) {
            logger.error('Error retrieving risk positions:', error);
            throw new ServiceError('Error retrieving risk positions.');
        }
    }

    async createRiskPosition(asset: string, position: number): Promise<RiskPosition> {
        if (!this.positionLimits.checkLimit(asset, position)) {
            throw new ValidationError(`Position exceeds limit for asset: ${asset}`);
        }
        const newPosition: RiskPosition = { id: this.generateId(), asset, position };
        const validationResult = RiskPositionSchema.safeParse(newPosition);
        if (!validationResult.success) {
            throw new ValidationError(`Invalid risk position data: ${JSON.stringify(validationResult.error.errors)}`);
        }
        try {
            const createdPosition = await this.storage.create(newPosition);
            logger.info(`Created new risk position: ${JSON.stringify(createdPosition)}`);
            return createdPosition;
        } catch (error) {
            logger.error('Error creating risk position:', error);
            throw new ServiceError('Error creating risk position.');
        }
    }

    async updateRiskPosition(id: OrderId, position: number): Promise<RiskPosition | null> {
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
        try {
            const result = await this.storage.update(id, updatedPosition);
            logger.info(`Updated risk position with id ${id}: ${JSON.stringify(result)}`);
            return result;
        } catch (error) {
            logger.error('Error updating risk position:', error);
            throw new ServiceError('Error updating risk position.');
        }
    }

    async deleteRiskPosition(id: OrderId): Promise<boolean> {
        const deleted = await this.storage.delete(id);
        if (!deleted) {
            throw new NotFoundError(`Risk position with id ${id} not found.`);
        }
        logger.info(`Deleted risk position with id: ${id}`);
        return true;
    }

    private generateId(): OrderId {
        return Math.random().toString(36).substr(2, 9) as OrderId;
    }
}