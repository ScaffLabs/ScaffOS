import { RiskPosition } from '../sharedTypes';

export const createMockRiskPosition = (): RiskPosition => {
  return {
    id: Math.random().toString(36).substring(2, 11) as any,
    asset: 'AAPL',
    position: 50,
  };
};

export const createInvalidMockRiskPosition = (): any => {
  return {
    asset: '',
    position: -10,
  };
};

export const createRiskPositionWithInvalidAsset = (): RiskPosition => {
  return {
    id: Math.random().toString(36).substring(2, 11) as any,
    asset: '',
    position: 50,
  };
};

export const createRiskPositionWithInvalidPosition = (): RiskPosition => {
  return {
    id: Math.random().toString(36).substring(2, 11) as any,
    asset: 'AAPL',
    position: -50,
  };
};
