import { Order, LimitOrder, MarketOrder } from './types';

export class OrderBook {
  private orders: Order[] = [];

  public addOrder(order: Order): void {
    this.orders.push(order);
  }

  public matchOrders(): void {
    const marketOrders: MarketOrder[] = this.orders.filter(order => order.type === 'market') as MarketOrder[];
    const limitOrders: LimitOrder[] = this.orders.filter(order => order.type === 'limit') as LimitOrder[];

    marketOrders.forEach(marketOrder => {
      const matchingLimitOrders = limitOrders.filter(limitOrder => 
        (limitOrder.limitPrice >= marketOrder.price && marketOrder.quantity > 0) || 
        (limitOrder.limitPrice <= marketOrder.price && marketOrder.quantity < 0)
      );

      matchingLimitOrders.forEach(limitOrder => {
        const fillQuantity = Math.min(limitOrder.quantity, Math.abs(marketOrder.quantity));
        limitOrder.quantity -= fillQuantity;
        marketOrder.quantity += fillQuantity;

        if (limitOrder.quantity === 0) {
          this.removeOrder(limitOrder.id);
        }
      });
    });
  }

  public getOrders(): Order[] {
    return this.orders;
  }

  private removeOrder(orderId: string): void {
    this.orders = this.orders.filter(order => order.id !== orderId);
  }
}