import { z } from '@hono/zod-openapi';

/**
 * Food item schema
 */
export const foodItemSchema = z
  .object({
    id: z.number(),
    name: z.string(),
    unit: z.string(),
  })
  .openapi('FoodItem');

/**
 * Food item with quantity schema
 */
export const foodItemQuantitySchema = z
  .object({
    id: z.number(),
    name: z.string(),
    unit: z.string(),
    quantity: z.number(),
    last_transaction_at: z.string().nullable(),
  })
  .openapi('FoodItemQuantity');

/**
 * Food transaction schema
 */
export const foodTransactionSchema = z
  .object({
    id: z.number(),
    item_id: z.number(),
    item_name: z.string().optional(),
    item_unit: z.string().optional(),
    change_qty: z.number(),
    transaction_type: z.enum(['restock', 'consumption', 'adjustment']),
    occurred_at: z.string(),
    note: z.string().nullable(),
    code: z.string().nullable(),
    best_before: z.string().nullable(),
    fk_transaction: z.number().nullable(),
    remaining_quantity: z.number().nullable(),
  })
  .openapi('FoodTransaction');

// Query schemas
export const foodItemsQuerySchema = z.object({
  id: z.array(z.string()).or(z.string()).optional(),
  'id[]': z.array(z.string()).or(z.string()).optional(),
});

export const foodItemQuantityQuerySchema = z.object({});

export const foodTransactionsQuerySchema = z.object({
  id: z.string().optional(),
});

// Create/Update/Delete schemas
export const createFoodItemSchema = z
  .object({
    name: z.string().min(1, 'Name is required'),
    unit: z.string().min(1, 'Unit is required'),
  })
  .openapi('CreateFoodItem');

export const updateFoodItemSchema = z
  .object({
    id: z.number(),
    name: z.string().min(1),
    unit: z.string().min(1),
  })
  .openapi('UpdateFoodItem');

export const deleteFoodItemSchema = z
  .object({
    id: z.number(),
  })
  .openapi('DeleteFoodItem');

export const createFoodTransactionSchema = z
  .object({
    foodItemId: z.number(),
    quantity: z.number(),
    transactionType: z.enum(['restock', 'consumption', 'adjustment']),
    note: z.string().optional(),
    code: z.string().optional(),
    bestBefore: z.string().nullable().optional(),
  })
  .openapi('CreateFoodTransaction');

export const updateFoodTransactionSchema = z
  .object({
    id: z.number(),
    quantity: z.number().optional(),
    note: z.string().optional(),
    code: z.string().optional(),
    bestBefore: z.string().nullable().optional(),
  })
  .openapi('UpdateFoodTransaction');

export const deleteFoodTransactionSchema = z
  .object({
    id: z.number(),
  })
  .openapi('DeleteFoodTransaction');

// Type exports
export type FoodItem = z.infer<typeof foodItemSchema>;
export type FoodItemQuantity = z.infer<typeof foodItemQuantitySchema>;
export type FoodTransaction = z.infer<typeof foodTransactionSchema>;
export type FoodItemsQuery = z.infer<typeof foodItemsQuerySchema>;
export type FoodItemQuantityQuery = z.infer<typeof foodItemQuantityQuerySchema>;
export type FoodTransactionsQuery = z.infer<typeof foodTransactionsQuerySchema>;
export type CreateFoodItem = z.infer<typeof createFoodItemSchema>;
export type UpdateFoodItem = z.infer<typeof updateFoodItemSchema>;
export type DeleteFoodItem = z.infer<typeof deleteFoodItemSchema>;
export type CreateFoodTransaction = z.infer<typeof createFoodTransactionSchema>;
export type UpdateFoodTransaction = z.infer<typeof updateFoodTransactionSchema>;
export type DeleteFoodTransaction = z.infer<typeof deleteFoodTransactionSchema>;
