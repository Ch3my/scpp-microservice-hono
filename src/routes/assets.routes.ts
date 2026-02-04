import { OpenAPIHono, createRoute, z } from '@hono/zod-openapi';
import { assetsService } from '../services/assets.service';
import { sessionService } from '../services/session.service';
import {
  assetSchema,
  assetsQuerySchema,
  createAssetSchema,
  deleteAssetSchema,
} from '../schemas/assets';
import { successResponseSchema } from '../schemas/common';
import { InvalidSessionError } from '../errors/http';
import type { AppEnv } from '../types/context';

export const assetsRouter = new OpenAPIHono<AppEnv>();

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

  const isValid = await sessionService.validate(query.sessionHash);
  if (!isValid) {
    throw new InvalidSessionError();
  }

  const assets = await assetsService.getAssets(query);
  return c.json(assets);
});

assetsRouter.openapi(createAssetRoute, async (c) => {
  const data = c.req.valid('json');

  const isValid = await sessionService.validate(data.sessionHash);
  if (!isValid) {
    throw new InvalidSessionError();
  }

  const { sessionHash, ...assetData } = data;
  const result = await assetsService.createAsset(assetData);
  return c.json(result);
});

assetsRouter.openapi(deleteAssetRoute, async (c) => {
  const data = c.req.valid('json');

  const isValid = await sessionService.validate(data.sessionHash);
  if (!isValid) {
    throw new InvalidSessionError();
  }

  const result = await assetsService.deleteAsset(data.id);
  return c.json(result);
});
