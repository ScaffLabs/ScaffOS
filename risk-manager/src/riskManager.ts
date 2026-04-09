import { RiskPosition, RiskPositionSchema, OrderId } from './sharedTypes';
import { RiskPositionStorage } from './storage';
import logger from './logger';
import { ValidationError, NotFoundError } from './errors';
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

    /**
     * Sets a position limit for a specific asset.
     * @param asset - The asset for which the limit is being set.
     * @param limit - The maximum allowable position size.
     */
    async setPositionLimit(asset: string, limit: number): Promise<void> {
        this.positionLimits.setLimit(asset, limit);
        logger.info(`Set position limit for ${asset}: ${limit}`);
    }

    /**
     * Retrieves risk positions with pagination, filtering, and sorting.
     * @param limit - The maximum number of positions to retrieve.
     * @param offset - The starting point for retrieval.
     * @param sort - Optional sorting criteria ('asc' or 'desc').
     * @param filter - Optional filter string for asset names.
     * @returns An array of risk positions.
     */
    async getRiskPositions(limit: number, offset: number, sort?: string, filter?: string): Promise<RiskPosition[]> {
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
    }

    /**
     * Creates a new risk position.
     * @param asset - The asset for the new risk position.
     * @param position - The size of the new risk position.
     * @returns The created risk position.
     * @throws ValidationError if the position exceeds limits or is invalid.
     */
    async createRiskPosition(asset: string, position: number): Promise<RiskPosition> {
        if (!this.positionLimits.checkLimit(asset, position)) {
            throw new ValidationError(`Position exceeds limit for asset: ${asset}`);
        }
        const newPosition: RiskPosition = { id: this.generateId(), asset, position };
        const validationResult = RiskPositionSchema.safeParse(newPosition);
        if (!validationResult.success) {
            throw new ValidationError(`Invalid risk position data: ${validationResult.error.errors}`);
        }
        const createdPosition = await this.storage.create(newPosition);
        logger.info(`Created new risk position: ${JSON.stringify(createdPosition)}`);
        return createdPosition;
    }

    /**
     * Updates an existing risk position.
     * @param id - The ID of the risk position to update.
     * @param position - The new position size.
     * @returns The updated risk position.
     * @throws NotFoundError if the position does not exist.
     * @throws ValidationError if the new position exceeds limits or is invalid.
     */
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
            throw new ValidationError(`Invalid risk position data: ${validationResult.error.errors}`);
        }
        const result = await this.storage.update(id, updatedPosition);
        logger.info(`Updated risk position with id ${id}: ${JSON.stringify(result)}`);
        return result;
    }

    /**
     * Deletes a risk position by its ID.
     * @param id - The ID of the risk position to delete.
     * @returns True if deletion was successful.
     * @throws NotFoundError if the position does not exist.
     */
    async deleteRiskPosition(id: OrderId): Promise<boolean> {
        const deleted = await this.storage.delete(id);
        if (!deleted) {
            throw new NotFoundError(`Risk position with id ${id} not found.`);
        }
        logger.info(`Deleted risk position with id: ${id}`);
        return true;
    }

    /**
     * Generates a unique ID for a new risk position.
     * @returns A new OrderId.
     */
    private generateId(): OrderId {
        return Math.random().toString(36).substr(2, 9) as OrderId;
    }
}