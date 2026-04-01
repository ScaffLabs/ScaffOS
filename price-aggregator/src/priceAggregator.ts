import WebSocket from 'ws';

interface PriceData {
  exchange: string;
  price: number;
  volume: number;
}

export class PriceAggregator {
  private prices: PriceData[] = [];
  private currentPrices: Record<string, number> = {};

  constructor() {
    this.startPriceFetch();
  }

  private startPriceFetch() {
    // Simulated fetching from exchanges
    setInterval(() => {
      this.fetchPrices();
      this.calculateVWAP();
    }, 5000);
  }

  private fetchPrices() {
    // Fetch prices from exchanges and update this.prices
    // For now, we will simulate random prices
    this.prices.push({ exchange: 'exchange1', price: Math.random() * 100, volume: Math.random() * 100 });
    // Update current prices
    this.currentPrices['exchange1'] = this.prices[this.prices.length - 1].price;
  }

  private calculateVWAP() {
    const totalValue = this.prices.reduce((acc, p) => acc + p.price * p.volume, 0);
    const totalVolume = this.prices.reduce((acc, p) => acc + p.volume, 0);
    const vwap = totalValue / totalVolume;
    this.currentPrices['VWAP'] = vwap;
  }

  public getCurrentPrices() {
    return this.currentPrices;
  }

  public subscribe(ws: WebSocket) {
    ws.on('close', () => {
      // Handle WebSocket close
    });
    // Send current prices to the client
    ws.send(JSON.stringify(this.getCurrentPrices()));
  }
}