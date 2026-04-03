export interface Portfolio {
  id: string;
  name: string;
  positions: Position[];
}

export interface Position {
  symbol: string;
  quantity: number;
  averagePrice: number;
}

export interface PortfolioUpdate {
  name?: string;
  positions?: Position[];
}