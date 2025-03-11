import { PieChart, Pie, Cell, Tooltip, Legend } from "recharts";

interface InvestmentPieChartsProps {
    pieChartData: { name: string; value: number }[];
    incomeChartData: { name: string; value: number }[];
    COLORS: string[];
}

export function InvestmentPieCharts({ pieChartData, incomeChartData, COLORS }: InvestmentPieChartsProps) {
    return (
        <div className="bg-white shadow rounded-lg p-4">
            <div className="bg-white shadow rounded-lg p-4 flex justify-center items-center">
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
            </div>

            {/* Gráfico de Distribuição de Rendimentos */}
            <div className="bg-white shadow rounded-lg p-4 flex justify-center items-center">
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
