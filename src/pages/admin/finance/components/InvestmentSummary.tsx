interface InvestmentSummaryProps {
    totalInvested: number;
    totalUpdated: number;
    totalGain: number;
}

export function InvestmentSummary({ totalInvested, totalUpdated, totalGain }: InvestmentSummaryProps) {
    return (
        <div className="grid gap-4 p-4 sm:grid-cols-1 lg:grid-cols-3">
            <div className="bg-cyan-100 dark:bg-cyan-900 p-6 rounded-lg text-center shadow">
                <h3 className="text-gray-700 dark:text-gray-300 text-lg font-medium">Saldo Atual</h3>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    R$ {totalUpdated.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </p>
            </div>
            <div className="bg-gray-200 dark:bg-gray-800 p-6 rounded-lg text-center shadow">
                <h3 className="text-gray-700 dark:text-gray-300 text-lg font-medium">Total Investido</h3>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    R$ {totalInvested.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </p>
            </div>
            <div className={`p-6 rounded-lg text-center shadow ${totalGain >= 0 ? "bg-green-100 dark:bg-green-900" : "bg-red-100 dark:bg-red-900"}`}>
                <h3 className="text-gray-700 dark:text-gray-300 text-lg font-medium">Saldo Acumulado</h3>
                <p className={`text-2xl font-bold ${totalGain >= 0 ? "text-green-700 dark:text-green-300" : "text-red-700 dark:text-red-300"}`}>
                    R$ {totalGain.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </p>
            </div>
        </div>
    );
}
