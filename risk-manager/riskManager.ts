import { RiskPosition, RiskPositionSchema } from './sharedTypes';
import { RiskPositionStorage } from './storage';
import logger from './logger';

export default class RiskManager {
    private storage: RiskPositionStorage;

    constructor() {
        this.storage = new RiskPositionStorage();
    }

    /**
     * Retrieves risk positions with optional pagination, filtering, and sorting.
     * @param limit - Number of items to return.
     * @param offset - Number of items to skip.
     * @param sort - Field to sort the results.
     * @param filter - Filter applied to asset.
     * @returns A list of risk positions.
     */
    async getRiskPositions(limit: number, offset: number, sort?: string, filter?: string) {
        let positions = await this.storage.findAll(limit, offset);
        if (filter) {
            positions = positions.filter(pos => pos.asset.includes(filter));
        }
        if (sort) {
            positions.sort((a, b) => a[sort] > b[sort] ? 1 : -1);
        }
        return positions;
    }

    /**
     * Creates a new risk position.
     * @param asset - The asset for the risk position.
     * @param position - The position size.
     * @returns The newly created risk position.
     */
    async createRiskPosition(asset: string, position: number) {
        const newPosition: RiskPosition = { id: this.generateId() as OrderId, asset, position };
        const validationResult = RiskPositionSchema.safeParse(newPosition);
        if (!validationResult.success) {
            logger.error('Invalid risk position data: ' + validationResult.error);
            throw new Error('Invalid risk position data: ' + validationResult.error);
        }
        return this.storage.create(newPosition);
    }

    /**
     * Updates an existing risk position.
     * @param id - The ID of the risk position to update.
     * @param position - The new position size.
     * @returns The updated risk position or null if not found.
     */
    async updateRiskPosition(id: string, position: number) {
        const existingPosition = await this.storage.read(id);
        if (!existingPosition) {
            logger.warn(`Risk position not found for update: ${id}`);
            return null;
        }

        const updatedPosition: RiskPosition = { ...existingPosition, position };
        const validationResult = RiskPositionSchema.safeParse(updatedPosition);
        if (!validationResult.success) {
            logger.error('Invalid risk position data for update: ' + validationResult.error);
            throw new Error('Invalid risk position data: ' + validationResult.error);
        }

        return this.storage.update(id, updatedPosition);
    }

    /**
     * Deletes a risk position.
     * @param id - The ID of the risk position to delete.
     * @returns True if the position was deleted, false otherwise.
     */
    async deleteRiskPosition(id: string) {
        return this.storage.delete(id);
    }

    /**
     * Generates a unique ID for a risk position.
     * @returns A new unique ID as a string.
     */
    private generateId(): OrderId {
        return Math.random().toString(36).substr(2, 9) as OrderId;
    }
}