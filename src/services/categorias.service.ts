import { select } from '../db/repository';
import type { Categoria, TipoDoc } from '../schemas/categorias';

/**
 * Categorias service for category and document type management
 */
export const categoriasService = {
  /**
   * Get all categories ordered by 'orden' field
   */
  async getCategorias(): Promise<Categoria[]> {
    const query = 'SELECT id, descripcion, orden FROM categorias ORDER BY orden';
    return select<Categoria>(query);
  },

  /**
   * Get all document types
   */
  async getTipoDocs(): Promise<TipoDoc[]> {
    const query = 'SELECT id, descripcion FROM tipodoc';
    return select<TipoDoc>(query);
  },
};
