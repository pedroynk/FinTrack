import { supabase } from "@/lib/supabase";
import { toast } from "@/hooks/use-toast";

/**
 * Funções para buscar e processar transações
 */
export async function fetchTransactions() {
    const { data, error } = await supabase
        .from("transaction")
        .select("*, class:class_id(name), nature:nature_id(name)")
        .order("date", { ascending: true });

    if (error) {
        toast({
            title: "Erro",
            description: `Falha ao buscar transações: ${error.message}`,
            variant: "destructive",
            duration: 2000,
        });
        return [];
    }

    return data || [];
}

export function processAnalytics(data: any[]) {
    const expensesByDateMap: Record<string, number> = {};
    const incomeByDateMap: Record<string, number> = {};
    const expensesByClassMap: Record<string, number> = {};

    data.forEach((transaction) => {
        const date = new Date(transaction.date);
        const dateKey = `${date.getUTCMonth() + 1}/${date.getUTCFullYear()}`;

        if (transaction.nature?.name === "Despesa") {
            expensesByDateMap[dateKey] = (expensesByDateMap[dateKey] || 0) + transaction.value;
            const className = transaction.class?.name || "Sem Classe";
            expensesByClassMap[className] = (expensesByClassMap[className] || 0) + transaction.value;
        } else if (transaction.nature?.name === "Receita") {
            incomeByDateMap[dateKey] = (incomeByDateMap[dateKey] || 0) + transaction.value;
        }
    });

    const dateData = Object.keys(expensesByDateMap).map((date) => ({
        date,
        value: expensesByDateMap[date] || 0,
        income: incomeByDateMap[date] || 0,
    }));

    const classData = Object.entries(expensesByClassMap)
        .map(([name, value]) => ({ name, value }))
        .sort((a, b) => b.value - a.value);

    return { dateData, classData };
}

export function calculateTotals(data: any[]) {
    const totalExpenses = data
        .filter((t) => t.nature?.name === "Despesa")
        .reduce((acc, curr) => acc + curr.value, 0);

    const totalIncome = data
        .filter((t) => t.nature?.name === "Receita")
        .reduce((acc, curr) => acc + curr.value, 0);

    return { totalExpenses, totalIncome };
}

export function applyFilters(transactions: any[], filters: Record<string, string>) {
    let filtered = [...transactions];
    if (filters.year) filtered = filtered.filter(t => new Date(t.date).getUTCFullYear().toString() === filters.year);
    if (filters.month) filtered = filtered.filter(t => (new Date(t.date).getUTCMonth()).toString() === filters.month);
    if (filters.day) filtered = filtered.filter(t => new Date(t.date).getUTCDate().toString() === filters.day);
    if (filters.class) filtered = filtered.filter(t => t.class?.name === filters.class);
    if (filters.nature) filtered = filtered.filter(t => t.nature?.name === filters.nature);

    const analytics = processAnalytics(filtered);
    const totals = calculateTotals(filtered);

    return { filtered, analytics, totals };
}

export function paginateData(data: any[], currentPage: number, itemsPerPage: 17) {
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const paginatedItems = data.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(data.length / itemsPerPage);

    return { paginatedItems, totalPages };
}
