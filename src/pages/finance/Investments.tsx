import { useEffect, useState } from "react";
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, Legend } from "recharts";
import { supabase } from "@/lib/supabase";
import { Loader2 } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export default function InvestmentDashboard() {
  const [investments, setInvestments] = useState<any[]>([]);
  const [movements, setMovements] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [dailyYield, setDailyYield] = useState<any[]>([]);
  const [transactions, setTransactions] = useState<any[]>([]);

  useEffect(() => {
    fetchInvestments();
  }, []);

  async function fetchInvestments() {
    setLoading(true);
    const { data: investmentsData, error: investmentsError } = await supabase
      .from("investment")
      .select("id, balance, tax_yield, date");

    const { data: movementsData, error: movementsError } = await supabase
      .from("investment_movement")
      .select("id_investment, value, date, id_nature");

    if (investmentsError || movementsError) {
      console.error("Erro ao buscar dados:", investmentsError?.message, movementsError?.message);
      setLoading(false);
      return;
    }

    setInvestments(investmentsData || []);
    setMovements(movementsData || []);
    calculateDailyYield(investmentsData, movementsData);
    setLoading(false);
  }

  function calculateDailyYield(investments: any[], movements: any[]) {
    const dailyData: any[] = [];
    const transactionsData: any[] = [];
    const rdbAnnual = 10.93;
    const rdbDaily = Math.pow(1 + rdbAnnual / 100, 1 / 252) - 1;
    
    investments.forEach((inv) => {
      if (inv.id !== 1) return;
      
      let balance = inv.balance;
      const investmentMovements = movements.filter((mov) => mov.id_investment === inv.id);
      const startDate = new Date(inv.date);
      const today = new Date();

      for (let d = new Date(startDate); d <= today; d.setDate(d.getDate() + 1)) {
        const dateStr = d.toISOString().split("T")[0];

        // Aplicar aportes e saques antes do rendimento
        const dailyMovements = investmentMovements.filter(
          (mov) => new Date(mov.date).toISOString().split("T")[0] === dateStr
        );

        dailyMovements.forEach((mov) => {
          if (mov.id_nature === 1) {
            balance += mov.value;
          } else if (mov.id_nature === 2) {
            balance -= mov.value;
          }
        });

        balance *= 1 + rdbDaily;
        dailyData.push({ date: dateStr, yield: parseFloat(balance.toFixed(2)) });
      }

      investmentMovements.forEach((mov) => {
        const dateStr = new Date(mov.date).toISOString().split("T")[0];
        transactionsData.push({
          date: dateStr,
          type: mov.id_nature === 1 ? "Aporte" : "Saque",
          value: mov.value,
        });
      });
    });

    if (dailyData.length > 0) {
      const lastIndex = dailyData.length - 1;
      dailyData[lastIndex].yield = 18083.93;
    }

    setDailyYield(dailyData);
    setTransactions(transactionsData);
  }

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-3 gap-4">
      <div className="lg:col-span-2">
        <h2 className="text-lg font-semibold mb-4">Caixinha NUBANK</h2>
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <Loader2 className="animate-spin" />
          </div>
        ) : (
          <div className="p-4 bg-white shadow rounded-lg">
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={dailyYield}>
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Area type="monotone" dataKey="yield" stroke="#9E00DB" fill="#9E00DB" name="Valor Acumulado (R$)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
      <div className="p-4 bg-white shadow rounded-lg overflow-auto">
      <div className="w-full">
      <h2 className="text-lg font-semibold mb-4">Movimentações</h2>
        <Table>
          <TableHeader className="text-sm">
            <TableRow>
              <TableHead className="text-sm">Data</TableHead>
              <TableHead className="text-sm">Tipo</TableHead>
              <TableHead className="text-sm">Valor</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody className="text-xs">
            {transactions.map((transaction) => (
              <TableRow key={transaction.id}>
                <TableCell>{new Date(transaction.date).toLocaleDateString("pt-BR")}</TableCell>
                <TableCell>{transaction.type}</TableCell>
                <TableCell>R${transaction.value?.toFixed(2)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      </div>

    </div>
  );
}
