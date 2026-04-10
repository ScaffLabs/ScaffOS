import { z } from 'zod';

/**
 * A branded type for Order ID.
 */
export type OrderId = string & { readonly brand: unique symbol };

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
 * Schema for alert creation request validation.
 */
export const CreateAlertRequestSchema = z.object({
    type: z.enum(['price', 'risk']),
    threshold: z.number().min(0, { message: 'Threshold must be a non-negative number.' }),
    currentValue: z.number().min(0, { message: 'Current value must be a non-negative number.' }),
});

/**
 * Validates an alert creation request.
 * @param data - The request data to validate.
 * @returns {Omit<AlertMessage, 'id' | 'createdAt'>} - The validated alert creation request.
 * @throws {ZodError} - If validation fails.
 */
export const validateCreateAlertRequest = (data: unknown): Omit<AlertMessage, 'id' | 'createdAt'> => {
    return CreateAlertRequestSchema.parse(data);
};

/**
 * Schema for validating pagination parameters.
 */
export const PaginationSchema = z.object({
    limit: z.string().optional().transform((val) => (val ? parseInt(val) : 10)),
    offset: z.string().optional().transform((val) => (val ? parseInt(val) : 0)),
    type: z.enum(['price', 'risk']).optional(),
    sort: z.enum(['asc', 'desc']).optional(),
});

/**
 * Validates pagination parameters.
 * @param data - The pagination data to validate.
 * @returns {object} - The validated pagination parameters.
 * @throws {ZodError} - If validation fails.
 */
export const validatePaginationRequest = (data: unknown) => {
    return PaginationSchema.parse(data);
};
