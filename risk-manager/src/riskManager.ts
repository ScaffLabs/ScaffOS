import { RiskPosition, RiskPositionSchema, OrderId } from './sharedTypes';
import { RiskPositionStorage } from './storage';
import logger from './logger';
import { ServiceError, ValidationError, NotFoundError } from './errors';
import { notifyEventBus } from './externalService';

export default class RiskManager {
    private storage: RiskPositionStorage;

    constructor(storage: RiskPositionStorage) {
        this.storage = storage; // Initialize storage for risk positions
    }

    async createRiskPosition(asset: string, position: number): Promise<RiskPosition> {
        try {
            const newPosition: RiskPosition = { id: this.generateId(), asset, position }; // Create new risk position data
            const validationResult = RiskPositionSchema.safeParse(newPosition); // Validate the new position data
            if (!validationResult.success) {
                throw new ValidationError('Invalid risk position data: ' + validationResult.error.errors);
            }
            const createdPosition = await this.storage.create(newPosition); // Store the new risk position
            await notifyEventBus({ type: 'RiskPositionCreated', position: createdPosition }); // Notify event bus
            return createdPosition;
        } catch (error) {
            if (error instanceof ValidationError) {
                throw error;
            }
            throw new ServiceError('Error creating risk position.');
        }
    }

    async deleteRiskPosition(id: OrderId): Promise<boolean> {
        try {
            const deleted = await this.storage.delete(id); // Attempt to delete the risk position
            if (!deleted) {
                throw new NotFoundError('Risk position not found.');
            }
            await notifyEventBus({ type: 'RiskPositionDeleted', id }); // Notify event bus
            return true; // Return success
        } catch (error) {
            throw new ServiceError('Error deleting risk position.');
        }
    }

    private generateId(): OrderId {
        return Math.random().toString(36).substr(2, 9) as OrderId; // Generate a random ID for risk positions
    }
}