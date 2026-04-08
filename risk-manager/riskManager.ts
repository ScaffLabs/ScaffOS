import { RiskPosition, RiskPositionSchema, OrderId } from './sharedTypes';
import { RiskPositionStorage } from './storage';
import logger from './logger';
import { ServiceError, ValidationError, NotFoundError } from './errors';

export default class RiskManager {
    private storage: RiskPositionStorage;

    constructor(storage: RiskPositionStorage) {
        this.storage = storage; // Initialize storage for risk positions
    }

    async getRiskPositions(limit: number, offset: number): Promise<RiskPosition[]> {
        try {
            return await this.storage.findAll(limit, offset); // Fetch risk positions with pagination
        } catch (error) {
            throw new ServiceError('Error retrieving risk positions.'); // Handle service errors
        }
    }

    async createRiskPosition(asset: string, position: number): Promise<RiskPosition> {
        try {
            const newPosition: RiskPosition = { id: this.generateId(), asset, position }; // Create new risk position data
            const validationResult = RiskPositionSchema.safeParse(newPosition); // Validate the new position data
            if (!validationResult.success) {
                throw new ValidationError('Invalid risk position data: ' + validationResult.error.errors); // Handle validation errors
            }
            return await this.storage.create(newPosition); // Store the new risk position
        } catch (error) {
            if (error instanceof ValidationError) {
                throw error; // Rethrow validation errors
            }
            throw new ServiceError('Error creating risk position.'); // Handle other errors
        }
    }

    async updateRiskPosition(id: string, position: number): Promise<RiskPosition | null> {
        try {
            const existingPosition = await this.storage.read(id); // Fetch existing risk position
            if (!existingPosition) {
                throw new NotFoundError('Risk position not found.'); // Handle not found errors
            }

            const updatedPosition: RiskPosition = { ...existingPosition, position }; // Create updated position data
            const validationResult = RiskPositionSchema.safeParse(updatedPosition); // Validate updated position data
            if (!validationResult.success) {
                throw new ValidationError('Invalid risk position data: ' + validationResult.error.errors); // Handle validation errors
            }

            return await this.storage.update(id, updatedPosition); // Store the updated risk position
        } catch (error) {
            if (error instanceof NotFoundError) {
                throw error; // Rethrow not found errors
            }
            throw new ServiceError('Error updating risk position.'); // Handle other errors
        }
    }

    async deleteRiskPosition(id: string): Promise<boolean> {
        try {
            const deleted = await this.storage.delete(id); // Attempt to delete the risk position
            if (!deleted) {
                throw new NotFoundError('Risk position not found.'); // Handle not found errors
            }
            return true; // Return success
        } catch (error) {
            throw new ServiceError('Error deleting risk position.'); // Handle service errors
        }
    }

    private generateId(): OrderId {
        return Math.random().toString(36).substr(2, 9) as OrderId; // Generate a random ID for risk positions
    }
}