import { riskManagerConfig } from './config';
import { EventBus } from './eventBus';
import { PriceAggregator } from './priceAggregator';
import { OrderEngine } from './orderEngine';
import axios from 'axios';
import { logger } from './logger';
import { DrawdownCircuitBreaker } from './drawdownCircuitBreaker';
import { PositionLimits } from './positionLimits';
import { RiskAlerting } from './riskAlerting';

class RiskManager {
    private positionLimits: PositionLimits;
    private drawdownLimit: number;
    private currentDrawdown: number;
    private eventBus: EventBus;
    private priceAggregator: PriceAggregator;
    private orderEngine: OrderEngine;
    private circuitBreaker: DrawdownCircuitBreaker;
    private riskAlerting: RiskAlerting;

    constructor() {
        this.positionLimits = new PositionLimits();
        this.drawdownLimit = riskManagerConfig.drawdownLimit;
        this.currentDrawdown = 0;
        this.circuitBreaker = new DrawdownCircuitBreaker(this.drawdownLimit);
        this.riskAlerting = new RiskAlerting();
        this.eventBus = new EventBus();
        this.priceAggregator = new PriceAggregator();
        this.orderEngine = new OrderEngine();
    }

    async checkPosition(asset: string, position: number) {
        const isWithinLimit = this.positionLimits.checkLimit(asset, position);
        if (!isWithinLimit) {
            this.riskAlerting.triggerRiskAlert(`Position limit exceeded for ${asset}`);
            return false;
        }
        return true;
    }

    async fetchMarketData(asset: string) {
        const url = `${process.env.MARKET_DATA_URL}/${asset}`;
        try {
            const response = await axios.get(url);
            return response.data;
        } catch (error) {
            logger.error(`Error fetching market data for ${asset}: ${error.message}`);
            throw error;
        }
    }

    async monitorRisk(asset: string) {
        const marketData = await this.fetchMarketData(asset);
        const previousValue = this.currentDrawdown;
        this.currentDrawdown = marketData.currentValue;
        this.circuitBreaker.updateDrawdown(this.currentDrawdown, previousValue);
        if (this.circuitBreaker.isActive) {
            logger.warn(`Circuit breaker activated due to drawdown on ${asset}`);
        }
    }

    async healthCheck() {
        try {
            await this.fetchMarketData('health');
            return { status: 'healthy' };
        } catch (error) {
            return { status: 'unhealthy', error: error.message };
        }
    }
}

export default RiskManager;
