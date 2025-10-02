import { ComposedChart, Bar, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { Card } from "@/components/ui/card";

interface SkillMovesChartProps {
  title: string;
  data: {
    week: string;
    fakeShotLeft: number;
    fakeShotRight: number;
    fakeShotLeftPct: number;
    fakeShotRightPct: number;
    croquetaLeft: number;
    croquetaRight: number;
    croquetaLeftPct: number;
    croquetaRightPct: number;
    flipFlapLeft: number;
    flipFlapRight: number;
    flipFlapLeftPct: number;
    flipFlapRightPct: number;
  }[];
}

export default function SkillMovesChart({ title, data }: SkillMovesChartProps) {
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
            label={{ value: 'Reps', angle: -90, position: 'insideLeft', style: { fontSize: 12 } }}
          />
          <YAxis
            yAxisId="right"
            orientation="right"
            stroke="hsl(var(--muted-foreground))"
            fontSize={12}
            tickLine={false}
            label={{ value: '% Success', angle: 90, position: 'insideRight', style: { fontSize: 12 } }}
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
          <Bar yAxisId="left" dataKey="fakeShotLeft" fill="hsl(var(--chart-1))" name="Fake Shot L" />
          <Bar yAxisId="left" dataKey="fakeShotRight" fill="hsl(var(--chart-2))" name="Fake Shot R" />
          <Bar yAxisId="left" dataKey="croquetaLeft" fill="hsl(var(--chart-3))" name="Croqueta L" />
          <Bar yAxisId="left" dataKey="croquetaRight" fill="hsl(var(--chart-4))" name="Croqueta R" />
          <Bar yAxisId="left" dataKey="flipFlapLeft" fill="hsl(var(--chart-5))" name="Flip Flap L" />
          <Bar yAxisId="left" dataKey="flipFlapRight" fill="hsl(var(--primary))" name="Flip Flap R" />
          <Line yAxisId="right" type="monotone" dataKey="fakeShotLeftPct" stroke="hsl(var(--chart-1))" strokeWidth={2} strokeDasharray="5 5" dot={false} />
          <Line yAxisId="right" type="monotone" dataKey="croquetaLeftPct" stroke="hsl(var(--chart-3))" strokeWidth={2} strokeDasharray="5 5" dot={false} />
          <Line yAxisId="right" type="monotone" dataKey="flipFlapLeftPct" stroke="hsl(var(--chart-5))" strokeWidth={2} strokeDasharray="5 5" dot={false} />
        </ComposedChart>
      </ResponsiveContainer>
    </Card>
  );
}
