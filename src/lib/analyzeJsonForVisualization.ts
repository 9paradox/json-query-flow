/* ============================
   Types
============================ */

export type DataClass =
  | "records"
  | "records-with-missing"
  | "schema-field-list"
  | "primitive-array"
  | "single-object"
  | "invalid";

export type AnalyzerMode = "strict" | "lenient";

export type ViewType = "table" | "bar" | "pie";

export interface AnalyzerResult {
  dataClass: DataClass;

  isTable: boolean;
  isBarChart: boolean;
  isPieChart: boolean;

  success: boolean;                // ✅ at least one view available
  availableViews: ViewType[];      // ✅ UI-ready

  warnings: string[];
  cleanedData: Record<string, any>[] | null;

  jsonata: {
    bar?: string;
    pie?: string;
  };
}

/* ============================
   ASYNC ANALYZER
============================ */

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
    availableViews: [],
    warnings: [],
    cleanedData: null,
    jsonata: {}
  };

  /* ============================
     GUARDS (order matters)
  ============================ */

  // 1️⃣ Array of primitives → schema / primitive list
  if (
    Array.isArray(input) &&
    input.length > 0 &&
    input.every(v => v === null || typeof v !== "object")
  ) {
    return {
      ...baseResult,
      dataClass:
        input.every(v => typeof v === "string")
          ? "schema-field-list"
          : "primitive-array"
    };
  }

  // 2️⃣ Single object
  if (typeof input === "object" && input !== null && !Array.isArray(input)) {
    return {
      ...baseResult,
      dataClass: "single-object"
    };
  }

  // 3️⃣ Must be non-empty array
  if (!Array.isArray(input) || input.length === 0) {
    return baseResult;
  }

  // 4️⃣ Must be array of objects
  if (input.some(v => typeof v !== "object" || v === null)) {
    return baseResult;
  }

  /* ============================
     RECORD ANALYSIS
  ============================ */

  const records = input as Record<string, any>[];

  // Collect all keys
  const keySet = new Set<string>();
  records.forEach(r => Object.keys(r).forEach(k => keySet.add(k)));
  const allKeys = [...keySet];

  // Detect missing keys
  const hasMissing = records.some(
    r => allKeys.some(k => !(k in r))
  );

  const dataClass: DataClass = hasMissing
    ? "records-with-missing"
    : "records";

  // Cleaned data (lenient mode only)
  const cleaned =
    mode === "lenient"
      ? records.map(r => {
          const obj: Record<string, any> = {};
          allKeys.forEach(k => {
            obj[k] = k in r ? r[k] : null;
          });
          return obj;
        })
      : null;

  /* ============================
     TABLE
  ============================ */

  const isTable =
    dataClass === "records" || mode === "lenient";

  /* ============================
     TYPE DETECTION
  ============================ */

  const stringKeys: string[] = [];
  const numberKeys: string[] = [];

  allKeys.forEach(key => {
    const values = records
      .map(r => r[key])
      .filter(v => v !== null && v !== undefined);

    if (values.length === 0) return;

    if (values.every(v => typeof v === "string")) {
      stringKeys.push(key);
    } else if (values.every(v => typeof v === "number")) {
      numberKeys.push(key);
    }
  });

  /* ============================
     BAR CHART
  ============================ */

  let isBarChart = false;

  if (stringKeys.length === 1 && numberKeys.length === 1) {
    const numKey = numberKeys[0];
    const missingNumeric = records.some(
      r => typeof r[numKey] !== "number"
    );

    if (!missingNumeric || mode === "lenient") {
      isBarChart = true;
    } else {
      baseResult.warnings.push(
        "Missing numeric values prevent bar chart"
      );
    }
  }

  /* ============================
     PIE CHART
  ============================ */

  let isPieChart = false;

  if (isBarChart) {
    const numKey = numberKeys[0];
    const nums = records
      .map(r => r[numKey])
      .filter(v => typeof v === "number");

    const sum = nums.reduce((a, b) => a + b, 0);

    if (nums.every(v => v >= 0) && sum > 0) {
      isPieChart = true;
    } else {
      baseResult.warnings.push(
        "Pie chart requires positive numeric values"
      );
    }
  }

  /* ============================
     JSONATA
  ============================ */

  if (isBarChart || isPieChart) {
    const label = stringKeys[0];
    const value = numberKeys[0];

    const expr = `$[${value} != null].{ "label": ${label}, "value": ${value} }`;

    if (isBarChart) baseResult.jsonata.bar = expr;
    if (isPieChart) baseResult.jsonata.pie = expr;
  }

  /* ============================
     AVAILABLE VIEWS + SUCCESS
  ============================ */

  const availableViews: ViewType[] = [];
  if (isTable) availableViews.push("table");
  if (isBarChart) availableViews.push("bar");
  if (isPieChart) availableViews.push("pie");

  const success = availableViews.length > 0;

  /* ============================
     FINAL RESULT
  ============================ */

  return {
    ...baseResult,
    dataClass,
    isTable,
    isBarChart,
    isPieChart,
    success,
    availableViews,
    cleanedData: cleaned
  };
}
