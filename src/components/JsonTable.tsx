import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

type JsonRecord = Record<string, any>;

interface JsonTableProps {
  data: JsonRecord[];
  maxRows?: number;
}

export default function JsonTable({ data, maxRows = 100 }: JsonTableProps) {
  if (!data || !data.length || data.length === 0 || typeof data !== "object") {
    return (
      <div className="text-sm text-muted-foreground">No data available</div>
    );
  }

  const columns = Object.keys(data[0]);
  const rows = data.slice(0, maxRows);

  return (
    <div className="rounded-md border overflow-auto max-h-[70vh]">
      <Table>
        <TableHeader>
          <TableRow>
            {columns.map((col) => (
              <TableHead key={col} className="whitespace-nowrap">
                {col}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>

        <TableBody>
          {rows.map((row, rowIndex) => (
            <TableRow key={rowIndex}>
              {columns.map((col) => (
                <TableCell key={col} className="whitespace-nowrap">
                  {formatCell(row[col])}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {data.length > maxRows && (
        <div className="p-2 text-xs text-muted-foreground text-right">
          Showing {maxRows} of {data.length} rows
        </div>
      )}
    </div>
  );
}

/* ============================
   Cell Formatter
============================ */

function formatCell(value: any) {
  if (value === null || value === undefined) {
    return <span className="text-muted-foreground">—</span>;
  }

  if (typeof value === "boolean") {
    return value ? "✓" : "✗";
  }

  if (typeof value === "object") {
    return (
      <pre className="text-xs max-w-[300px] overflow-x-auto">
        {JSON.stringify(value, null, 2)}
      </pre>
    );
  }

  return String(value);
}
