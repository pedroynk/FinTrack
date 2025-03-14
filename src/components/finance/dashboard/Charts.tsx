"use client";

import { useState } from "react";
import { XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, CartesianGrid, Line, LineChart, PieChart, Pie, Sector, Label, Cell } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, ChartStyle, ChartTooltipContent } from "@/components/ui/chart";
import { Slider } from "@/components/ui/slider";

interface DashboardChartsProps {
    expensesByDate: { date: string; value: number; income: number }[];
    expensesByClass: { name: string; value: number }[];
    loading: boolean;
}

export function DashboardCharts({ expensesByDate, loading, expensesByClass }: DashboardChartsProps) {
    const id = "pie-chart";
    const [activeIndex, setActiveIndex] = useState(0);
    const COLORS = ["#FACD19", "#00C49F", "#FFBB28", "#FF8042", "#D32F2F", "#7B1FA2"];
    const [numClasses, setNumClasses] = useState(5);
    const sortedExpenses = expensesByClass
        .sort((a, b) => b.value - a.value)
        .slice(0, numClasses);


    if (loading) {
        return <div>Loading...</div>;
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6">
    {/* 📉 Movimentações por Data */}
    <Card className="h-[550px] w-full flex flex-col">
    <CardHeader>
        <CardTitle>Gastos por Período</CardTitle>
    </CardHeader>
    <CardContent className="h-full flex items-center justify-center">
        <ChartContainer id="finance-chart" className="w-full h-full">
            <ResponsiveContainer width="100%" height={450}>
                <LineChart data={expensesByDate} margin={{ left: 10, right: 12 }}>
                    <CartesianGrid vertical={false} stroke="hsl(var(--muted))" />
                    <XAxis
                        dataKey="date"
                        tickLine={false}
                        axisLine={false}
                        tickMargin={8}
                        tickFormatter={(value) => value.slice(0, 3)}
                        stroke="hsl(var(--muted-foreground))"
                    />
                    <YAxis 
                        stroke="hsl(var(--muted-foreground))" 
                        tickFormatter={(value) => `R$ ${value.toLocaleString("pt-BR", { useGrouping: false })}`} 
                    />
                    <Tooltip content={<ChartTooltipContent />} />
                    <Legend />
                    <Line
                        dataKey="value"
                        type="monotone"
                        stroke="hsl(var(--chart-1))"
                        strokeWidth={3}
                        dot={true}
                        name="Despesas (R$)"
                    />
                    <Line
                        dataKey="income"
                        type="monotone"
                        stroke="hsl(var(--chart-2))"
                        strokeWidth={3}
                        dot={true}
                        name="Receitas (R$)"
                    />
                </LineChart>
            </ResponsiveContainer>
        </ChartContainer>
    </CardContent>
</Card>


    {/* 📊 Gastos por Classe */}
    <div className="flex justify-end">
    <Card className="h-[550px] w-full flex flex-col">
    <ChartStyle id={id} />
    <CardHeader className="w-full flex justify-start">
        <CardTitle>Gastos por Classe</CardTitle>
    </CardHeader>
    <CardContent className="flex flex-col items-center justify-center w-full">
        <ChartContainer id={id} className="mx-auto aspect-square w-full max-w-[400px] flex justify-center">
            <PieChart width={400} height={400}>
                <Tooltip content={<ChartTooltipContent hideLabel />} />
                <Pie
                    data={sortedExpenses}
                    dataKey="value"
                    nameKey="name"
                    innerRadius={100}
                    outerRadius={140}
                    strokeWidth={3}
                    activeIndex={activeIndex}
                    onMouseEnter={(_, index) => setActiveIndex(index)}
                    activeShape={({ outerRadius = 0, ...props }) => (
                        <g>
                            <Sector {...props} outerRadius={outerRadius + 10} />
                            <Sector {...props} outerRadius={outerRadius + 25} innerRadius={outerRadius + 12} />
                        </g>
                    )}
                >
                    {sortedExpenses.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                    <Label
                        content={({ viewBox }) => {
                            if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                                return (
                                    <text
                                        x={viewBox.cx}
                                        y={viewBox.cy}
                                        textAnchor="middle"
                                        dominantBaseline="middle"
                                    >
                                        <tspan
                                            x={viewBox.cx}
                                            y={viewBox.cy}
                                            className="fill-foreground text-2xl font-bold"
                                        >
                                            {expensesByClass[activeIndex]?.value
                                                ? `R$ ${expensesByClass[activeIndex].value.toLocaleString("pt-BR")}`
                                                : "R$ 0"}
                                        </tspan>
                                        <tspan
                                            x={viewBox.cx}
                                            y={(viewBox.cy || 0) + 30}
                                            className="fill-muted-foreground"
                                        >
                                            {expensesByClass[activeIndex]?.name ?? ""}
                                        </tspan>
                                    </text>
                                );
                            }
                        }}
                    />
                </Pie>
            </PieChart>
        </ChartContainer>
        <div className="w-full flex flex-col items-center mt-8">
            <h3 className="text-3x1 font-medium">Classes exibidas: {numClasses}</h3>
            <Slider
                defaultValue={[numClasses]}
                max={expensesByClass.length}
                min={1}
                step={1}
                className="w-full"
                onValueChange={(value) => setNumClasses(value[0])}
            />
        </div>
    </CardContent>
</Card>
    </div>
</div>
    );
}
