import { Order, LimitOrder, MarketOrder } from './types';

export class OrderBook {
  private orders: Order[] = [];

  public addOrder(order: Order): void {
    this.orders.push(order);
  }

  public matchOrders(): void {
    // Matching logic for limit and market orders would go here
    // This is simplified for brevity; in a real application, this would need to handle complex scenarios.
  }

  public getOrders(): Order[] {
    return this.orders;
  }
}