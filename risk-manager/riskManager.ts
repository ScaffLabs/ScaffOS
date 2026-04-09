import { RiskPosition, RiskPositionSchema, OrderId } from './sharedTypes';
import { RiskPositionStorage } from './storage';
import logger from './logger';
import { ValidationError, NotFoundError, ServiceError } from './errors';
import { PositionLimits } from './positionLimits';
import { fetchRiskAlerts } from './externalService';

export default class RiskManager {
    private storage: RiskPositionStorage;
    private positionLimits: PositionLimits;

    constructor(storage: RiskPositionStorage) {
        this.storage = storage;
        this.positionLimits = new PositionLimits();
    }

    async createRiskPosition(asset: string, position: number): Promise<RiskPosition> {
        try {
            if (!this.positionLimits.checkLimit(asset, position)) {
                throw new ValidationError(`Position exceeds limit for asset: ${asset}`);
            }
            const newPosition: RiskPosition = { id: this.generateId(), asset, position };
            const validationResult = RiskPositionSchema.safeParse(newPosition);
            if (!validationResult.success) {
                throw new ValidationError(`Invalid risk position data: ${JSON.stringify(validationResult.error.errors)}`);
            }
            const createdPosition = await this.storage.create(newPosition);
            logger.info(`Created new risk position: ${JSON.stringify(createdPosition)}`);
            return createdPosition;
        } catch (error) {
            logger.error('Error creating risk position:', error);
            throw new ServiceError('Error creating risk position.');
        }
    }

    async fetchAndProcessRiskAlerts() {
        try {
            const alerts = await fetchRiskAlerts();
            alerts.forEach(alert => {
                logger.info('Processing risk alert:', alert);
                // Implement alert handling logic here
            });
        } catch (error) {
            logger.error('Error fetching risk alerts:', error);
        }
    }

    private generateId(): OrderId {
        return Math.random().toString(36).substr(2, 9) as OrderId;
    }
}