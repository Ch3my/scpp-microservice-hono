import { z } from '@hono/zod-openapi';

/**
 * Asset category nested object
 */
export const assetCategoriaNestedSchema = z.object({
  descripcion: z.string(),
});

/**
 * Asset response schema
 */
export const assetSchema = z
  .object({
    id: z.number(),
    fk_categoria: z.number(),
    descripcion: z.string(),
    assetData: z.string(), // Base64 encoded
    fecha: z.string(),
    categoria: assetCategoriaNestedSchema,
  })
  .openapi('Asset');

/**
 * GET /assets query parameters
 */
export const assetsQuerySchema = z.object({
  id: z.array(z.string()).or(z.string()).optional(),
  'id[]': z.array(z.string()).or(z.string()).optional(),
});

/**
 * POST /assets request body
 */
export const createAssetSchema = z
  .object({
    fk_categoria: z.number(),
    descripcion: z.string(),
    assetData: z.string(), // Base64 encoded
    fecha: z.string(), // ISO datetime
  })
  .openapi('CreateAsset');

/**
 * DELETE /assets request body
 */
export const deleteAssetSchema = z
  .object({
    id: z.number(),
  })
  .openapi('DeleteAsset');

// Type exports
export type Asset = z.infer<typeof assetSchema>;
export type AssetsQuery = z.infer<typeof assetsQuerySchema>;
export type CreateAsset = z.infer<typeof createAssetSchema>;
export type DeleteAsset = z.infer<typeof deleteAssetSchema>;
