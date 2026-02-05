import { OpenAPIHono, createRoute, z } from '@hono/zod-openapi';
import { dashboardService } from '../services/dashboard.service';
import { sessionService } from '../services/session.service';
import {
  dashboardQuerySchema,
  monthlyGraphQuerySchema,
  monthlyGraphResponseSchema,
  expensesByCategoryQuerySchema,
  currentMonthSpendingQuerySchema,
  yearlySumQuerySchema,
  expensesByCategoryTimeseriesQuerySchema,
} from '../schemas/dashboard';
import { InvalidSessionError } from '../errors/http';
import type { AppEnv } from '../types/context';

export const dashboardRouter = new OpenAPIHono<AppEnv>();

// ============== Route Definitions ==============

const getDashboardRoute = createRoute({
  method: 'get',
  path: '/dashboard',
  tags: ['Dashboard'],
  request: {
    query: dashboardQuerySchema,
  },
  responses: {
    200: {
      content: { 'application/json': { schema: z.any() } },
      description: 'Dashboard data',
    },
  },
});

const postDashboardRoute = createRoute({
  method: 'post',
  path: '/dashboard',
  tags: ['Dashboard'],
  responses: {
    200: {
      content: { 'text/plain': { schema: z.string() } },
      description: 'Stub response',
    },
  },
});

const getMonthlyGraphRoute = createRoute({
  method: 'get',
  path: '/monthly-graph',
  tags: ['Dashboard'],
  request: {
    query: monthlyGraphQuerySchema,
  },
  responses: {
    200: {
      content: { 'application/json': { schema: monthlyGraphResponseSchema } },
      description: 'Monthly graph data',
    },
  },
});

const getExpensesByCategoryRoute = createRoute({
  method: 'get',
  path: '/expenses-by-category',
  tags: ['Dashboard'],
  request: {
    query: expensesByCategoryQuerySchema,
  },
  responses: {
    200: {
      content: { 'application/json': { schema: z.any() } },
      description: 'Expenses by category',
    },
  },
});

const getCurrentMonthSpendingRoute = createRoute({
  method: 'get',
  path: '/curr-month-spending',
  tags: ['Dashboard'],
  request: {
    query: currentMonthSpendingQuerySchema,
  },
  responses: {
    200: {
      content: { 'application/json': { schema: z.any() } },
      description: 'Current month spending',
    },
  },
});

const getYearlySumRoute = createRoute({
  method: 'get',
  path: '/yearly-sum',
  tags: ['Dashboard'],
  request: {
    query: yearlySumQuerySchema,
  },
  responses: {
    200: {
      content: { 'application/json': { schema: z.any() } },
      description: 'Yearly sum data',
    },
  },
});

const getExpensesByCategoryTimeseriesRoute = createRoute({
  method: 'get',
  path: '/expenses-by-category-timeseries',
  tags: ['Dashboard'],
  request: {
    query: expensesByCategoryTimeseriesQuerySchema,
  },
  responses: {
    200: {
      content: { 'application/json': { schema: z.any() } },
      description: 'Expenses by category timeseries',
    },
  },
});

// ============== Route Handlers ==============

dashboardRouter.openapi(getDashboardRoute, async (c) => {
  const { sessionHash } = c.req.valid('query');

  const isValid = await sessionService.validate(sessionHash);
  if (!isValid) {
    throw new InvalidSessionError();
  }

  const data = await dashboardService.getDashboard();
  return c.json(data);
});

dashboardRouter.openapi(postDashboardRoute, (c) => {
  return c.text('Hello World!');
});

dashboardRouter.openapi(getMonthlyGraphRoute, async (c) => {
  const { sessionHash, nMonths } = c.req.valid('query');

  const isValid = await sessionService.validate(sessionHash);
  if (!isValid) {
    throw new InvalidSessionError();
  }

  const data = await dashboardService.getMonthlyGraph(nMonths);
  return c.json(data);
});

dashboardRouter.openapi(getExpensesByCategoryRoute, async (c) => {
  const { sessionHash, nMonths } = c.req.valid('query');

  const isValid = await sessionService.validate(sessionHash);
  if (!isValid) {
    throw new InvalidSessionError();
  }

  const data = await dashboardService.getExpensesByCategory(nMonths);
  return c.json(data);
});

dashboardRouter.openapi(getCurrentMonthSpendingRoute, async (c) => {
  const { sessionHash } = c.req.valid('query');

  const isValid = await sessionService.validate(sessionHash);
  if (!isValid) {
    throw new InvalidSessionError();
  }

  const data = await dashboardService.getCurrentMonthSpending();
  return c.json(data);
});

dashboardRouter.openapi(getYearlySumRoute, async (c) => {
  const { sessionHash, nMonths } = c.req.valid('query');

  const isValid = await sessionService.validate(sessionHash);
  if (!isValid) {
    throw new InvalidSessionError();
  }

  const data = await dashboardService.getYearlySum(nMonths);
  return c.json(data);
});

dashboardRouter.openapi(getExpensesByCategoryTimeseriesRoute, async (c) => {
  const { sessionHash, nMonths } = c.req.valid('query');

  const isValid = await sessionService.validate(sessionHash);
  if (!isValid) {
    throw new InvalidSessionError();
  }

  const data = await dashboardService.getExpensesByCategoryTimeseries(nMonths);
  return c.json(data);
});
