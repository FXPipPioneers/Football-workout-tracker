import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { Card } from "@/components/ui/card";

interface SimpleLineChartProps {
  title: string;
  data: {
    week: string;
    [key: string]: string | number;
  }[];
  lines: { key: string; name: string; color: string }[];
  yAxisLabel?: string;
}

export default function SimpleLineChart({ title, data, lines, yAxisLabel }: SimpleLineChartProps) {
  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold mb-4">{title}</h3>
      <ResponsiveContainer width="100%" height={250}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
          <XAxis
            dataKey="week"
            stroke="hsl(var(--muted-foreground))"
            fontSize={12}
            tickLine={false}
          />
          <YAxis
            stroke="hsl(var(--muted-foreground))"
            fontSize={12}
            tickLine={false}
            label={yAxisLabel ? { value: yAxisLabel, angle: -90, position: 'insideLeft', style: { fontSize: 12 } } : undefined}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: "hsl(var(--popover))",
              border: "1px solid hsl(var(--border))",
              borderRadius: "6px",
            }}
            labelStyle={{ color: "hsl(var(--popover-foreground))" }}
          />
          <Legend />
          {lines.map((line) => (
            <Line
              key={line.key}
              type="monotone"
              dataKey={line.key}
              stroke={line.color}
              strokeWidth={2}
              name={line.name}
              dot={{ r: 3 }}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </Card>
  );
}
