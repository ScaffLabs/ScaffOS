import axios from 'axios';
import { DrawdownCircuitBreaker } from './drawdownCircuitBreaker';
import { RiskAlerting } from './riskAlerting';
import { PositionLimits } from './positionLimits';
import { RiskPosition, RiskPositionSchema, RiskEvent } from './sharedTypes';

export default class RiskManager {
  private drawdownCircuitBreaker: DrawdownCircuitBreaker;
  private riskAlerting: RiskAlerting;
  private positionLimits: PositionLimits;
  private riskPositions: RiskPosition[];

  constructor() {
    this.drawdownCircuitBreaker = new DrawdownCircuitBreaker(20);
    this.riskAlerting = new RiskAlerting();
    this.positionLimits = new PositionLimits();
    this.riskPositions = [];
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
    const newPosition = { id: this.generateId() as OrderId, asset, position };
    const validationResult = RiskPositionSchema.safeParse(newPosition);
    if (!validationResult.success) {
      throw new Error('Invalid risk position data: ' + validationResult.error);
    }

    if (!this.positionLimits.checkLimit(asset, position)) {
      throw new Error('Position exceeds limit for this asset.');
    }

    this.riskPositions.push(newPosition);
    this.riskAlerting.triggerRiskAlert(`New risk position created for ${asset}`);
    return newPosition;
  }

  async updateRiskPosition(id: string, position: number) {
    const index = this.riskPositions.findIndex(pos => pos.id === id);
    if (index === -1) return null;

    const updatedPosition = { ...this.riskPositions[index], position };
    const validationResult = RiskPositionSchema.safeParse(updatedPosition);
    if (!validationResult.success) {
      throw new Error('Invalid risk position data: ' + validationResult.error);
    }

    this.riskPositions[index].position = position;
    return this.riskPositions[index];
  }

  async deleteRiskPosition(id: string) {
    const index = this.riskPositions.findIndex(pos => pos.id === id);
    if (index === -1) return false;
    this.riskPositions.splice(index, 1);
    return true;
  }

  private generateId() {
    return Math.random().toString(36).substr(2, 9) as OrderId;
  }

  async monitorMemoryUsage() {
    const memoryUsage = process.memoryUsage();
    console.log(`Memory Usage: RSS: ${(memoryUsage.rss / 1024 / 1024).toFixed(2)} MB`);
  }

  setInterval(this.monitorMemoryUsage.bind(this), 60000);
}