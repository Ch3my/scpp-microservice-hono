import { select, insert, update, deleteRow } from '../db/repository';
import type { FoodItem, FoodItemQuantity, FoodTransaction } from '../schemas/food';
import type {
  CreateFoodItem,
  UpdateFoodItem,
  CreateFoodTransaction,
  UpdateFoodTransaction,
} from '../schemas/food';
import type { SuccessResponse } from '../schemas/common';

/**
 * Food service for food inventory management
 */
export const foodService = {
  // ============== FOOD ITEMS ==============

  /**
   * Get food items with optional ID filter
   */
  async getFoodItems(id?: string | string[]): Promise<FoodItem[]> {
    let query = 'SELECT * FROM food_items WHERE 1 = 1';

    if (id) {
      const ids = Array.isArray(id) ? id.join(',') : id;
      query += ` AND food_items.id IN (${ids})`;
    }

    query += ' ORDER BY name';

    return select<FoodItem>(query);
  },

  /**
   * Get food items with calculated quantities
   */
  async getFoodItemsQuantity(): Promise<FoodItemQuantity[]> {
    const query = `
      SELECT
        fi.id,
        fi.name,
        fi.unit,
        COALESCE(SUM(
          CASE
            WHEN ft.transaction_type = 'in' THEN ft.quantity
            WHEN ft.transaction_type = 'out' THEN -ft.quantity
            ELSE 0
          END
        ), 0) as quantity
      FROM food_items fi
      LEFT JOIN food_transactions ft ON fi.id = ft.fk_food_item
      GROUP BY fi.id, fi.name, fi.unit
      ORDER BY fi.name
    `;

    return select<FoodItemQuantity>(query);
  },

  /**
   * Create a new food item
   */
  async createFoodItem(data: Omit<CreateFoodItem, 'sessionHash'>): Promise<SuccessResponse> {
    const query = 'INSERT INTO food_items (name, unit) VALUES (?, ?)';

    const affectedRows = await insert(query, [data.name, data.unit]);

    if (affectedRows === 1) {
      return {
        success: true,
        successDescription: ['Item insertado Correctamente'],
      };
    }

    throw new Error('Failed to insert food item');
  },

  /**
   * Update a food item
   */
  async updateFoodItem(data: Omit<UpdateFoodItem, 'sessionHash'>): Promise<SuccessResponse> {
    const query = 'UPDATE food_items SET name = ?, unit = ? WHERE id = ?';

    const affectedRows = await update(query, [data.name, data.unit, data.id]);

    if (affectedRows === 1) {
      return {
        success: true,
        successDescription: ['Item actualizado Correctamente'],
      };
    }

    throw new Error('Failed to update food item');
  },

  /**
   * Delete a food item
   */
  async deleteFoodItem(id: number): Promise<SuccessResponse> {
    const query = 'DELETE FROM food_items WHERE id = ?';
    const affectedRows = await deleteRow(query, [id]);

    if (affectedRows === 1) {
      return {
        success: true,
        successDescription: ['Item eliminado Correctamente'],
      };
    }

    throw new Error('Failed to delete food item');
  },

  // ============== FOOD TRANSACTIONS ==============

  /**
   * Get food transactions with optional food item filter
   */
  async getFoodTransactions(foodItemId?: string): Promise<FoodTransaction[]> {
    let query = 'SELECT * FROM food_transactions WHERE 1 = 1';

    if (foodItemId) {
      query += ` AND fk_food_item = ${foodItemId}`;
    }

    query += ' ORDER BY fecha DESC';

    return select<FoodTransaction>(query);
  },

  /**
   * Create a food transaction using stored procedure
   */
  async createFoodTransaction(
    data: Omit<CreateFoodTransaction, 'sessionHash'>
  ): Promise<SuccessResponse> {
    // Call the stored procedure
    const query = 'CALL insert_food_transaction(?, ?, ?, ?, ?, ?, @p_status)';

    try {
      const result = await insert(query, [
        data.foodItemId,
        data.quantity,
        data.transactionType,
        data.note || '',
        data.code || '',
        data.bestBefore || null,
      ]);

      // Zero means success based on old-app logic
      if (result === 0) {
        return {
          success: true,
          successDescription: ['Transaccion insertada correctamente'],
        };
      }

      throw new Error('Error al insertar transaccion');
    } catch (error) {
      if (error instanceof Error && 'sqlMessage' in error) {
        throw new Error((error as { sqlMessage: string }).sqlMessage);
      }
      throw error;
    }
  },

  /**
   * Update a food transaction
   */
  async updateFoodTransaction(
    data: Omit<UpdateFoodTransaction, 'sessionHash'>
  ): Promise<SuccessResponse> {
    const updates: string[] = [];
    const params: unknown[] = [];

    if (data.quantity !== undefined) {
      updates.push('quantity = ?');
      params.push(data.quantity);
    }
    if (data.note !== undefined) {
      updates.push('note = ?');
      params.push(data.note);
    }
    if (data.code !== undefined) {
      updates.push('code = ?');
      params.push(data.code);
    }
    if (data.bestBefore !== undefined) {
      updates.push('best_before = ?');
      params.push(data.bestBefore);
    }

    if (updates.length === 0) {
      return {
        success: true,
        successDescription: ['No hay cambios para actualizar'],
      };
    }

    params.push(data.id);
    const query = `UPDATE food_transactions SET ${updates.join(', ')} WHERE id = ?`;

    const affectedRows = await update(query, params);

    if (affectedRows === 1) {
      return {
        success: true,
        successDescription: ['Transaccion actualizada Correctamente'],
      };
    }

    throw new Error('Failed to update transaction');
  },

  /**
   * Delete a food transaction
   */
  async deleteFoodTransaction(id: number): Promise<SuccessResponse> {
    const query = 'DELETE FROM food_transactions WHERE id = ?';
    const affectedRows = await deleteRow(query, [id]);

    if (affectedRows === 1) {
      return {
        success: true,
        successDescription: ['Transaccion eliminada Correctamente'],
      };
    }

    throw new Error('Failed to delete transaction');
  },
};
