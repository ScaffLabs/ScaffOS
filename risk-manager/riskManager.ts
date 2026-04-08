import axios from 'axios';
import { DrawdownCircuitBreaker } from './drawdownCircuitBreaker';
import { RiskAlerting } from './riskAlerting';
import { PositionLimits } from './positionLimits';
import { RiskPosition, RiskPositionSchema } from './sharedTypes';
import MemoryQueue from './memoryQueue';
import logger from './logger';

export default class RiskManager {
  private drawdownCircuitBreaker: DrawdownCircuitBreaker;
  private riskAlerting: RiskAlerting;
  private positionLimits: PositionLimits;
  private riskPositions: RiskPosition[];
  private riskPositionQueue: MemoryQueue;

  constructor() {
    this.drawdownCircuitBreaker = new DrawdownCircuitBreaker(20);
    this.riskAlerting = new RiskAlerting();
    this.positionLimits = new PositionLimits();
    this.riskPositions = [];
    this.riskPositionQueue = new MemoryQueue();
    this.riskPositionQueue.eventEmitter.on('itemAdded', this.handleNewRiskPosition.bind(this));
  }

  private handleNewRiskPosition(position: RiskPosition) {
    this.riskPositions.push(position);
    this.riskAlerting.triggerRiskAlert(`New risk position added for asset: ${position.asset}`);
    logger.info(`New risk position handling: ${JSON.stringify(position)}`);
  }

  async getRiskPositions(limit: number, offset: number, sort?: string, filter?: string) {
    let positions = this.riskPositions;
    if (filter) {
      positions = positions.filter(pos => pos.asset.includes(filter));
    }
    if (sort) {
      positions.sort((a, b) => a[sort] > b[sort] ? 1 : -1);
    }
    return positions.slice(offset, offset + limit);
  }

  async createRiskPosition(asset: string, position: number) {
    const newPosition = { id: this.generateId(), asset, position };
    const validationResult = RiskPositionSchema.safeParse(newPosition);
    if (!validationResult.success) {
      logger.error('Invalid risk position data: ' + validationResult.error);
      throw new Error('Invalid risk position data: ' + validationResult.error);
    }

    if (!this.positionLimits.checkLimit(asset, position)) {
      logger.warn(`Position exceeds limit for asset: ${asset}`);
      throw new Error('Position exceeds limit for this asset.');
    }

    this.riskPositionQueue.enqueue(newPosition);
    logger.info(`Risk position created: ${newPosition.id}`);
    return newPosition;
  }

  async updateRiskPosition(id: string, position: number) {
    const index = this.riskPositions.findIndex(pos => pos.id === id);
    if (index === -1) {
      logger.warn(`Risk position not found for update: ${id}`);
      return null;
    }

    const updatedPosition = { ...this.riskPositions[index], position };
    const validationResult = RiskPositionSchema.safeParse(updatedPosition);
    if (!validationResult.success) {
      logger.error('Invalid risk position data for update: ' + validationResult.error);
      throw new Error('Invalid risk position data: ' + validationResult.error);
    }

    this.riskPositions[index].position = position;
    logger.info(`Risk position updated: ${id}`);
    return this.riskPositions[index];
  }

  async deleteRiskPosition(id: string) {
    const index = this.riskPositions.findIndex(pos => pos.id === id);
    if (index === -1) {
      logger.warn(`Risk position not found for deletion: ${id}`);
      return false;
    }
    this.riskPositions.splice(index, 1);
    logger.info(`Risk position deleted: ${id}`);
    return true;
  }

  private generateId() {
    return Math.random().toString(36).substr(2, 9);
  }
}