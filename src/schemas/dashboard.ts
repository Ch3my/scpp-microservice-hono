import { z } from '@hono/zod-openapi';

/**
 * GET /dashboard query parameters
 */
export const dashboardQuerySchema = z.object({
  sessionHash: z.string().min(1, 'Session hash is required'),
});

/**
 * GET /monthly-graph query parameters
 */
export const monthlyGraphQuerySchema = z.object({
  sessionHash: z.string().min(1, 'Session hash is required'),
  nMonths: z.string().transform((val) => Number.parseInt(val, 10)),
});

/**
 * Monthly graph response schema
 */
export const monthlyGraphResponseSchema = z
  .object({
    labels: z.array(z.string()),
    gastosDataset: z.array(z.number()),
    ingresosDataset: z.array(z.number()),
    ahorrosDataset: z.array(z.number()),
    range: z.object({
      start: z.string(),
      end: z.string(),
    }),
  })
  .openapi('MonthlyGraphResponse');

/**
 * GET /expenses-by-category query parameters
 */
export const expensesByCategoryQuerySchema = z.object({
  sessionHash: z.string().min(1, 'Session hash is required'),
  fechaInicio: z.string().optional(),
  fechaTermino: z.string().optional(),
});

/**
 * GET /curr-month-spending query parameters
 */
export const currentMonthSpendingQuerySchema = z.object({
  sessionHash: z.string().min(1, 'Session hash is required'),
});

/**
 * GET /yearly-sum query parameters
 */
export const yearlySumQuerySchema = z.object({
  sessionHash: z.string().min(1, 'Session hash is required'),
  year: z.string().optional(),
});

/**
 * GET /expenses-by-category-timeseries query parameters
 */
export const expensesByCategoryTimeseriesQuerySchema = z.object({
  sessionHash: z.string().min(1, 'Session hash is required'),
  nMonths: z.string().optional(),
});

// Type exports
export type DashboardQuery = z.infer<typeof dashboardQuerySchema>;
export type MonthlyGraphQuery = z.infer<typeof monthlyGraphQuerySchema>;
export type MonthlyGraphResponse = z.infer<typeof monthlyGraphResponseSchema>;
export type ExpensesByCategoryQuery = z.infer<typeof expensesByCategoryQuerySchema>;
export type CurrentMonthSpendingQuery = z.infer<typeof currentMonthSpendingQuerySchema>;
export type YearlySumQuery = z.infer<typeof yearlySumQuerySchema>;
export type ExpensesByCategoryTimeseriesQuery = z.infer<
  typeof expensesByCategoryTimeseriesQuerySchema
>;
