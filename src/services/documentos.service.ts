import { select, insert, update, deleteRow } from '../db/repository';
import { formatDateToYYYYMMDD } from '../utils/date';
import { DateTime } from 'luxon';
import type {
  Documento,
  DocumentosQuery,
  CreateDocumento,
  UpdateDocumento,
} from '../schemas/documentos';
import type { SuccessResponse } from '../schemas/common';

interface DocumentoRow {
  id: number;
  fk_tipoDoc: number;
  proposito: string;
  monto: number;
  fecha: Date;
  fk_categoria: number;
  categorias_descripcion: string;
  tipoDoc_descripcion: string;
}

/**
 * Documentos service for document management
 */
export const documentosService = {
  /**
   * Get documents with optional filters
   */
  async getDocumentos(params: DocumentosQuery): Promise<Documento[]> {
    const {
      fk_tipoDoc,
      fechaInicio,
      fechaTermino,
      fk_categoria,
      searchPhrase,
      searchPhraseIgnoreOtherFilters,
      id,
    } = params;

    let ignoreFilter = false;
    if (searchPhrase && searchPhraseIgnoreOtherFilters === 'true') {
      ignoreFilter = true;
    }

    let query = `
      SELECT documentos.id, documentos.fk_tipoDoc, documentos.proposito,
             documentos.monto, documentos.fecha, documentos.fk_categoria,
             categorias.descripcion as categorias_descripcion,
             tipodoc.descripcion as tipoDoc_descripcion
      FROM documentos
      LEFT JOIN categorias ON documentos.fk_categoria = categorias.id
      LEFT JOIN tipodoc ON documentos.fk_tipoDoc = tipodoc.id
      WHERE 1 = 1
    `;

    const bindings: unknown[] = [];

    if (fk_tipoDoc) {
      query += ` AND documentos.fk_tipoDoc IN (${fk_tipoDoc})`;
    }

    if (fechaInicio && !ignoreFilter) {
      const date = DateTime.fromISO(fechaInicio);
      query += ` AND documentos.fecha >= '${date.toFormat('yyyy-MM-dd')}'`;
    }

    if (fechaTermino && !ignoreFilter) {
      const date = DateTime.fromISO(fechaTermino);
      query += ` AND documentos.fecha <= '${date.toFormat('yyyy-MM-dd')}'`;
    }

    if (fk_categoria && !ignoreFilter) {
      query += ` AND documentos.fk_categoria IN (${fk_categoria})`;
    }

    if (searchPhrase && searchPhrase.length >= 3) {
      query += ` AND documentos.proposito LIKE '%${searchPhrase}%'`;
    }

    // Handle both 'id' and 'id[]' query parameter formats
    const idParam = id || params['id[]'];
    if (idParam) {
      const ids = Array.isArray(idParam) ? idParam.join(',') : idParam;
      query += ` AND documentos.id IN (${ids})`;
    }

    query += ' ORDER BY documentos.fecha DESC, documentos.id DESC LIMIT 99';

    const rows = await select<DocumentoRow>(query, bindings);

    // Post-processing: create nested objects and format dates
    return rows.map((row) => ({
      id: row.id,
      fk_tipoDoc: row.fk_tipoDoc,
      proposito: row.proposito,
      monto: row.monto,
      fecha: formatDateToYYYYMMDD(row.fecha),
      fk_categoria: row.fk_categoria,
      categoria: {
        id: row.fk_categoria,
        descripcion: row.categorias_descripcion,
      },
      tipoDoc: {
        id: row.fk_tipoDoc,
        descripcion: row.tipoDoc_descripcion,
      },
    }));
  },

  /**
   * Create a new document
   */
  async createDocumento(data: Omit<CreateDocumento, 'sessionHash'>): Promise<SuccessResponse> {
    const query = `
      INSERT INTO documentos (fk_tipoDoc, proposito, monto, fecha, fk_categoria)
      VALUES (?, ?, ?, ?, ?)
    `;

    const affectedRows = await insert(query, [
      data.fk_tipoDoc,
      data.proposito,
      data.monto,
      data.fecha,
      data.fk_categoria,
    ]);

    if (affectedRows === 1) {
      return {
        success: true,
        successDescription: ['Documento insertado Correctamente'],
      };
    }

    throw new Error('Failed to insert document');
  },

  /**
   * Update an existing document
   */
  async updateDocumento(data: Omit<UpdateDocumento, 'sessionHash'>): Promise<SuccessResponse> {
    const query = `
      UPDATE documentos
      SET fk_tipoDoc = ?, proposito = ?, monto = ?, fecha = ?, fk_categoria = ?
      WHERE id = ?
    `;

    const affectedRows = await update(query, [
      data.fk_tipoDoc,
      data.proposito,
      data.monto,
      data.fecha,
      data.fk_categoria,
      data.id,
    ]);

    if (affectedRows === 1) {
      return {
        success: true,
        successDescription: ['Documento actualizado Correctamente'],
      };
    }

    throw new Error('Failed to update document');
  },

  /**
   * Delete a document
   */
  async deleteDocumento(id: number): Promise<SuccessResponse> {
    const query = 'DELETE FROM documentos WHERE id = ?';
    const affectedRows = await deleteRow(query, [id]);

    if (affectedRows === 1) {
      return {
        success: true,
        successDescription: ['Documento eliminado Correctamente'],
      };
    }

    throw new Error('Failed to delete document');
  },
};
