import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, Tooltip, Legend, LabelList, CartesianGrid, ResponsiveContainer } from "recharts";
import { PieChart, Pie, Cell } from "recharts";


interface InvestmentChartsProps {
    pieChartData: { name: string; value: number }[];
    incomeChartData: { name: string; value: number }[];
    barChartData: { description: string; totalRentability: number }[];
    lineChartData: { month: string; totalRentability: number }[];
    COLORS: string[];
}

const chartConfig = {
    totalRentability: { label: "Rentabilidade", color: "#4CAF50" },
    description: { label: "Descrição", color: "#4CAF50" }
};


export function InvestmentCharts({ pieChartData, incomeChartData, COLORS, barChartData, lineChartData }: InvestmentChartsProps) {
    return (
        <div className="grid gap-6 p-6 sm:grid-cols-1 lg:grid-cols-3 xl:grid-cols-4">
            {/* 📊 Gráfico de Barras (Esquerda) */}
            <div className="p-4 sm:col-span-1 lg:col-span-2 xl:col-span-2 mb-6">
                <Card className="sm:col-span-1 lg:col-span-3 mb-6">
                    <CardHeader>
                        <CardTitle>Rentabilidade de Investimentos</CardTitle>
                        <CardDescription>Rentabilidade de Investimentos</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <ChartContainer config={chartConfig} className="h-auto md:h-[410px] w-full">
                            <BarChart
                                accessibilityLayer
                                data={barChartData}
                                layout="vertical"
                                margin={{
                                    right: 32,
                                    left: 20
                                }}
                            >
                                <CartesianGrid horizontal={false} />
                                <YAxis
                                    dataKey="description"
                                    fill="white"
                                    type="category"
                                    tickLine={false}
                                    tickMargin={10}
                                    axisLine={false}
                                    tickFormatter={(value) => value.slice(0, 3)}
                                    hide
                                />
                                <XAxis dataKey="totalRentability" type="number" hide />
                                <ChartTooltip
                                    cursor={false}
                                    content={<ChartTooltipContent indicator="line" />}
                                />
                                <Bar
                                    dataKey="totalRentability"
                                    layout="vertical"
                                    radius={4}
                                >
                                    {barChartData.map((_, index) => (
                                        <Cell
                                            key={`cell-${index}`}
                                            fill={COLORS[index % COLORS.length]}
                                        />
                                    ))}
                                    <LabelList
                                        dataKey="description"
                                        position="insideLeft"
                                        offset={8}
                                        fontSize={20}
                                        fill="#fff"
                                    />
                                    <LabelList
                                        dataKey="totalRentability"
                                        position="right"
                                        offset={12}
                                        fontSize={14}
                                        fill="#fff"
                                    />
                                </Bar>
                            </BarChart>

                        </ChartContainer>
                    </CardContent>
                </Card>

                <Card className="sm:col-span-1 lg:col-span-3 mb-6">
                    <CardHeader>
                        <CardTitle>Rentabilidade ao Longo do Tempo</CardTitle>
                        <CardDescription>Rentabilidade Geral ao Longo dos Meses</CardDescription>
                    </CardHeader>
                    <CardContent className="pb-4">
                        <ChartContainer config={chartConfig} className="h-auto md:h-[420px] w-full">
                            <LineChart
                                data={lineChartData}
                                margin={{ top: 5, right: 10, left: 10, bottom: 0 }}
                            >
                                <XAxis dataKey="month" />
                                <YAxis />
                                <Line
                                    type="monotone"
                                    dataKey="totalRentability"
                                    stroke={chartConfig.totalRentability.color}
                                    strokeWidth={2}
                                    activeDot={{ r: 6, fill: chartConfig.totalRentability.color }}
                                />
                                <ChartTooltip content={<ChartTooltipContent />} />
                            </LineChart>
                        </ChartContainer>
                    </CardContent>
                </Card>
            </div>

            {/* 📈 Gráficos de Pizza (Centro, Um Acima do Outro) */}
            <div className="p-4 sm:col-span-1 lg:col-span-2 xl:col-span-2">
                {/* Primeiro gráfico de pizza */}
                <Card className="sm:col-span-1 lg:col-span-3 mb-6">
                    <CardHeader>
                        <CardTitle>Distribuição da Carteira de Investimentos</CardTitle>
                        <CardDescription>Distribuição da Carteira</CardDescription>
                    </CardHeader>
                    <CardContent className="flex-1 pb-0">
                        <ChartContainer config={chartConfig}>
                            <ResponsiveContainer width="100%" height={400}>
                                <PieChart>
                                    <ChartTooltip cursor={false} content={<ChartTooltipContent hideLabel />} />
                                    <Pie
                                        data={pieChartData.filter((item) => item.value > 0)}
                                        dataKey="value"
                                        nameKey="name"
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={50}
                                        outerRadius={110}
                                        paddingAngle={5}
                                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(1)}%`}
                                    >
                                        {pieChartData.map((_, index) => (
                                            <Cell
                                                key={`cell-${index}`}
                                                fill={COLORS[index % COLORS.length]}
                                                stroke="#fff"
                                                strokeWidth={2}
                                            />
                                        ))}
                                    </Pie>
                                    <Tooltip formatter={(value) => `${value}%`} />
                                    <Legend verticalAlign="bottom" height={36} />
                                </PieChart>
                            </ResponsiveContainer>
                        </ChartContainer>
                    </CardContent>
                </Card>

                {/* Segundo gráfico de pizza */}
                <Card className="sm:col-span-1 lg:col-span-3 mb-6">
                    <CardHeader>
                        <CardTitle>Distribuição de Renda</CardTitle>
                        <CardDescription>Distribuição de Renda</CardDescription>
                    </CardHeader>
                    <CardContent className="flex-1 pb-0">
                        <ChartContainer config={chartConfig}>
                            <ResponsiveContainer width="100%" height={400}>
                                <PieChart>
                                    <ChartTooltip cursor={false} content={<ChartTooltipContent hideLabel />} />
                                    <Pie
                                        data={incomeChartData.filter((item) => item.value > 0)}
                                        dataKey="value"
                                        nameKey="name"
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={50}
                                        outerRadius={110}
                                        paddingAngle={5}
                                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(1)}%`}
                                    >
                                        {incomeChartData.map((_, index) => (
                                            <Cell
                                                key={`cell-${index}`}
                                                fill={COLORS[index % COLORS.length]}
                                                stroke="#fff"
                                                strokeWidth={2}
                                            />
                                        ))}
                                    </Pie>
                                    <Tooltip formatter={(value) => `${value}%`} />
                                    <Legend verticalAlign="bottom" height={36} />
                                </PieChart>
                            </ResponsiveContainer>
                        </ChartContainer>
                    </CardContent>
                </Card>
            </div>
        </div>


    );
}