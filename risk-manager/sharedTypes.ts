// Shared Types for Risk Manager Service
import { z } from 'zod';

// Branded types for IDs
export type OrderId = string & { readonly brand: unique symbol };  
export type TradeId = string & { readonly brand: unique symbol };  

/**  
 * Represents a risk position in the trading system.  
 * @property {OrderId} id - Unique identifier for the risk position.  
 * @property {string} asset - The asset for the risk position (e.g., 'AAPL').  
 * @property {number} position - The size of the position, must be non-negative.  
 */  
export interface RiskPosition {  
  id: OrderId;  
  asset: string;  
  position: number;  
}  

/**  
 * Zod schema for validating a RiskPosition object.  
 * Ensures that:  
 * - id is a branded string.  
 * - asset is a non-empty string.  
 * - position is a non-negative number.  
 */  
export const RiskPositionSchema = z.object({  
  id: z.string().brand<OrderId>(),  
  asset: z.string().nonempty({ message: 'Asset field cannot be empty.' }),  
  position: z.number().min(0, { message: 'Position must be a non-negative number.' }),  
});  

/**  
 * Represents different risk-related events.  
 */  
export type RiskEvent =  
  | { type: 'RiskPositionCreated'; position: RiskPosition }  
  | { type: 'RiskPositionUpdated'; position: RiskPosition }  
  | { type: 'RiskPositionDeleted'; id: OrderId };  

/**  
 * Zod schema for validating risk-related events.  
 */  
export const RiskEventSchema = z.union([  
  z.object({ type: z.literal('RiskPositionCreated'), position: RiskPositionSchema }),  
  z.object({ type: z.literal('RiskPositionUpdated'), position: RiskPositionSchema }),  
  z.object({ type: z.literal('RiskPositionDeleted'), id: z.string().brand<OrderId>() }),  
]);  

// Export schemas for other services to use
export { RiskPositionSchema, RiskEventSchema };