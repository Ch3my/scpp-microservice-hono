import { select } from '../db/repository';
import { DateTime } from 'luxon';
import {
  getFirstDayOfMonthAgo,
  getLastDayOfCurrentMonth,
  generateMonthLabels,
  getCurrentYear,
} from '../utils/date';
import type { MonthlyGraphResponse } from '../schemas/dashboard';

interface MonthlyTotal {
  fecha: string;
  total: number;
}

interface CategoryExpense {
  categoria: string;
  total: number;
}

interface YearlyTotal {
  year: number;
  total: number;
}

interface CategoryTimeseriesRow {
  categoryId: number;
  categoryName: string;
  month: string;
  total: string | number;
}

interface CategoryTimeseriesDataset {
  label: string;
  categoryId: number;
  data: number[];
}

interface CategoryTimeseriesResponse {
  labels: string[];
  datasets: CategoryTimeseriesDataset[];
  range: {
    start: string;
    end: string;
  };
}

/**
 * Dashboard service for financial analytics
 */
export const dashboardService = {
  /**
   * Get dashboard overview data
   */
  async getDashboard(): Promise<unknown> {
    // Return basic dashboard data - customize based on actual requirements
    return {};
  },

  /**
   * Get monthly graph data for income, expenses, and savings
   */
  async getMonthlyGraph(nMonths: number): Promise<MonthlyGraphResponse> {
    const fechaInicio = getFirstDayOfMonthAgo(nMonths);
    const fechaTermino = getLastDayOfCurrentMonth();
    const labels = generateMonthLabels(nMonths);

    // Get gastos (expenses) - fk_tipoDoc = 1
    const gastosQuery = `
      SELECT SUBSTRING(fecha, 1, 7) as fecha, SUM(monto) as total
      FROM documentos
      WHERE fecha BETWEEN '${fechaInicio}' AND '${fechaTermino}'
      AND fk_tipoDoc = 1
      GROUP BY SUBSTRING(fecha, 1, 7)
      ORDER BY fecha ASC
    `;
    const gastosData = await select<MonthlyTotal>(gastosQuery);
    const gastosMap = new Map(gastosData.map((g) => [g.fecha, Number(g.total)]));
    const gastosDataset = labels.map((month) => gastosMap.get(month) || 0);

    // Get ingresos (income) - fk_tipoDoc = 3
    const ingresosQuery = `
      SELECT SUBSTRING(fecha, 1, 7) as fecha, SUM(monto) as total
      FROM documentos
      WHERE fecha BETWEEN '${fechaInicio}' AND '${fechaTermino}'
      AND fk_tipoDoc = 3
      GROUP BY SUBSTRING(fecha, 1, 7)
      ORDER BY fecha ASC
    `;
    const ingresosData = await select<MonthlyTotal>(ingresosQuery);
    const ingresosMap = new Map(ingresosData.map((i) => [i.fecha, Number(i.total)]));
    const ingresosDataset = labels.map((month) => ingresosMap.get(month) || 0);

    // Get ahorros (savings) - fk_tipoDoc = 2 (cumulative)
    const ahorrosQuery = `
      SELECT SUBSTRING(fecha, 1, 7) as fecha, SUM(monto) as total
      FROM documentos
      WHERE fk_tipoDoc = 2
      GROUP BY SUBSTRING(fecha, 1, 7)
      ORDER BY fecha ASC
    `;
    const ahorrosData = await select<MonthlyTotal>(ahorrosQuery);
    const ahorrosMap = new Map(ahorrosData.map((a) => [a.fecha, Number(a.total)]));

    // Calculate cumulative ahorros
    let cumulativeSum = 0;

    // Sum all ahorros before the time range
    for (const [fecha, total] of ahorrosMap) {
      if (fecha < labels[0]) {
        cumulativeSum += total;
      }
    }

    // Build cumulative dataset
    const ahorrosDataset = labels.map((month) => {
      if (ahorrosMap.has(month)) {
        cumulativeSum += ahorrosMap.get(month)!;
      }
      return cumulativeSum;
    });

    return {
      labels,
      gastosDataset,
      ingresosDataset,
      ahorrosDataset,
      range: {
        start: fechaInicio,
        end: fechaTermino,
      },
    };
  },

  /**
   * Get expenses grouped by category
   */
  async getExpensesByCategory(
    fechaInicio?: string,
    fechaTermino?: string
  ): Promise<CategoryExpense[]> {
    let query = `
      SELECT categorias.descripcion as categoria, SUM(documentos.monto) as total
      FROM documentos
      INNER JOIN categorias ON documentos.fk_categoria = categorias.id
      WHERE documentos.fk_tipoDoc = 1
    `;

    if (fechaInicio) {
      query += ` AND documentos.fecha >= '${fechaInicio}'`;
    }
    if (fechaTermino) {
      query += ` AND documentos.fecha <= '${fechaTermino}'`;
    }

    query += ' GROUP BY categorias.descripcion ORDER BY total DESC';

    return select<CategoryExpense>(query);
  },

  /**
   * Get current month spending
   */
  async getCurrentMonthSpending(): Promise<unknown> {
    const now = DateTime.now();
    const startOfMonth = now.startOf('month').toFormat('yyyy-MM-dd');
    const endOfMonth = now.endOf('month').toFormat('yyyy-MM-dd');

    const query = `
      SELECT SUM(monto) as total
      FROM documentos
      WHERE fk_tipoDoc = 1
      AND fecha BETWEEN '${startOfMonth}' AND '${endOfMonth}'
    `;

    const result = await select<{ total: number }>(query);
    return { total: result[0]?.total || 0 };
  },

  /**
   * Get yearly sum by document type
   */
  async getYearlySum(year?: string): Promise<YearlyTotal[]> {
    const targetYear = year || getCurrentYear().toString();

    const query = `
      SELECT YEAR(fecha) as year, SUM(monto) as total
      FROM documentos
      WHERE YEAR(fecha) = ${targetYear}
      GROUP BY YEAR(fecha)
    `;

    return select<YearlyTotal>(query);
  },

  /**
   * Get expenses by category with timeseries data
   */
  async getExpensesByCategoryTimeseries(
    nMonths?: string
  ): Promise<CategoryTimeseriesResponse> {
    const months = Number.parseInt(nMonths || '13', 10);

    const fechaInicio = DateTime.now()
      .minus({ months })
      .startOf('month')
      .toFormat('yyyy-MM-dd');

    const fechaTermino = DateTime.now().endOf('month').toFormat('yyyy-MM-dd');

    const query = `
      SELECT
        categorias.id as categoryId,
        categorias.descripcion as categoryName,
        SUBSTRING(documentos.fecha, 1, 7) as month,
        SUM(documentos.monto) as total
      FROM documentos
      INNER JOIN categorias ON documentos.fk_categoria = categorias.id
      WHERE documentos.fecha BETWEEN '${fechaInicio}' AND '${fechaTermino}'
      AND documentos.fk_tipoDoc = 1
      GROUP BY categorias.id, categorias.descripcion, SUBSTRING(documentos.fecha, 1, 7)
      ORDER BY categorias.descripcion ASC, month ASC
    `;

    const expensesData = await select<CategoryTimeseriesRow>(query);

    // Generate month labels for the time range
    const labels: string[] = [];
    for (let i = months - 1; i >= 0; i--) {
      labels.push(DateTime.now().minus({ months: i }).toFormat('yyyy-MM'));
    }

    // Group data by category
    const categoriesMap = new Map<
      number,
      { label: string; categoryId: number; monthlyTotals: Record<string, number> }
    >();

    for (const row of expensesData) {
      if (!categoriesMap.has(row.categoryId)) {
        categoriesMap.set(row.categoryId, {
          label: row.categoryName,
          categoryId: row.categoryId,
          monthlyTotals: {},
        });
      }
      categoriesMap.get(row.categoryId)!.monthlyTotals[row.month] = Number(row.total);
    }

    // Build datasets array with complete monthly data
    const datasets: CategoryTimeseriesDataset[] = [];
    for (const categoryData of categoriesMap.values()) {
      const monthlyData = labels.map(
        (month) => categoryData.monthlyTotals[month] || 0
      );

      datasets.push({
        label: categoryData.label,
        categoryId: categoryData.categoryId,
        data: monthlyData,
      });
    }

    return {
      labels,
      datasets,
      range: {
        start: fechaInicio,
        end: fechaTermino,
      },
    };
  },
};
