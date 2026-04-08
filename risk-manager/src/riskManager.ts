import { RiskPosition, RiskPositionSchema, OrderId } from './sharedTypes';
import { RiskPositionStorage } from './storage';
import logger from './logger';
import { ServiceError, ValidationError, NotFoundError } from './errors';
import { fetchEventBusData } from './externalService';

export default class RiskManager {
    private storage: RiskPositionStorage;

    constructor(storage: RiskPositionStorage) {
        this.storage = storage;
    }

    async createRiskPosition(asset: string, position: number): Promise<RiskPosition> {
        try {
            const newPosition: RiskPosition = { id: this.generateId(), asset, position };
            const validationResult = RiskPositionSchema.safeParse(newPosition);
            if (!validationResult.success) {
                throw new ValidationError('Invalid risk position data: ' + validationResult.error.errors);
            }
            const createdPosition = await this.storage.create(newPosition);
            await fetchEventBusData(); // Fetch data from event bus
            return createdPosition;
        } catch (error) {
            if (error instanceof ValidationError) {
                throw error;
            }
            logger.error('Error creating risk position: ', error);
            throw new ServiceError('Error creating risk position.');
        }
    }

    private generateId(): OrderId {
        return Math.random().toString(36).substr(2, 9) as OrderId;
    }
}
