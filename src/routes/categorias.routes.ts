import { OpenAPIHono, createRoute, z } from '@hono/zod-openapi';
import { categoriasService } from '../services/categorias.service';
import { sessionService } from '../services/session.service';
import {
  categoriaSchema,
  tipoDocSchema,
  categoriasQuerySchema,
  tipoDocsQuerySchema,
} from '../schemas/categorias';
import { InvalidSessionError } from '../errors/http';
import type { AppEnv } from '../types/context';

export const categoriasRouter = new OpenAPIHono<AppEnv>();

// ============== Route Definitions ==============

const getCategoriasRoute = createRoute({
  method: 'get',
  path: '/categorias',
  tags: ['Categorias'],
  request: {
    query: categoriasQuerySchema,
  },
  responses: {
    200: {
      content: { 'application/json': { schema: z.array(categoriaSchema) } },
      description: 'List of categories',
    },
  },
});

const getTipoDocsRoute = createRoute({
  method: 'get',
  path: '/tipo-docs',
  tags: ['Categorias'],
  request: {
    query: tipoDocsQuerySchema,
  },
  responses: {
    200: {
      content: { 'application/json': { schema: z.array(tipoDocSchema) } },
      description: 'List of document types',
    },
  },
});

// ============== Route Handlers ==============

categoriasRouter.openapi(getCategoriasRoute, async (c) => {
  const { sessionHash } = c.req.valid('query');

  const isValid = await sessionService.validate(sessionHash);
  if (!isValid) {
    throw new InvalidSessionError();
  }

  const categorias = await categoriasService.getCategorias();
  return c.json(categorias);
});

categoriasRouter.openapi(getTipoDocsRoute, async (c) => {
  const { sessionHash } = c.req.valid('query');

  const isValid = await sessionService.validate(sessionHash);
  if (!isValid) {
    throw new InvalidSessionError();
  }

  const tipoDocs = await categoriasService.getTipoDocs();
  return c.json(tipoDocs);
});
