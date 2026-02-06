import { z } from '@hono/zod-openapi';

/**
 * Category nested object in document response
 */
export const categoriaNestedSchema = z.object({
  id: z.number(),
  descripcion: z.string(),
});

/**
 * TipoDoc nested object in document response
 */
export const tipoDocNestedSchema = z.object({
  id: z.number(),
  descripcion: z.string(),
});

/**
 * Document response schema
 */
export const documentoSchema = z
  .object({
    id: z.number(),
    fk_tipoDoc: z.number(),
    proposito: z.string(),
    monto: z.number(),
    fecha: z.string(), // 'yyyy-MM-dd' format
    fk_categoria: z.number().nullable(),
    categoria: categoriaNestedSchema.nullable(),
    tipoDoc: tipoDocNestedSchema,
  })
  .openapi('Documento');

/**
 * GET /documentos query parameters
 */
export const documentosQuerySchema = z.object({
  fk_tipoDoc: z.string().optional(),
  fechaInicio: z.string().optional(),
  fechaTermino: z.string().optional(),
  fk_categoria: z.string().optional(),
  searchPhrase: z.string().optional(),
  searchPhraseIgnoreOtherFilters: z.string().optional(),
  id: z.array(z.string()).or(z.string()).optional(),
  'id[]': z.array(z.string()).or(z.string()).optional(),
});

/**
 * POST /documentos request body
 */
export const createDocumentoSchema = z
  .object({
    fk_categoria: z.number().nullable(),
    fk_tipoDoc: z.number(),
    proposito: z.string(),
    monto: z.number(),
    fecha: z.string(),
  })
  .openapi('CreateDocumento');

/**
 * PUT /documentos request body
 */
export const updateDocumentoSchema = z
  .object({
    id: z.number(),
    fk_categoria: z.number().nullable(),
    fk_tipoDoc: z.number(),
    proposito: z.string(),
    monto: z.number(),
    fecha: z.string(),
  })
  .openapi('UpdateDocumento');

/**
 * DELETE /documentos request body
 */
export const deleteDocumentoSchema = z
  .object({
    id: z.number(),
  })
  .openapi('DeleteDocumento');

// Type exports
export type Documento = z.infer<typeof documentoSchema>;
export type DocumentosQuery = z.infer<typeof documentosQuerySchema>;
export type CreateDocumento = z.infer<typeof createDocumentoSchema>;
export type UpdateDocumento = z.infer<typeof updateDocumentoSchema>;
export type DeleteDocumento = z.infer<typeof deleteDocumentoSchema>;
