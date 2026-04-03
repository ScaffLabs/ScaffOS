export class DrawdownCircuitBreaker {
  private threshold: number;
  private currentDrawdown: number;
  private isActive: boolean;

  constructor(threshold: number) {
    this.threshold = threshold;
    this.currentDrawdown = 0;
    this.isActive = false;
  }

  updateDrawdown(currentValue: number, previousValue: number) {
    const drawdown = ((previousValue - currentValue) / previousValue) * 100;
    this.currentDrawdown = Math.max(this.currentDrawdown, drawdown);
    this.checkCircuit();
  }

  checkCircuit() {
    if (this.currentDrawdown >= this.threshold) {
      this.isActive = true;
      // Logic to halt trading
    }
  }

  reset() {
    this.currentDrawdown = 0;
    this.isActive = false;
  }
}