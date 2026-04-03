import { EventEmitter } from 'events';

export class RiskAlerting {
  private eventEmitter: EventEmitter;

  constructor() {
    this.eventEmitter = new EventEmitter();
  }

  onRiskAlert(callback: (message: string) => void) {
    this.eventEmitter.on('riskAlert', callback);
  }

  triggerRiskAlert(message: string) {
    this.eventEmitter.emit('riskAlert', message);
  }
}