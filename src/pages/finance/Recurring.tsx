import { useEffect, useState } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { supabase } from "@/lib/supabase";
import { Loader2, Plus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

export default function RecurringTransactions() {
  const { toast } = useToast();
  const [recurringTransactions, setRecurringTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [fixedTotal, setFixedTotal] = useState(0);
  const [subscriptionTotal, setSubscriptionTotal] = useState(0);
  const [newRecurring, setNewRecurring] = useState({
    class_id: "",
    value: "",
    description: "",
    frequency: "",
    validity: new Date(),
  });

  useEffect(() => {
    fetchRecurringTransactions();
  }, []);

  async function fetchRecurringTransactions() {
    setLoading(true);
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

  async function createRecurring() {
    const { error } = await supabase.from("recurring_transaction").insert([
      {
        ...newRecurring,
        value: parseFloat(newRecurring.value),
      },
    ]);

    if (error) {
      toast({
        title: "Erro",
        description: `Falha ao adicionar Recorrência: ${error.message}`,
        variant: "destructive",
        duration: 2000,
      });
    } else {
      toast({
        title: "Sucesso",
        description: "Recorrência adicionada com sucesso!",
        duration: 2000,
      });
      fetchRecurringTransactions();
      setOpen(false);
      resetForm();
    }
  }

  function resetForm() {
    setNewRecurring({
      class_id: "",
      value: "",
      description: "",
      frequency: "",
      validity: new Date(),
    });
  }

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8">
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <Loader2 className="animate-spin" />
        </div>
      ) : (
        <div className="space-y-6">
          <div className="flex justify-end">
            <Dialog
              open={open}
              onOpenChange={(isOpen) => {
                if (!isOpen) resetForm();
                setOpen(isOpen);
              }}
            >
              <DialogTrigger asChild>
                <Button>
                  <Plus className="mr-2" /> Adicionar Recorrência
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md w-full">
                <DialogHeader>
                  <DialogTitle>Nova Recorrência</DialogTitle>
                </DialogHeader>
                <div className="grid grid-cols-1 gap-4">
                  <Label>Classe</Label>
                  <Select
                    onValueChange={(value) =>
                      setNewRecurring({ ...newRecurring, class_id: value })
                    }
                    value={newRecurring.class_id}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Selecione a Classe" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">Fixa</SelectItem>
                      <SelectItem value="2">Assinatura</SelectItem>
                    </SelectContent>
                  </Select>
                  <Label>Valor</Label>
                  <Input
                    type="number"
                    min="0"
                    value={newRecurring.value}
                    onChange={(e) =>
                      setNewRecurring({ ...newRecurring, value: e.target.value })
                    }
                  />
                  <Label>Descrição</Label>
                  <Input
                    type="text"
                    value={newRecurring.description}
                    onChange={(e) =>
                      setNewRecurring({ ...newRecurring, description: e.target.value })
                    }
                  />
                  <Label>Frequência</Label>
                  <Select
                    onValueChange={(value) =>
                      setNewRecurring({ ...newRecurring, frequency: value })
                    }
                    value={newRecurring.frequency}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Selecione a Frequência" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Mensal">Mensal</SelectItem>
                      <SelectItem value="Semanal">Semanal</SelectItem>
                      <SelectItem value="Anual">Anual</SelectItem>
                    </SelectContent>
                  </Select>
                  <Label>Validade</Label>
                  <DatePicker
                    selected={newRecurring.validity}
                    onChange={(date) =>
                      setNewRecurring({
                        ...newRecurring,
                        validity: date || new Date(),
                      })
                    }
                    className="w-full p-2 border rounded"
                  />
                  <Button onClick={createRecurring}>Salvar</Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-white shadow rounded-lg">
              <h3 className="text-lg font-semibold">Despesas Fixas</h3>
              <p className="text-2xl font-bold text-red-500">
                R${fixedTotal.toFixed(2)}
              </p>
            </div>
            <div className="p-4 bg-white shadow rounded-lg">
              <h3 className="text-lg font-semibold">Assinaturas</h3>
              <p className="text-2xl font-bold text-blue-500">
                R${subscriptionTotal.toFixed(2)}
              </p>
            </div>
          </div>
          <div className="p-4 bg-white shadow rounded-lg">
            <h2 className="text-m font-semibold mb-4">Despesas Fixas</h2>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Classe</TableHead>
                  <TableHead>Valor</TableHead>
                  <TableHead>Descrição</TableHead>
                  <TableHead>Validade</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
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
      )}
    </div>
  );
}
