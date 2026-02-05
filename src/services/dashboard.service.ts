import { select } from '../db/repository';
import { DateTime } from 'luxon';
import {
  getFirstDayOfMonthAgo,
  getLastDayOfCurrentMonth,
  generateMonthLabels,
} from '../utils/date';
import type { MonthlyGraphResponse } from '../schemas/dashboard';

interface MonthlyTotal {
  fecha: string;
  total: number;
}

interface CategoryExpenseRow {
  descripcion: string;
  total: string | number;
  catId: number;
}

interface CategoryExpenseDataItem {
  label: string;
  data: number;
  catId: number;
}

interface CategoryExpenseResponse {
  labels: string[];
  amounts: number[];
  data: CategoryExpenseDataItem[];
  range: {
    start: string;
    end: string;
  };
}

interface CurrentMonthSpendingRow {
  fk_tipoDoc: number;
  tipoDoc_descripcion: string;
  sumMonto: string | number;
}

interface TopGastoRow {
  fecha: string;
  proposito: string;
  monto: number;
}

interface CurrentMonthSpendingResponse {
  data: CurrentMonthSpendingRow[];
  porcentajeUsado: number;
  topGastos: TopGastoRow[];
}

interface YearlySumRow {
  id: number;
  descripcion: string;
  sumMonto: string | number;
}

interface YearlySumResponse {
  data: YearlySumRow[];
  porcentajeUsado: number;
  range: {
    start: string;
    end: string;
  };
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
  async getExpensesByCategory(nMonths?: number): Promise<CategoryExpenseResponse> {
    const months = nMonths ?? 13;

    const fechaInicio = DateTime.now()
      .minus({ months })
      .startOf('month')
      .toFormat('yyyy-MM-dd');

    const fechaTermino = DateTime.now().endOf('month').toFormat('yyyy-MM-dd');

    const query = `
      SELECT categorias.descripcion, SUM(documentos.monto) as total,
        categorias.id as catId
      FROM documentos
      INNER JOIN categorias ON documentos.fk_categoria = categorias.id
      WHERE documentos.fecha BETWEEN '${fechaInicio}' AND '${fechaTermino}'
      GROUP BY categorias.descripcion, categorias.id, documentos.fk_categoria
      ORDER BY total DESC
    `;

    const barData = await select<CategoryExpenseRow>(query);

    const labels: string[] = [];
    const amounts: number[] = [];
    const data: CategoryExpenseDataItem[] = [];

    for (const b of barData) {
      data.push({
        label: b.descripcion,
        data: Number(b.total),
        catId: b.catId,
      });
      labels.push(b.descripcion);
      amounts.push(Number(b.total));
    }

    return {
      labels,
      amounts,
      data,
      range: {
        start: fechaInicio,
        end: fechaTermino,
      },
    };
  },

  /**
   * Get current month spending
   */
  async getCurrentMonthSpending(): Promise<CurrentMonthSpendingResponse> {
    const now = DateTime.now();
    const firstDay = now.startOf('month').toFormat('yyyy-MM-dd');
    const lastDay = now.endOf('month').toFormat('yyyy-MM-dd');

    const query = `
      SELECT documentos.fk_tipoDoc, tipodoc.descripcion as tipoDoc_descripcion,
        SUM(documentos.monto) as sumMonto
      FROM documentos
      LEFT JOIN tipodoc ON documentos.fk_tipoDoc = tipodoc.id
      WHERE documentos.fecha >= '${firstDay}'
      AND documentos.fecha <= '${lastDay}'
      GROUP BY documentos.fk_tipoDoc
    `;

    const result = await select<CurrentMonthSpendingRow>(query);

    const montoIngreso = result.find((o) => o.fk_tipoDoc === 3);
    const montoGasto = result.find((o) => o.fk_tipoDoc === 1);

    if (!montoIngreso || !montoGasto) {
      return {
        data: [],
        porcentajeUsado: 0,
        topGastos: [],
      };
    }

    let porcentajeUsado =
      (Number(montoGasto.sumMonto) * 100) / Number(montoIngreso.sumMonto);
    porcentajeUsado = Number.parseFloat(porcentajeUsado.toFixed(2));

    // Get TOP gastos
    const topGastosQuery = `
      SELECT documentos.fecha, documentos.proposito, documentos.monto
      FROM documentos
      WHERE documentos.fk_tipoDoc = 1
      AND documentos.fecha >= '${firstDay}'
      AND documentos.fecha <= '${lastDay}'
      ORDER BY documentos.monto DESC
      LIMIT 10
    `;
    const topGastos = await select<TopGastoRow>(topGastosQuery);

    return {
      data: result,
      porcentajeUsado,
      topGastos,
    };
  },

  /**
   * Get yearly sum by document type
   */
  async getYearlySum(nMonths?: number): Promise<YearlySumResponse> {
    const months = nMonths ?? 12;

    const fechaInicio =
      DateTime.now().minus({ months }).toFormat('yyyy-MM-') + '01';
    const fechaTermino =
      DateTime.now().toFormat('yyyy-MM-') + DateTime.now().daysInMonth;

    const query = `
      SELECT tipodoc.id, tipodoc.descripcion, SUM(monto) as sumMonto
      FROM documentos
      LEFT JOIN tipodoc ON documentos.fk_tipoDoc = tipodoc.id
      WHERE documentos.fecha BETWEEN '${fechaInicio}' AND '${fechaTermino}'
      GROUP BY documentos.fk_tipoDoc
    `;

    const result = await select<YearlySumRow>(query);

    const montoGasto = result.find((element) => element.id === 1);
    const montoIngreso = result.find((element) => element.id === 3);

    let porcentajeUsado = 0;
    if (montoGasto && montoIngreso && Number(montoIngreso.sumMonto) > 0) {
      porcentajeUsado =
        (Number(montoGasto.sumMonto) * 100) / Number(montoIngreso.sumMonto);
      porcentajeUsado = Number.parseFloat(porcentajeUsado.toFixed(2));
    }

    return {
      data: result,
      porcentajeUsado,
      range: {
        start: fechaInicio,
        end: fechaTermino,
      },
    };
  },

  /**
   * Get expenses by category with timeseries data
   */
  async getExpensesByCategoryTimeseries(
    nMonths?: string
  ): Promise<CategoryTimeseriesResponse> {
    const months = nMonths !== undefined ? Number.parseInt(nMonths, 10) : 13;

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
