import axios from 'axios';
import { DrawdownCircuitBreaker } from './drawdownCircuitBreaker';
import { RiskAlerting } from './riskAlerting';
import { PositionLimits } from './positionLimits';

interface RiskPosition {
  id: string;
  asset: string;
  position: number;
}

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
    if (!this.positionLimits.checkLimit(asset, position)) {
      throw new Error('Position exceeds limit for this asset.');
    }
    const newPosition: RiskPosition = { id: this.generateId(), asset, position };
    this.riskPositions.push(newPosition);
    this.riskAlerting.triggerRiskAlert(`New risk position created for ${asset}`);
    return newPosition;
  }

  async updateRiskPosition(id: string, position: number) {
    const index = this.riskPositions.findIndex(pos => pos.id === id);
    if (index === -1) return null;
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
    return Math.random().toString(36).substr(2, 9);
  }

  async monitorMemoryUsage() {
    const memoryUsage = process.memoryUsage();
    console.log(`Memory Usage: RSS: ${(memoryUsage.rss / 1024 / 1024).toFixed(2)} MB`);
  }

  setInterval(this.monitorMemoryUsage.bind(this), 60000);
}