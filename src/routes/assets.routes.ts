import { OpenAPIHono, createRoute, z } from '@hono/zod-openapi';
import { assetsService } from '../services/assets.service';
import {
  assetSchema,
  assetsQuerySchema,
  createAssetSchema,
  deleteAssetSchema,
} from '../schemas/assets';
import { successResponseSchema } from '../schemas/common';
import { requireSession } from '../middleware/auth';
import type { AppEnv } from '../types/context';

export const assetsRouter = new OpenAPIHono<AppEnv>();

// Apply session validation middleware to all routes
assetsRouter.use('/assets', requireSession);

// ============== Route Definitions ==============

const getAssetsRoute = createRoute({
  method: 'get',
  path: '/assets',
  tags: ['Assets'],
  request: {
    query: assetsQuerySchema,
  },
  responses: {
    200: {
      content: { 'application/json': { schema: z.array(assetSchema) } },
      description: 'List of assets',
    },
  },
});

const createAssetRoute = createRoute({
  method: 'post',
  path: '/assets',
  tags: ['Assets'],
  request: {
    body: {
      content: {
        'application/json': { schema: createAssetSchema },
      },
    },
  },
  responses: {
    200: {
      content: { 'application/json': { schema: successResponseSchema } },
      description: 'Asset created',
    },
  },
});

const deleteAssetRoute = createRoute({
  method: 'delete',
  path: '/assets',
  tags: ['Assets'],
  request: {
    body: {
      content: {
        'application/json': { schema: deleteAssetSchema },
      },
    },
  },
  responses: {
    200: {
      content: { 'application/json': { schema: successResponseSchema } },
      description: 'Asset deleted',
    },
  },
});

// ============== Route Handlers ==============

assetsRouter.openapi(getAssetsRoute, async (c) => {
  const query = c.req.valid('query');
  const assets = await assetsService.getAssets(query);
  return c.json(assets);
});

assetsRouter.openapi(createAssetRoute, async (c) => {
  const data = c.req.valid('json');
  const result = await assetsService.createAsset(data);
  return c.json(result);
});

assetsRouter.openapi(deleteAssetRoute, async (c) => {
  const data = c.req.valid('json');
  const result = await assetsService.deleteAsset(data.id);
  return c.json(result);
});
