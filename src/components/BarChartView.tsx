import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import {
  aggregateChartData,
  Aggregation,
  ChartPoint,
} from "@/lib/analyzeJsonForVisualization";

interface BarChartViewProps {
  data: ChartPoint[];
  aggregation?: Aggregation;
}

export function BarChartView({
  data,
  aggregation = "auto",
}: BarChartViewProps) {
  const chartData = aggregateChartData(data, aggregation);

  if (!chartData.length) {
    return <div className="text-sm text-muted-foreground">No data</div>;
  }

  return (
    <div className="w-full h-[400px]">
      <ResponsiveContainer>
        <BarChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis
            dataKey="label"
            interval={0}
            angle={-20}
            textAnchor="end"
            height={80}
          />
          <YAxis />
          <Tooltip />
          <Bar
            dataKey="value"
            fill="hsl(var(--primary))"
            radius={[4, 4, 0, 0]}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
