interface FiltersProps {
    yearFilter: string;
    setYearFilter: (value: string) => void;
    monthFilter: string;
    setMonthFilter: (value: string) => void;
    dayFilter: string;
    setDayFilter: (value: string) => void;
    classFilter: string;
    setClassFilter: (value: string) => void;
    natureFilter: string;
    setNatureFilter: (value: string) => void;
    transactions: any[];
}

const months = [
    "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
    "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
];

export function DashboardFilters({
    yearFilter, setYearFilter,
    monthFilter, setMonthFilter,
    dayFilter, setDayFilter,
    classFilter, setClassFilter,
    natureFilter, setNatureFilter,
    transactions
}: FiltersProps) {
    return (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-6">
            {/* Ano */}
            <div>
                <label htmlFor="yearFilter" className="block text-sm font-medium mb-1">Ano</label>
                <select id="yearFilter" value={yearFilter} onChange={(e) => setYearFilter(e.target.value)} className="p-2 border rounded w-full">
                    <option value="">Todos</option>
                    {[...new Set(transactions.map(t => new Date(t.date).getFullYear()))].map(year => (
                        <option key={year} value={year}>{year}</option>
                    ))}
                </select>
            </div>

            {/* Mês */}
            <div>
                <label htmlFor="monthFilter" className="block text-sm font-medium mb-1">Mês</label>
                <select id="monthFilter" value={monthFilter} onChange={(e) => setMonthFilter(e.target.value)} className="p-2 border rounded w-full">
                    <option value="">Todos</option>
                    {months.map((month, index) => (
                        <option key={index} value={index.toString()}>{month}</option>
                    ))}
                </select>
            </div>

            {/* Dia */}
            <div>
                <label htmlFor="dayFilter" className="block text-sm font-medium mb-1">Dia</label>
                <select id="dayFilter" value={dayFilter} onChange={(e) => setDayFilter(e.target.value)} className="p-2 border rounded w-full">
                    <option value="">Todos</option>
                    {[...Array(31)].map((_, i) => (
                        <option key={i} value={(i + 1).toString()}>{i + 1}</option>
                    ))}
                </select>
            </div>

            {/* Classe */}
            <div>
                <label htmlFor="classFilter" className="block text-sm font-medium mb-1">Classe</label>
                <select id="classFilter" value={classFilter} onChange={(e) => setClassFilter(e.target.value)} className="p-2 border rounded w-full">
                    <option value="">Todos</option>
                    {[...new Set(transactions.map(t => t.class?.name).filter(Boolean))].map(cl => (
                        <option key={cl} value={cl}>{cl}</option>
                    ))}
                </select>
            </div>

            {/* Natureza */}
            <div>
                <label htmlFor="natureFilter" className="block text-sm font-medium mb-1">Tipo</label>
                <select id="natureFilter" value={natureFilter} onChange={(e) => setNatureFilter(e.target.value)} className="p-2 border rounded w-full">
                    <option value="">Todos</option>
                    {[...new Set(transactions.map(t => t.nature?.name).filter(Boolean))].map(nat => (
                        <option key={nat} value={nat}>{nat}</option>
                    ))}
                </select>
            </div>
        </div>
    );
}
