import { z } from '@hono/zod-openapi';

/**
 * Category schema
 */
export const categoriaSchema = z
  .object({
    id: z.number(),
    descripcion: z.string(),
    orden: z.number().optional(),
  })
  .openapi('Categoria');

/**
 * TipoDoc schema
 */
export const tipoDocSchema = z
  .object({
    id: z.number(),
    descripcion: z.string(),
  })
  .openapi('TipoDoc');

/**
 * GET /categorias query parameters
 */
export const categoriasQuerySchema = z.object({
  sessionHash: z.string().min(1, 'Session hash is required'),
});

/**
 * GET /tipo-docs query parameters
 */
export const tipoDocsQuerySchema = z.object({
  sessionHash: z.string().min(1, 'Session hash is required'),
});

// Type exports
export type Categoria = z.infer<typeof categoriaSchema>;
export type TipoDoc = z.infer<typeof tipoDocSchema>;
export type CategoriasQuery = z.infer<typeof categoriasQuerySchema>;
export type TipoDocsQuery = z.infer<typeof tipoDocsQuerySchema>;
