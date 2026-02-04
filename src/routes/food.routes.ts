import { OpenAPIHono, createRoute, z } from '@hono/zod-openapi';
import { foodService } from '../services/food.service';
import { sessionService } from '../services/session.service';
import {
  foodItemSchema,
  foodItemQuantitySchema,
  foodTransactionSchema,
  foodItemsQuerySchema,
  foodItemQuantityQuerySchema,
  foodTransactionsQuerySchema,
  createFoodItemSchema,
  updateFoodItemSchema,
  deleteFoodItemSchema,
  createFoodTransactionSchema,
  updateFoodTransactionSchema,
  deleteFoodTransactionSchema,
} from '../schemas/food';
import { successResponseSchema } from '../schemas/common';
import { InvalidSessionError, MissingDataError } from '../errors/http';
import type { AppEnv } from '../types/context';

export const foodRouter = new OpenAPIHono<AppEnv>();

// ============== FOOD ITEMS Route Definitions ==============

const getFoodItemsRoute = createRoute({
  method: 'get',
  path: '/items',
  tags: ['Food Items'],
  request: {
    query: foodItemsQuerySchema,
  },
  responses: {
    200: {
      content: { 'application/json': { schema: z.array(foodItemSchema) } },
      description: 'List of food items',
    },
  },
});

const getFoodItemQuantityRoute = createRoute({
  method: 'get',
  path: '/item-quantity',
  tags: ['Food Items'],
  request: {
    query: foodItemQuantityQuerySchema,
  },
  responses: {
    200: {
      content: { 'application/json': { schema: z.array(foodItemQuantitySchema) } },
      description: 'List of food items with quantities',
    },
  },
});

const createFoodItemRoute = createRoute({
  method: 'post',
  path: '/item',
  tags: ['Food Items'],
  request: {
    body: {
      content: {
        'application/json': { schema: createFoodItemSchema },
      },
    },
  },
  responses: {
    200: {
      content: { 'application/json': { schema: successResponseSchema } },
      description: 'Food item created',
    },
  },
});

const updateFoodItemRoute = createRoute({
  method: 'put',
  path: '/item',
  tags: ['Food Items'],
  request: {
    body: {
      content: {
        'application/json': { schema: updateFoodItemSchema },
      },
    },
  },
  responses: {
    200: {
      content: { 'application/json': { schema: successResponseSchema } },
      description: 'Food item updated',
    },
  },
});

const deleteFoodItemRoute = createRoute({
  method: 'delete',
  path: '/item',
  tags: ['Food Items'],
  request: {
    body: {
      content: {
        'application/json': { schema: deleteFoodItemSchema },
      },
    },
  },
  responses: {
    200: {
      content: { 'application/json': { schema: successResponseSchema } },
      description: 'Food item deleted',
    },
  },
});

// ============== FOOD TRANSACTIONS Route Definitions ==============

const getFoodTransactionsRoute = createRoute({
  method: 'get',
  path: '/transaction',
  tags: ['Food Transactions'],
  request: {
    query: foodTransactionsQuerySchema,
  },
  responses: {
    200: {
      content: { 'application/json': { schema: z.array(foodTransactionSchema) } },
      description: 'List of food transactions',
    },
  },
});

const createFoodTransactionRoute = createRoute({
  method: 'post',
  path: '/transaction',
  tags: ['Food Transactions'],
  request: {
    body: {
      content: {
        'application/json': { schema: createFoodTransactionSchema },
      },
    },
  },
  responses: {
    200: {
      content: { 'application/json': { schema: successResponseSchema } },
      description: 'Food transaction created',
    },
  },
});

const updateFoodTransactionRoute = createRoute({
  method: 'put',
  path: '/transaction',
  tags: ['Food Transactions'],
  request: {
    body: {
      content: {
        'application/json': { schema: updateFoodTransactionSchema },
      },
    },
  },
  responses: {
    200: {
      content: { 'application/json': { schema: successResponseSchema } },
      description: 'Food transaction updated',
    },
  },
});

const deleteFoodTransactionRoute = createRoute({
  method: 'delete',
  path: '/transaction',
  tags: ['Food Transactions'],
  request: {
    body: {
      content: {
        'application/json': { schema: deleteFoodTransactionSchema },
      },
    },
  },
  responses: {
    200: {
      content: { 'application/json': { schema: successResponseSchema } },
      description: 'Food transaction deleted',
    },
  },
});

// ============== FOOD ITEMS Handlers ==============

foodRouter.openapi(getFoodItemsRoute, async (c) => {
  const { sessionHash, id } = c.req.valid('query');

  const isValid = await sessionService.validate(sessionHash);
  if (!isValid) {
    throw new InvalidSessionError();
  }

  const items = await foodService.getFoodItems(id);
  return c.json(items);
});

foodRouter.openapi(getFoodItemQuantityRoute, async (c) => {
  const { sessionHash } = c.req.valid('query');

  const isValid = await sessionService.validate(sessionHash);
  if (!isValid) {
    throw new InvalidSessionError();
  }

  const items = await foodService.getFoodItemsQuantity();
  return c.json(items);
});

foodRouter.openapi(createFoodItemRoute, async (c) => {
  const data = c.req.valid('json');

  const isValid = await sessionService.validate(data.sessionHash);
  if (!isValid) {
    throw new InvalidSessionError();
  }

  const { sessionHash, ...itemData } = data;
  const result = await foodService.createFoodItem(itemData);
  return c.json(result);
});

foodRouter.openapi(updateFoodItemRoute, async (c) => {
  const data = c.req.valid('json');

  const isValid = await sessionService.validate(data.sessionHash);
  if (!isValid) {
    throw new InvalidSessionError();
  }

  const { sessionHash, ...itemData } = data;
  const result = await foodService.updateFoodItem(itemData);
  return c.json(result);
});

foodRouter.openapi(deleteFoodItemRoute, async (c) => {
  const data = c.req.valid('json');

  const isValid = await sessionService.validate(data.sessionHash);
  if (!isValid) {
    throw new InvalidSessionError();
  }

  const result = await foodService.deleteFoodItem(data.id);
  return c.json(result);
});

// ============== FOOD TRANSACTIONS Handlers ==============

foodRouter.openapi(getFoodTransactionsRoute, async (c) => {
  const { sessionHash, foodItemId } = c.req.valid('query');

  const isValid = await sessionService.validate(sessionHash);
  if (!isValid) {
    throw new InvalidSessionError();
  }

  const transactions = await foodService.getFoodTransactions(foodItemId);
  return c.json(transactions);
});

foodRouter.openapi(createFoodTransactionRoute, async (c) => {
  const data = c.req.valid('json');

  const isValid = await sessionService.validate(data.sessionHash);
  if (!isValid) {
    throw new InvalidSessionError();
  }

  if (!data.foodItemId || !data.quantity || !data.transactionType) {
    throw new MissingDataError();
  }

  const { sessionHash, ...transactionData } = data;
  const result = await foodService.createFoodTransaction(transactionData);
  return c.json(result);
});

foodRouter.openapi(updateFoodTransactionRoute, async (c) => {
  const data = c.req.valid('json');

  const isValid = await sessionService.validate(data.sessionHash);
  if (!isValid) {
    throw new InvalidSessionError();
  }

  const { sessionHash, ...transactionData } = data;
  const result = await foodService.updateFoodTransaction(transactionData);
  return c.json(result);
});

foodRouter.openapi(deleteFoodTransactionRoute, async (c) => {
  const data = c.req.valid('json');

  const isValid = await sessionService.validate(data.sessionHash);
  if (!isValid) {
    throw new InvalidSessionError();
  }

  const result = await foodService.deleteFoodTransaction(data.id);
  return c.json(result);
});
