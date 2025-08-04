"use client"

import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
} from "@/src/app/_components/external/radix/chart"
import { formatCurrency } from "@/src/app/_components/utils/currency"
import { RouterOutputs } from "@/src/trpc/react"
import { Area, AreaChart, XAxis, YAxis } from "recharts"

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    const total = payload.reduce(
      (sum: number, entry: any) => sum + entry.value,
      0
    )

    return (
      <div className="rounded-lg border-2 border-default bg-transparent p-2 backdrop-blur-sm backdrop-filter">
        <p className="mb-2 font-semibold text-white">{`${label}`}</p>
        <div className="space-y-1">
          {payload
            .sort((a: any, b: any) => b.value - a.value)
            .map((entry: any, index: number) => (
              <div
                key={index}
                className="flex items-center justify-between space-x-4"
              >
                <div className="flex items-center space-x-2">
                  <div
                    className="h-3 w-3 rounded-full"
                    style={{ backgroundColor: entry.color }}
                  />
                  <span className="text-sm capitalize text-foreground">
                    {entry.name}
                  </span>
                </div>
                <span className="font-medium text-white">
                  R$ {formatCurrency(entry.value.toString())}
                </span>
              </div>
            ))}
        </div>
        <div className="mt-2 border-t border-default pt-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-foreground">Total:</span>
            <span className="font-bold">
              R$ {formatCurrency(total.toString())}
            </span>
          </div>
        </div>
      </div>
    )
  }

  return null
}
interface CategoriasChartProps {
  data: RouterOutputs["category"]["getAllWithStats"]
}
export function CategoriasChart({ data }: CategoriasChartProps) {
  if (data.chartData.length === 0) {
    return (
      <div className="flex h-32 w-full flex-col items-center justify-center text-default-600">
        Sem dados para exibir.
      </div>
    )
  }

  return (
    <ChartContainer config={data.categoryConfig} className="h-full w-full">
      <AreaChart
        accessibilityLayer
        data={data.chartData}
        margin={{
          left: 20,
          right: 20,
          top: 20,
          bottom: 20,
        }}
      >
        <XAxis
          dataKey="mes"
          tickLine={false}
          axisLine={false}
          tickMargin={8}
          tick={{ fill: "#9CA3AF", fontSize: 12 }}
        />

        <YAxis
          tickLine={false}
          axisLine={false}
          tickMargin={8}
          tick={{ fill: "#9CA3AF", fontSize: 12 }}
          tickFormatter={(value) => `R$ ${formatCurrency(value.toString())}`}
        />

        <ChartTooltip content={<CustomTooltip />} />

        <ChartLegend
          content={<ChartLegendContent className="text-default-800" />}
        />

        {Object.keys(data.categoryConfig).map((key) => (
          <Area
            key={key}
            dataKey={key}
            type="monotone"
            fill="url(#fillhabitacao)"
            //@ts-ignore
            stroke={data.categoryConfig[key].color}
            strokeWidth={2}
            stackId="1"
          />
        ))}
      </AreaChart>
    </ChartContainer>
  )
}
