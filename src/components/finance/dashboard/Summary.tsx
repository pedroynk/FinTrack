
interface DashboardSummarysProps {
    totalIncome: number;
    totalExpenses: number;
}

export function DashboardSummary({ totalIncome, totalExpenses }: DashboardSummarysProps) {
    return (
        <div className="grid grid-cols-2 gap-6 p-6">
            {/* 📊 Total de Receitas e Despesas */}
            <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="p-4 bg-green-100 shadow rounded-lg">
                    <h3 className="text-lg font-semibold text-green-800">Total de Receitas</h3>
                    <p className="text-2xl font-bold text-green-900">R$ {totalIncome.toFixed(2)}</p>
                </div>
                <div className="p-4 bg-red-100 shadow rounded-lg">
                    <h3 className="text-lg font-semibold text-red-800">Total de Despesas</h3>
                    <p className="text-2xl font-bold text-red-900">R$ {totalExpenses.toFixed(2)}</p>
                </div>
            </div>
        </div>
            );
}
