import { RiskPosition, RiskPositionSchema, OrderId } from './sharedTypes';
import { RiskPositionStorage } from './storage';
import logger from './logger';
import { ServiceError, ValidationError, NotFoundError } from './errors';

export default class RiskManager {
    private storage: RiskPositionStorage;

    constructor(storage: RiskPositionStorage) {
        this.storage = storage;  // Initialize storage for risk positions
    }

    /**
     * Retrieves risk positions with pagination.
     * @param limit - Maximum number of risk positions to retrieve.
     * @param offset - Number of risk positions to skip.
     * @returns A promise that resolves to an array of RiskPosition.
     * @throws ServiceError if retrieval fails.
     */
    async getRiskPositions(limit: number, offset: number): Promise<RiskPosition[]> {
        try {
            return await this.storage.findAll(limit, offset);
        } catch (error) {
            throw new ServiceError('Error retrieving risk positions.');
        }
    }

    /**
     * Creates a new risk position.
     * @param asset - The asset for the risk position.
     * @param position - The size of the position (must be non-negative).
     * @returns A promise that resolves to the newly created RiskPosition.
     * @throws ValidationError if the provided data is invalid.
     * @throws ServiceError if creation fails.
     */
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

    /**
     * Updates an existing risk position.
     * @param id - The unique identifier of the risk position to update.
     * @param position - The new size of the position (must be non-negative).
     * @returns A promise that resolves to the updated RiskPosition or null if not found.
     * @throws NotFoundError if the position is not found.
     * @throws ValidationError if the updated data is invalid.
     * @throws ServiceError if the update fails.
     */
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

    /**
     * Deletes a risk position by its ID.
     * @param id - The unique identifier of the risk position to delete.
     * @returns A promise that resolves to true if deletion was successful, false otherwise.
     * @throws NotFoundError if the position is not found.
     * @throws ServiceError if deletion fails.
     */
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

    /**
     * Generates a unique ID for a risk position.
     * @returns A branded OrderId.
     */
    private generateId(): OrderId {
        return Math.random().toString(36).substr(2, 9) as OrderId;
    }
}