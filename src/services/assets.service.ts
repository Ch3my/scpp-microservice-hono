import { select, insert, deleteRow } from '../db/repository';
import { formatDateToYYYYMMDD, formatDateTimeToSQL } from '../utils/date';
import type { Asset, AssetsQuery, CreateAsset } from '../schemas/assets';
import type { SuccessResponse } from '../schemas/common';

interface AssetRow {
  id: number;
  fk_categoria: number;
  descripcion: string;
  assetData: string;
  fecha: Date;
  categorias_descripcion: string;
}

/**
 * Assets service for asset management
 */
export const assetsService = {
  /**
   * Get assets with optional ID filter
   */
  async getAssets(params: AssetsQuery): Promise<Asset[]> {
    // Handle both 'id' and 'id[]' query parameter formats
    const idParam = params.id || params['id[]'];

    let query = `
      SELECT assets.id, assets.fk_categoria,
             assets.descripcion, assets.assetData, assets.fecha,
             categorias.descripcion as categorias_descripcion
      FROM assets
      INNER JOIN categorias ON assets.fk_categoria = categorias.id
      WHERE 1 = 1
    `;

    if (idParam) {
      const ids = Array.isArray(idParam) ? idParam.join(',') : idParam;
      query += ` AND assets.id IN (${ids})`;
    }

    query += ' ORDER BY fecha DESC, id DESC';

    const rows = await select<AssetRow>(query);

    // Post-processing: create nested objects and format dates
    return rows.map((row) => ({
      id: row.id,
      fk_categoria: row.fk_categoria,
      descripcion: row.descripcion,
      assetData: row.assetData,
      fecha: formatDateToYYYYMMDD(row.fecha),
      categoria: {
        descripcion: row.categorias_descripcion,
      },
    }));
  },

  /**
   * Create a new asset
   */
  async createAsset(data: Omit<CreateAsset, 'sessionHash'>): Promise<SuccessResponse> {
    // Convert ISO datetime to SQL format
    const formattedDate = formatDateTimeToSQL(data.fecha);

    const query = `
      INSERT INTO assets (fk_categoria, descripcion, assetData, fecha)
      VALUES (?, ?, ?, ?)
    `;

    const affectedRows = await insert(query, [
      data.fk_categoria,
      data.descripcion,
      data.assetData,
      formattedDate,
    ]);

    if (affectedRows === 1) {
      return {
        success: true,
        successDescription: ['Asset insertado Correctamente'],
      };
    }

    throw new Error('Failed to insert asset');
  },

  /**
   * Delete an asset
   */
  async deleteAsset(id: number): Promise<SuccessResponse> {
    const query = 'DELETE FROM assets WHERE id = ?';
    const affectedRows = await deleteRow(query, [id]);

    if (affectedRows === 1) {
      return {
        success: true,
        successDescription: ['Asset eliminado Correctamente'],
      };
    }

    throw new Error('Failed to delete asset');
  },
};
