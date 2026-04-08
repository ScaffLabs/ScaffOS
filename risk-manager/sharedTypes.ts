// Shared Types for Risk Manager Service
import { z } from 'zod';

// Branded types for IDs
export type OrderId = string & { readonly brand: unique symbol };  
export type TradeId = string & { readonly brand: unique symbol };  

// Risk Position Type
export interface RiskPosition {
  id: OrderId;
  asset: string;
  position: number;
}

// Zod schema for RiskPosition validation
export const RiskPositionSchema = z.object({
  id: z.string().brand<OrderId>(),
  asset: z.string().nonempty(),
  position: z.number().min(0, { message: 'Position must be a non-negative number' }),
});

// Event Types
export type RiskEvent = 
  | { type: 'RiskPositionCreated'; position: RiskPosition }
  | { type: 'RiskPositionUpdated'; position: RiskPosition }
  | { type: 'RiskPositionDeleted'; id: OrderId };

// Zod schema for event validation
export const RiskEventSchema = z.union([
  z.object({ type: z.literal('RiskPositionCreated'), position: RiskPositionSchema }),
  z.object({ type: z.literal('RiskPositionUpdated'), position: RiskPositionSchema }),
  z.object({ type: z.literal('RiskPositionDeleted'), id: z.string().brand<OrderId>() }),
]);

// Export schemas for other services to use
export { RiskPositionSchema, RiskEventSchema };