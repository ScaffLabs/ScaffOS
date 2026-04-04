export interface HistoricalData {
  timestamp: number;
  price: number;
}

export interface StrategyParameters {
  slippage: number;
  buyThreshold: number;
  sellThreshold: number;
}

export interface BacktestResult {
  totalReturns: number;
  trades: number;
  winRate: number;
  performanceMetrics: string;
}