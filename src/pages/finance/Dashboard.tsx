import { useEffect, useState } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, AreaChart, Area } from "recharts";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { supabase } from "@/lib/supabase";
import { Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";


const months = [
  "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
];

export default function TransactionsAnalytics() {
  const { toast } = useToast();
  const [transactions, setTransactions] = useState<any[]>([]);
  const [filteredTransactions, setFilteredTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [expensesByDate, setExpensesByDate] = useState<any[]>([]);
  const [expensesByClass, setExpensesByClass] = useState<any[]>([]);
  const [totalExpenses, setTotalExpenses] = useState<number>(0);
  const [totalIncome, setTotalIncome] = useState<number>(0);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const itemsPerPage = 17;

  const [yearFilter, setYearFilter] = useState("");
  const [monthFilter, setMonthFilter] = useState("");
  const [dayFilter, setDayFilter] = useState("");
  const [classFilter, setClassFilter] = useState("");
  const [natureFilter, setNatureFilter] = useState("");

  useEffect(() => {
    fetchTransactions();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [transactions, yearFilter, monthFilter, dayFilter, classFilter, natureFilter]);

  async function fetchTransactions() {
    setLoading(true);
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
      setLoading(false);
      return;
    }

    setTransactions(data || []);
    setLoading(false);
  }

  function processAnalytics(data: any[]) {
    const expensesByDateMap: { [key: string]: number } = {};
    const incomeByDateMap: { [key: string]: number } = {};
    const expensesByClassMap: { [key: string]: number } = {};

    data.forEach((transaction) => {
      const date = new Date(transaction.date);
      const dateKey = `${months[date.getUTCMonth()]}`;
      if (transaction.nature?.name === "Despesa") {
        expensesByDateMap[dateKey] = (expensesByDateMap[dateKey] || 0) + transaction.value;
      } else if (transaction.nature?.name === "Receita") {
        incomeByDateMap[dateKey] = (incomeByDateMap[dateKey] || 0) + transaction.value;
      }

      if (transaction.nature?.name === "Despesa") {
        const className = transaction.class?.name || "Sem Classe";
        expensesByClassMap[className] = (expensesByClassMap[className] || 0) + transaction.value;
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

    setExpensesByDate(dateData);
    setExpensesByClass(classData);
  }

  function calculateTotals(data: any[]) {
    const totalExpenses = data
      .filter((t) => t.nature?.name === "Despesa")
      .reduce((acc, curr) => acc + curr.value, 0);

    const totalIncome = data
      .filter((t) => t.nature?.name === "Receita")
      .reduce((acc, curr) => acc + curr.value, 0);

    setTotalExpenses(totalExpenses);
    setTotalIncome(totalIncome);
  }

  function applyFilters() {
    let filtered = [...transactions];
    if (yearFilter) filtered = filtered.filter(t => new Date(t.date).getUTCFullYear().toString() === yearFilter);
    if (monthFilter) filtered = filtered.filter(t => (new Date(t.date).getUTCMonth()).toString() === monthFilter);
    if (dayFilter) filtered = filtered.filter(t => new Date(t.date).getUTCDate().toString() === dayFilter);
    if (classFilter) filtered = filtered.filter(t => t.class?.name === classFilter);
    if (natureFilter) filtered = filtered.filter(t => t.nature?.name === natureFilter);

    setFilteredTransactions(filtered);
    processAnalytics(filtered);
    calculateTotals(filtered);
    setCurrentPage(1);
  }

  // Paginação
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredTransactions.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredTransactions.length / itemsPerPage);

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8">
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


      {/* Cards Totais */}
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

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <Loader2 className="animate-spin" />
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
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

            {/* Gráfico de Barra - Principais Classes de Gasto */}
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

          {/* Tabela de Transações */}
          <div className="p-4 bg-white shadow rounded-lg overflow-auto">
            <div className="w-full">
              <Table>
                <TableHeader className="text-sm">
                  <TableRow>
                    <TableHead className="text-sm">Data</TableHead>
                    <TableHead className="text-sm">Tipo</TableHead>
                    <TableHead className="text-sm">Classe</TableHead>
                    <TableHead className="text-sm">Valor</TableHead>
                    <TableHead className="text-sm">Descrição</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody className="text-xs">
                  {currentItems
                    .sort((a, b) => {
                      const dateA = new Date(a.date).getTime();
                      const dateB = new Date(b.date).getTime();
                      if (dateB - dateA !== 0) return dateB - dateA;
                      const natureA = a.nature?.name?.toLowerCase() || '';
                      const natureB = b.nature?.name?.toLowerCase() || '';
                      if (natureA < natureB) return -1;
                      if (natureA > natureB) return 1;
                      return b.value - a.value;
                    })
                    .map((transaction) => (
                      <TableRow key={transaction.id}>
                        <TableCell>{transaction.date}</TableCell>
                        <TableCell>{transaction.nature?.name || "Sem Tipo"}</TableCell>
                        <TableCell>{transaction.class?.name || "Sem Classe"}</TableCell>
                        <TableCell>R${transaction.value?.toFixed(2)}</TableCell>
                        <TableCell>{transaction.description || "Sem Descrição"}</TableCell>
                      </TableRow>
                    ))}
                </TableBody>
              </Table>

              {/* Paginação */}
              <div className="flex justify-between items-center mt-4">
                <button
                  onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-1 bg-[#FACD19] rounded disabled:opacity-50"
                >
                  Anterior
                </button>
                <span>Página {currentPage} de {totalPages}</span>
                <button
                  onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="px-3 py-1 bg-[#FACD19] rounded disabled:opacity-50"
                >
                  Próxima
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
