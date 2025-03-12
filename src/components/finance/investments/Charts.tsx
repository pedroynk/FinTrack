import { BarChart, Bar, LineChart, Line, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { PieChart, Pie, Cell } from "recharts";

interface InvestmentChartsProps {
    pieChartData: { name: string; value: number }[];
    incomeChartData: { name: string; value: number }[];
    barChartData: { description: string; totalRentability: number }[];
    lineChartData: { month: string; totalRentability: number }[];
    COLORS: string[];
}

export function InvestmentCharts({ pieChartData, incomeChartData, COLORS, barChartData, lineChartData }: InvestmentChartsProps) {

    return (
        <div className="grid grid-cols-3 gap-6 p-6">
            {/* 📊 Gráfico de Barras (Esquerda) */}
            <div className="bg-white shadow rounded-lg p-4 space-y-6">
                <ResponsiveContainer width={400} height={300}>
                    <BarChart data={barChartData} layout="vertical">
                        <XAxis type="number" />
                        <YAxis dataKey="description" type="category" width={150} />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="totalRentability" fill="#82ca9d" barSize={30} />
                    </BarChart>
                </ResponsiveContainer>

                <div className="w-full">
                    <ResponsiveContainer width={500} height={300}>
                        <LineChart data={lineChartData}>
                            <XAxis dataKey="month" />
                            <YAxis />
                            <Tooltip />
                            <Legend />
                            <Line
                                type="monotone"
                                dataKey="totalRentability"
                                stroke="#8884d8"
                                strokeWidth={2}
                                dot={{ r: 4 }}
                                activeDot={{ r: 6 }}
                            />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* 📈 Gráficos de Pizza (Centro, Um Acima do Outro) */}
            <div className="bg-white shadow rounded-lg p-4 flex flex-col items-center gap-6">
                <PieChart width={350} height={300}>
                    <Pie
                        data={pieChartData}
                        cx="50%"
                        cy="50%"
                        outerRadius={110}
                        innerRadius={50}
                        paddingAngle={5}
                        dataKey="value"
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(1)}%`}
                    >
                        {pieChartData.map((_, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} stroke="#fff" strokeWidth={2} />
                        ))}
                    </Pie>
                    <Tooltip formatter={(value) => `${value}%`} />
                    <Legend verticalAlign="bottom" height={36} />
                </PieChart>

                <PieChart width={350} height={300}>
                    <Pie
                        data={incomeChartData}
                        cx="50%"
                        cy="50%"
                        outerRadius={110}
                        innerRadius={50}
                        paddingAngle={5}
                        dataKey="value"
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(1)}%`}
                    >
                        {incomeChartData.map((_, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} stroke="#fff" strokeWidth={2} />
                        ))}
                    </Pie>
                    <Tooltip formatter={(value) => `${value}%`} />
                    <Legend verticalAlign="bottom" height={36} />
                </PieChart>
            </div>
        </div>
    );
}
