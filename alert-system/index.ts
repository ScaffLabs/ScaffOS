import { EventBus } from '../event-bus';
import { AlertProcessor } from './alert.processor';
import { AlertConfiguration } from './alert.config';
import { HealthCheck } from './health-check';
import { AlertStore, IDataStore } from './storage';
import { MigrationUtil } from './migrations';
import { logStartup } from './logger';

const eventBus = new EventBus();
const alertProcessor = new AlertProcessor(eventBus);
const alertConfig = new AlertConfiguration({ thresholds: { price: 100, risk: 50 } });
const alertStore: IDataStore<AlertMessage> = new AlertStore();

HealthCheck.checkServices(['webhook', 'email', 'websocket']);
MigrationUtil.seedData(alertStore);

logStartup({
  thresholds: alertConfig.getConfiguration().thresholds,
  services: ['webhook', 'email', 'websocket']
});

export { eventBus, alertProcessor, alertConfig, alertStore };