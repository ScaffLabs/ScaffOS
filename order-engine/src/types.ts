export interface Order {
  id: string;
  type: 'limit' | 'market' | 'stop';
  price: number;
  quantity: number;
  status: 'open' | 'filled' | 'cancelled';
}

export interface LimitOrder extends Order {
  type: 'limit';
  limitPrice: number;
}

export interface MarketOrder extends Order {
  type: 'market';
}

export interface StopOrder extends Order {
  type: 'stop';
  stopPrice: number;
}