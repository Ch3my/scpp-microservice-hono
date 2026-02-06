import { OpenAPIHono, createRoute, z } from '@hono/zod-openapi';
import { categoriasService } from '../services/categorias.service';
import {
  categoriaSchema,
  tipoDocSchema,
  categoriasQuerySchema,
  tipoDocsQuerySchema,
} from '../schemas/categorias';
import { requireSession } from '../middleware/auth';
import type { AppEnv } from '../types/context';

export const categoriasRouter = new OpenAPIHono<AppEnv>();

// Apply session validation middleware to GET routes
categoriasRouter.use('/categorias', requireSession);
categoriasRouter.use('/tipo-docs', requireSession);

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
  const categorias = await categoriasService.getCategorias();
  return c.json(categorias);
});

categoriasRouter.openapi(getTipoDocsRoute, async (c) => {
  const tipoDocs = await categoriasService.getTipoDocs();
  return c.json(tipoDocs);
});
