import RiskManager from '../riskManager';
import { InMemoryStorage } from '../storage';
import { RiskPosition } from '../sharedTypes';
import { ValidationError, NotFoundError } from '../errors';

const storage = new InMemoryStorage<RiskPosition>();
const riskManager = new RiskManager(storage);

describe('RiskManager', () => {
    const mockPosition = { id: '1', asset: 'AAPL', position: 100 };
    const mockInvalidPosition = { id: '2', asset: '', position: -50 };

    afterEach(async () => {
        await storage.reset(); // Clear storage after each test
    });

    it('should create a risk position successfully', async () => {
        const createdPosition = await riskManager.createRiskPosition(mockPosition.asset, mockPosition.position);
        expect(createdPosition).toHaveProperty('id');
        expect(createdPosition.asset).toBe(mockPosition.asset);
        expect(createdPosition.position).toBe(mockPosition.position);
    });

    it('should throw ValidationError for invalid position', async () => {
        await expect(riskManager.createRiskPosition(mockInvalidPosition.asset, mockInvalidPosition.position))
            .rejects.toThrow(ValidationError);
    });

    it('should retrieve a risk position', async () => {
        const createdPosition = await riskManager.createRiskPosition(mockPosition.asset, mockPosition.position);
        const retrievedPosition = await riskManager.getRiskPositions(10, 0);
        expect(retrievedPosition).toHaveLength(1);
        expect(retrievedPosition[0]).toEqual(createdPosition);
    });

    it('should update a risk position successfully', async () => {
        const createdPosition = await riskManager.createRiskPosition(mockPosition.asset, mockPosition.position);
        const updatedPosition = await riskManager.updateRiskPosition(createdPosition.id, 150);
        expect(updatedPosition.position).toBe(150);
    });

    it('should throw NotFoundError for updating nonexistent position', async () => {
        await expect(riskManager.updateRiskPosition('nonexistent_id', 150)).rejects.toThrow(NotFoundError);
    });

    it('should delete a risk position successfully', async () => {
        const createdPosition = await riskManager.createRiskPosition(mockPosition.asset, mockPosition.position);
        const isDeleted = await riskManager.deleteRiskPosition(createdPosition.id);
        expect(isDeleted).toBe(true);
    });

    it('should throw NotFoundError for deleting nonexistent position', async () => {
        await expect(riskManager.deleteRiskPosition('nonexistent_id')).rejects.toThrow(NotFoundError);
    });
});