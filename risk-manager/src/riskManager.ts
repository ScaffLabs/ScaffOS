import { ServiceError, ValidationError, NotFoundError } from './errors';

export default class RiskManager {
    // ... other methods 
    async createRiskPosition(asset: string, position: number) {
        try {
            const newPosition: RiskPosition = { id: this.generateId(), asset, position };
            const validationResult = RiskPositionSchema.safeParse(newPosition);
            if (!validationResult.success) {
                throw new ValidationError('Invalid risk position data: ' + validationResult.error);
            }
            return await this.storage.create(newPosition);
        } catch (error) {
            if (error instanceof ValidationError) {
                throw error; // Re-throw for API error handling
            }
            throw new ServiceError('Error creating risk position.');
        }
    }
    async updateRiskPosition(id: string, position: number) {
        try {
            const existingPosition = await this.storage.read(id);
            if (!existingPosition) {
                throw new NotFoundError('Risk position not found.');
            }
            const updatedPosition: RiskPosition = { ...existingPosition, position };
            const validationResult = RiskPositionSchema.safeParse(updatedPosition);
            if (!validationResult.success) {
                throw new ValidationError('Invalid risk position data: ' + validationResult.error);
            }
            return await this.storage.update(id, updatedPosition);
        } catch (error) {
            if (error instanceof NotFoundError) {
                throw error; // Re-throw for API error handling
            }
            throw new ServiceError('Error updating risk position.');
        }
    }
}