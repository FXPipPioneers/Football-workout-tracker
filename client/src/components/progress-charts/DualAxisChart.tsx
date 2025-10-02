import { ComposedChart, Bar, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { Card } from "@/components/ui/card";

interface DualAxisChartProps {
  title: string;
  data: {
    week: string;
    [key: string]: string | number;
  }[];
  barKeys: { key: string; name: string; color: string }[];
  lineKeys: { key: string; name: string; color: string }[];
}

export default function DualAxisChart({ title, data, barKeys, lineKeys }: DualAxisChartProps) {
  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold mb-4">{title}</h3>
      <ResponsiveContainer width="100%" height={300}>
        <ComposedChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
          <XAxis
            dataKey="week"
            stroke="hsl(var(--muted-foreground))"
            fontSize={12}
            tickLine={false}
          />
          <YAxis
            yAxisId="left"
            stroke="hsl(var(--muted-foreground))"
            fontSize={12}
            tickLine={false}
            label={{ value: 'Hits', angle: -90, position: 'insideLeft', style: { fontSize: 12 } }}
          />
          <YAxis
            yAxisId="right"
            orientation="right"
            stroke="hsl(var(--muted-foreground))"
            fontSize={12}
            tickLine={false}
            label={{ value: 'Accuracy %', angle: 90, position: 'insideRight', style: { fontSize: 12 } }}
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
          {barKeys.map((barKey) => (
            <Bar
              key={barKey.key}
              yAxisId="left"
              dataKey={barKey.key}
              fill={barKey.color}
              name={barKey.name}
            />
          ))}
          {lineKeys.map((lineKey) => (
            <Line
              key={lineKey.key}
              yAxisId="right"
              type="monotone"
              dataKey={lineKey.key}
              stroke={lineKey.color}
              strokeWidth={2}
              name={lineKey.name}
              dot={{ r: 3 }}
            />
          ))}
        </ComposedChart>
      </ResponsiveContainer>
    </Card>
  );
}
