import { RiskPosition } from '../sharedTypes';

export const createMockRiskPosition = (): RiskPosition => {
  return {
    id: Math.random().toString(36).substring(2, 11) as any,
    asset: 'AAPL',
    position: 50,
  };
};
