import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, AreaChart, Area } from "recharts";

interface DashboardChartsProps {
    expensesByDate: { date: string; value: number; income: number }[];
    expensesByClass: { name: string; value: number }[];
    loading: boolean;
}

export function DashboardCharts({ expensesByDate, expensesByClass, loading }: DashboardChartsProps) {
    return (
        <div className="grid grid-cols-2 gap-6 p-6">
            {loading ? (
                <div className="flex justify-center items-center h-64">
                    <div className="animate-spin">Loading...</div>
                </div>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* 📉 Movimentações por Data */}
                    <div className="p-4 bg-white shadow rounded-lg">
                        <h2 className="text-m font-semibold mb-4">Movimentações por Data</h2>
                        <ResponsiveContainer width="100%" height={270}>
                <AreaChart data={expensesByDate}>
                  <XAxis dataKey="date" className="text-xs font-semibold mb-4" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Area type="monotone" dataKey="value" stroke="#ec5353" fill="#ec5353" name="Despesas (R$)" />
                  <Area type="monotone" dataKey="income" stroke="#4CAF50" fill="#4CAF50" name="Receitas (R$)" />
                </AreaChart>
              </ResponsiveContainer>
                    </div>

                    {/* 📊 Gráfico de Barras - Despesas por Classe */}
                    <div className="p-4 bg-white shadow rounded-lg">
                        <h2 className="text-m font-semibold mb-4">Despesas por Classe</h2>
                        <ResponsiveContainer width="100%" height={270}>
                <BarChart data={expensesByClass}>
                  <XAxis dataKey="name" className="text-xs font-semibold mb-4" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="value" fill="#FACD19" name="Valor (R$)" />
                </BarChart>
              </ResponsiveContainer>
                    </div>
                </div>
            )}
        </div>
    );
}
