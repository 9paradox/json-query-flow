export const AGGREGATIONS = {
  auto: "Auto",
  sum: "Sum",
  count: "Count",
  avg: "Average",
  percentage: "Percentage",
} as const;

export type Aggregation = keyof typeof AGGREGATIONS;

export const AGGREGATION_LIST = Object.keys(AGGREGATIONS) as Aggregation[];

export const AGGREGATION_OPTIONS = Object.entries(AGGREGATIONS).map(
  ([value, label]) => ({
    value: value as Aggregation,
    label,
  })
);

export type ChartPoint = {
  label: string;
  value: number;
} & Record<string, unknown>;

export function aggregateChartData(
  data: ChartPoint[],
  aggregation: Aggregation
): ChartPoint[] {
  if (!data || data.length === 0) return [];

  const map = new Map<string, number[]>();

  for (const { label, value } of data) {
    if (!map.has(label)) map.set(label, []);
    map.get(label)!.push(value);
  }

  const hasDuplicates = [...map.values()].some((v) => v.length > 1);

  if (aggregation === "auto") {
    aggregation = hasDuplicates ? "sum" : "sum";
  }

  let result: ChartPoint[] = [];

  switch (aggregation) {
    case "count":
      result = [...map.entries()].map(([label, values]) => ({
        label,
        value: values.length,
      }));
      break;

    case "avg":
      result = [...map.entries()].map(([label, values]) => ({
        label,
        value: values.reduce((a, b) => a + b, 0) / values.length,
      }));
      break;

    case "percentage": {
      const totals = [...map.entries()].map(([label, values]) => ({
        label,
        value: values.reduce((a, b) => a + b, 0),
      }));
      const sum = totals.reduce((a, b) => a + b.value, 0) || 1;
      result = totals.map((d) => ({
        label: d.label,
        value: Number(((d.value / sum) * 100).toFixed(2)),
      }));
      break;
    }

    case "sum":
    default:
      result = [...map.entries()].map(([label, values]) => ({
        label,
        value: values.reduce((a, b) => a + b, 0),
      }));
  }

  return result;
}

export function getAggregation(
  value: string | null | undefined,
  fallback: Aggregation = "auto"
): Aggregation {
  if (!value) return fallback;

  return value in AGGREGATIONS ? (value as Aggregation) : fallback;
}

export type DataClass =
  | "records"
  | "records-with-missing"
  | "schema-field-list"
  | "primitive-array"
  | "single-object"
  | "invalid";

export type AnalyzerMode = "strict" | "lenient";

export type ViewType = "json" | "table" | "bar" | "pie";

export interface AnalyzerResult {
  dataClass: DataClass;

  isTable: boolean;
  isBarChart: boolean;
  isPieChart: boolean;

  success: boolean;

  availableViews: ViewType[];

  warnings: string[];

  cleanedData: Record<string, any>[] | null;

  jsonata: {
    bar?: string;
    pie?: string;
  };

  chartData?: {
    bar?: ChartPoint[];
    pie?: ChartPoint[];
  };
}

export async function analyzeJsonForVisualization(
  input: unknown,
  options?: { mode?: AnalyzerMode }
): Promise<AnalyzerResult> {
  const mode: AnalyzerMode = options?.mode ?? "strict";

  const baseResult: AnalyzerResult = {
    dataClass: "invalid",
    isTable: false,
    isBarChart: false,
    isPieChart: false,
    success: false,
    availableViews: ["json"],
    warnings: [],
    cleanedData: null,
    jsonata: {},
    chartData: {},
  };

  if (
    Array.isArray(input) &&
    input.length > 0 &&
    input.every((v) => v === null || typeof v !== "object")
  ) {
    return {
      ...baseResult,
      dataClass: input.every((v) => typeof v === "string")
        ? "schema-field-list"
        : "primitive-array",
    };
  }

  if (typeof input === "object" && input !== null && !Array.isArray(input)) {
    return {
      ...baseResult,
      dataClass: "single-object",
    };
  }

  if (!Array.isArray(input) || input.length === 0) {
    return baseResult;
  }

  if (input.some((v) => typeof v !== "object" || v === null)) {
    return baseResult;
  }

  const records = input as Record<string, any>[];

  const keySet = new Set<string>();
  records.forEach((r) => Object.keys(r).forEach((k) => keySet.add(k)));
  const allKeys = [...keySet];

  const hasMissing = records.some((r) => allKeys.some((k) => !(k in r)));

  const dataClass: DataClass = hasMissing ? "records-with-missing" : "records";

  const cleanedData =
    mode === "lenient"
      ? records.map((r) => {
          const obj: Record<string, any> = {};
          allKeys.forEach((k) => {
            obj[k] = k in r ? r[k] : null;
          });
          return obj;
        })
      : null;

  const isTable = dataClass === "records" || mode === "lenient";

  if (!isTable && dataClass === "records-with-missing") {
    baseResult.warnings.push(
      "Inconsistent object keys. Table view requires uniform columns."
    );
  }

  const stringKeys: string[] = [];
  const numberKeys: string[] = [];

  allKeys.forEach((key) => {
    const values = records
      .map((r) => r[key])
      .filter((v) => v !== null && v !== undefined);

    if (values.length === 0) return;

    if (values.every((v) => typeof v === "string")) {
      stringKeys.push(key);
    } else if (values.every((v) => typeof v === "number")) {
      numberKeys.push(key);
    }
  });

  if (stringKeys.length > 0 && numberKeys.length === 0) {
    baseResult.warnings.push(
      "No numeric fields found. Charts require at least one numeric field."
    );
  }

  let isBarChart = false;
  let barData: ChartPoint[] | undefined;

  if (stringKeys.length === 1 && numberKeys.length === 1) {
    const labelKey = stringKeys[0];
    const valueKey = numberKeys[0];

    const validRows = records.filter((r) => typeof r[valueKey] === "number");

    if (validRows.length === records.length || mode === "lenient") {
      isBarChart = true;

      barData = validRows.map((r) => ({
        label: String(r[labelKey]),
        value: r[valueKey],
      }));
    } else {
      baseResult.warnings.push("Missing numeric values prevent bar chart.");
    }
  }

  let isPieChart = false;
  let pieData: ChartPoint[] | undefined;

  if (isBarChart && barData) {
    const sum = barData.reduce((a, b) => a + b.value, 0);

    if (barData.every((d) => d.value >= 0)) {
      if (sum > 0) {
        isPieChart = true;
        pieData = barData;
      } else {
        baseResult.warnings.push(
          "Pie chart requires total value greater than zero."
        );
      }
    } else {
      baseResult.warnings.push("Pie chart requires positive numeric values.");
    }
  }

  if (stringKeys.length === 1 && numberKeys.length === 1) {
    const label = stringKeys[0];
    const value = numberKeys[0];

    const expr = `$[${value} != null].{ "label": ${label}, "value": ${value} }`;

    baseResult.jsonata.bar = expr;
    baseResult.jsonata.pie = expr;
  }

  const availableViews: ViewType[] = ["json"];
  if (isTable) availableViews.push("table");
  if (isBarChart) availableViews.push("bar");
  if (isPieChart) availableViews.push("pie");

  const success = isTable || isBarChart || isPieChart;

  return {
    ...baseResult,
    dataClass,
    isTable,
    isBarChart,
    isPieChart,
    success,
    availableViews,
    cleanedData,
    chartData: {
      bar: barData,
      pie: pieData,
    },
  };
}
