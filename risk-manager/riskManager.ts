import { RiskPosition, RiskPositionSchema, OrderId } from './sharedTypes';
import { RiskPositionStorage } from './storage';
import logger from './logger';

export default class RiskManager {
    private storage: RiskPositionStorage;

    constructor(storage: RiskPositionStorage) {
        this.storage = storage;
    }

    /**
     * Retrieve risk positions with optional pagination.
     * @param limit - Maximum number of positions to retrieve.
     * @param offset - Number of positions to skip.
     * @returns - List of risk positions.
     */
    async getRiskPositions(limit: number, offset: number): Promise<RiskPosition[]> {
        return this.storage.findAll(limit, offset);
    }

    /**
     * Create a new risk position.
     * @param asset - The asset for the risk position.
     * @param position - The size of the position.
     * @returns - The created risk position.
     * @throws Will throw an error if validation fails or if the position exceeds limits.
     */
    async createRiskPosition(asset: string, position: number): Promise<RiskPosition> {
        const newPosition: RiskPosition = { id: this.generateId() as OrderId, asset, position };
        const validationResult = RiskPositionSchema.safeParse(newPosition);
        if (!validationResult.success) {
            logger.error('Invalid risk position data: ' + JSON.stringify(validationResult.error));
            throw new Error('Invalid risk position data: ' + validationResult.error);
        }

        return this.storage.create(newPosition);
    }

    /**
     * Update an existing risk position.
     * @param id - The ID of the risk position to update.
     * @param position - The new position size.
     * @returns - The updated risk position or null if not found.
     * @throws Will throw an error if validation fails or if the position exceeds limits.
     */
    async updateRiskPosition(id: string, position: number): Promise<RiskPosition | null> {
        const existingPosition = await this.storage.read(id);
        if (!existingPosition) {
            logger.warn(`Risk position not found for update: ${id}`);
            return null;
        }

        const updatedPosition: RiskPosition = { ...existingPosition, position };
        const validationResult = RiskPositionSchema.safeParse(updatedPosition);
        if (!validationResult.success) {
            logger.error('Invalid risk position data for update: ' + JSON.stringify(validationResult.error));
            throw new Error('Invalid risk position data: ' + validationResult.error);
        }

        return this.storage.update(id, updatedPosition);
    }

    async deleteRiskPosition(id: string): Promise<boolean> {
        return this.storage.delete(id);
    }

    private generateId(): string {
        return Math.random().toString(36).substr(2, 9);
    }
}