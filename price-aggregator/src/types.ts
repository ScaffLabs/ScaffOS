export interface PriceData {
  exchange: string;
  price: number;
  volume: number;
}

export interface CurrentPrices {
  [key: string]: number;
}