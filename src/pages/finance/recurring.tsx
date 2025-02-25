import { useEffect, useState } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { supabase } from "@/lib/supabase";
import { Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function RecurringTransactions() {
  const { toast } = useToast();
  const [recurringTransactions, setRecurringTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [fixedTotal, setFixedTotal] = useState(0);
  const [subscriptionTotal, setSubscriptionTotal] = useState(0);

  useEffect(() => {
    fetchRecurringTransactions();
  }, []);

  async function fetchRecurringTransactions() {
    const { data, error } = await supabase
      .from("recurring_transaction")
      .select("*, class:class_id(name)");

    if (error) {
      toast({
        title: "Erro",
        description: `Falha ao buscar despesas fixas: ${error.message}`,
        variant: "destructive",
        duration: 2000,
      });
      setLoading(false);
      return;
    }

    setRecurringTransactions(data || []);

    // Calcular totais
    const fixedSum = data
      .filter((item) => item.class?.name === "Fixa")
      .reduce((sum, item) => sum + (item.value || 0), 0);

    const subscriptionSum = data
      .filter((item) => item.class?.name === "Assinatura")
      .reduce((sum, item) => sum + (item.value || 0), 0);

    setFixedTotal(fixedSum);
    setSubscriptionTotal(subscriptionSum);
    setLoading(false);
  }

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8">
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <Loader2 className="animate-spin" />
        </div>
      ) : (
        <div className="space-y-6">
          {/* Cards de Totais */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-white shadow rounded-lg">
              <h3 className="text-lg font-semibold">Despesas Fixas</h3>
              <p className="text-2xl font-bold text-red-500">R${fixedTotal.toFixed(2)}</p>
            </div>
            <div className="p-4 bg-white shadow rounded-lg">
              <h3 className="text-lg font-semibold">Assinaturas</h3>
              <p className="text-2xl font-bold text-blue-500">R${subscriptionTotal.toFixed(2)}</p>
            </div>
          </div>

          {/* Tabela de Despesas Fixas */}
          <div className="p-4 bg-white shadow rounded-lg">
            <h2 className="text-m font-semibold mb-4">Despesas Fixas</h2>
            <div className="w-full overflow-auto">
              <Table>
                <TableHeader className="text-sm">
                  <TableRow>
                    <TableHead className="text-sm">Classe</TableHead>
                    <TableHead className="text-sm">Valor</TableHead>
                    <TableHead className="text-sm">Descrição</TableHead>
                    <TableHead className="text-sm">Validade</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody className="text-xs">
                  {recurringTransactions.map((recurring) => (
                    <TableRow key={recurring.id}>
                      <TableCell>{recurring.class?.name || "Sem Classe"}</TableCell>
                      <TableCell>R${recurring.value?.toFixed(2)}</TableCell>
                      <TableCell>{recurring.description || "Sem Descrição"}</TableCell>
                      <TableCell>{recurring.validity ? new Date(recurring.validity).toLocaleDateString("pt-BR") : "-"}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}