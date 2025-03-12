import { useEffect, useState } from "react";
import { fetchTransactions, applyFilters } from "@/services/dashboardService";
import { DashboardFilters } from "@/components/finance/dashboard/Filters";
import { DashboardSummary } from "@/components/finance/dashboard/Summary";
import { DashboardCharts } from "@/components/finance/dashboard/Charts";
import { DashboardTable } from "@/components/finance/dashboard/Table";

export default function TransactionsDashboard() {
    const [transactions, setTransactions] = useState<any[]>([]);
    const [filteredTransactions, setFilteredTransactions] = useState<any[]>([]);
    const [totalIncome, setTotalIncome] = useState<number>(0);
    const [totalExpenses, setTotalExpenses] = useState<number>(0);
    const [expensesByDate, setExpensesByDate] = useState<any[]>([]);
    const [expensesByClass, setExpensesByClass] = useState<any[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    
    // Estados dos filtros
    const [yearFilter, setYearFilter] = useState("");
    const [monthFilter, setMonthFilter] = useState("");
    const [dayFilter, setDayFilter] = useState("");
    const [classFilter, setClassFilter] = useState("");
    const [natureFilter, setNatureFilter] = useState("");
    
    useEffect(() => {
        async function loadTransactions() {
            setLoading(true);
            const data = await fetchTransactions();
            setTransactions(data);
            setLoading(false);
        }
        loadTransactions();
    }, []);

    useEffect(() => {
        const { filtered, totals, analytics } = applyFilters(transactions, {
            year: yearFilter,
            month: monthFilter,
            day: dayFilter,
            class: classFilter,
            nature: natureFilter,
        });
        setFilteredTransactions(filtered);
        setTotalIncome(totals.totalIncome);
        setTotalExpenses(totals.totalExpenses);
        setExpensesByDate(analytics.dateData);
        setExpensesByClass(analytics.classData);
    }, [transactions, yearFilter, monthFilter, dayFilter, classFilter, natureFilter]);

    return (
        <div className="p-6 space-y-6">
            <DashboardFilters 
                yearFilter={yearFilter} setYearFilter={setYearFilter}
                monthFilter={monthFilter} setMonthFilter={setMonthFilter}
                dayFilter={dayFilter} setDayFilter={setDayFilter}
                classFilter={classFilter} setClassFilter={setClassFilter}
                natureFilter={natureFilter} setNatureFilter={setNatureFilter}
                transactions={transactions}
            />
            <DashboardSummary totalIncome={totalIncome} totalExpenses={totalExpenses} />
            <DashboardCharts expensesByDate={expensesByDate} expensesByClass={expensesByClass} loading={loading} />
            <DashboardTable transactions={filteredTransactions} totalPages={1} />
        </div>
    );
}
