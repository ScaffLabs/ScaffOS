import { RiskPosition } from '../sharedTypes';

export const createMockRiskPosition = (): RiskPosition => {
  return {
    id: Math.random().toString(36).substr(2, 9) as any,
    asset: 'AAPL',
    position: 50,
  };
};
