import { z } from 'zod';

/**
 * A branded type for Order ID.
 */
export type OrderId = string & { readonly brand: unique symbol };

/**
 * A branded type for Trade ID.
 */
export type TradeId = string & { readonly brand: unique symbol };

/**
 * Represents an alert message.
 * @property {OrderId} id - The unique identifier for the alert.
 * @property {'price' | 'risk'} type - The type of the alert, e.g., 'price' or 'risk'.
 * @property {number} threshold - The threshold value for triggering the alert.
 * @property {number} currentValue - The current value being evaluated against the threshold.
 * @property {Date} createdAt - The date and time the alert was created.
 */
export interface AlertMessage {
    id: OrderId;
    type: 'price' | 'risk';
    threshold: number;
    currentValue: number;
    createdAt: Date;
}

/**
 * Represents different alert events.
 */
export type AlertEvent = 
    | { type: 'ALERT_CREATED'; alert: AlertMessage }
    | { type: 'ALERT_UPDATED'; alert: AlertMessage }
    | { type: 'ALERT_DELETED'; id: OrderId };

/**
 * Zod schema for validating AlertMessage objects.
 */
export const AlertMessageSchema = z.object({
    id: z.string().refine((val) => val.length > 0, { message: 'ID cannot be empty.' }) as z.ZodType<OrderId>,
    type: z.enum(['price', 'risk']),
    threshold: z.number().min(0, { message: 'Threshold must be a non-negative number.' }),
    currentValue: z.number().min(0, { message: 'Current value must be a non-negative number.' }),
    createdAt: z.date(),
});

/**
 * Validates an alert message using the Zod schema.
 * @param data - The alert data to validate.
 * @returns {AlertMessage} - The validated alert message.
 * @throws {ZodError} - If validation fails.
 */
export const validateAlertMessage = (data: unknown): AlertMessage => {
    return AlertMessageSchema.parse(data);
};