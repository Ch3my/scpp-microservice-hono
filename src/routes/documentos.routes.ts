import { OpenAPIHono, createRoute, z } from '@hono/zod-openapi';
import { documentosService } from '../services/documentos.service';
import { sessionService } from '../services/session.service';
import { requireSession } from '../middleware/auth';
import {
  documentoSchema,
  documentosQuerySchema,
  createDocumentoSchema,
  updateDocumentoSchema,
  deleteDocumentoSchema,
} from '../schemas/documentos';
import { successResponseSchema } from '../schemas/common';
import { InvalidSessionError } from '../errors/http';
import type { AppEnv } from '../types/context';

export const documentosRouter = new OpenAPIHono<AppEnv>();

// Apply session validation middleware to GET routes
documentosRouter.use('/documentos', requireSession);

// ============== Route Definitions ==============

const getDocumentosRoute = createRoute({
  method: 'get',
  path: '/documentos',
  tags: ['Documentos'],
  request: {
    query: documentosQuerySchema,
  },
  responses: {
    200: {
      content: { 'application/json': { schema: z.array(documentoSchema) } },
      description: 'List of documents',
    },
  },
});

const createDocumentoRoute = createRoute({
  method: 'post',
  path: '/documentos',
  tags: ['Documentos'],
  request: {
    body: {
      content: {
        'application/json': { schema: createDocumentoSchema },
      },
    },
  },
  responses: {
    200: {
      content: { 'application/json': { schema: successResponseSchema } },
      description: 'Document created',
    },
  },
});

const updateDocumentoRoute = createRoute({
  method: 'put',
  path: '/documentos',
  tags: ['Documentos'],
  request: {
    body: {
      content: {
        'application/json': { schema: updateDocumentoSchema },
      },
    },
  },
  responses: {
    200: {
      content: { 'application/json': { schema: successResponseSchema } },
      description: 'Document updated',
    },
  },
});

const deleteDocumentoRoute = createRoute({
  method: 'delete',
  path: '/documentos',
  tags: ['Documentos'],
  request: {
    body: {
      content: {
        'application/json': { schema: deleteDocumentoSchema },
      },
    },
  },
  responses: {
    200: {
      content: { 'application/json': { schema: successResponseSchema } },
      description: 'Document deleted',
    },
  },
});

// ============== Route Handlers ==============

documentosRouter.openapi(getDocumentosRoute, async (c) => {
  const query = c.req.valid('query');
  const docs = await documentosService.getDocumentos(query);
  return c.json(docs);
});

documentosRouter.openapi(createDocumentoRoute, async (c) => {
  const data = c.req.valid('json');

  const isValid = await sessionService.validate(data.sessionHash);
  if (!isValid) {
    throw new InvalidSessionError();
  }

  const { sessionHash, ...documentData } = data;
  const result = await documentosService.createDocumento(documentData);
  return c.json(result);
});

documentosRouter.openapi(updateDocumentoRoute, async (c) => {
  const data = c.req.valid('json');

  const isValid = await sessionService.validate(data.sessionHash);
  if (!isValid) {
    throw new InvalidSessionError();
  }

  const { sessionHash, ...documentData } = data;
  const result = await documentosService.updateDocumento(documentData);
  return c.json(result);
});

documentosRouter.openapi(deleteDocumentoRoute, async (c) => {
  const data = c.req.valid('json');

  const isValid = await sessionService.validate(data.sessionHash);
  if (!isValid) {
    throw new InvalidSessionError();
  }

  const result = await documentosService.deleteDocumento(data.id);
  return c.json(result);
});
