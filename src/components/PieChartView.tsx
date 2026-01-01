import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";
import {
  aggregateChartData,
  Aggregation,
  ChartPoint,
} from "@/lib/analyzeJsonForVisualization";

const COLORS = [
  "hsl(var(--chart-1))",
  "hsl(var(--chart-2))",
  "hsl(var(--chart-3))",
  "hsl(var(--chart-4))",
  "hsl(var(--chart-5))",
];

interface PieChartViewProps {
  data: ChartPoint[];
  aggregation?: Aggregation;
}

export function PieChartView({
  data,
  aggregation = "percentage", // ✅ pie default
}: PieChartViewProps) {
  const chartData = aggregateChartData(data, aggregation);

  if (!chartData.length) {
    return <div className="text-sm text-muted-foreground">No data</div>;
  }

  return (
    <div className="w-full h-[400px]">
      <ResponsiveContainer>
        <PieChart>
          <Pie
            data={chartData}
            dataKey="value"
            nameKey="label"
            outerRadius={140}
            label
          >
            {chartData.map((_, index) => (
              <Cell key={index} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
