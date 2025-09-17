"use client";
import { Line, LineChart, XAxis, YAxis, CartesianGrid } from "recharts";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";

const data = [
  { fecha: "2025-09-01", neto: 42000 },
  { fecha: "2025-09-02", neto: 38500 },
  { fecha: "2025-09-03", neto: 51000 },
];

export default function DailyNetLine() {
  return (
    <ChartContainer
      config={{ neto: { label: "Neto", color: "var(--chart-1)" } }}
      className="min-h-[220px] w-full"
    >
      <LineChart data={data}>
        <CartesianGrid vertical={false} />
        <XAxis
          dataKey="fecha"
          tickLine={false}
          tickMargin={10}
          axisLine={false}
        />
        <YAxis tickLine={false} axisLine={false} />
        <ChartTooltip content={<ChartTooltipContent />} />
        <Line
          type="monotone"
          dataKey="neto"
          stroke="var(--color-neto)"
          strokeWidth={2}
          dot={false}
        />
      </LineChart>
    </ChartContainer>
  );
}
