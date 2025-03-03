import { useEffect, useState } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { supabase } from "@/lib/supabase";
import { Loader2, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { DatePicker } from "@/components/DatePicker";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"; import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogFooter, AlertDialogHeader, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import "react-datepicker/dist/react-datepicker.css";

export default function RecurringTransactions() {
  const [open, setOpen] = useState(false);
  const { toast } = useToast();
  const [recurringTransactions, setRecurring] = useState<any[]>([]);

  const [loading, setLoading] = useState<string | null>(null);
  const [fixedTotal, setFixedTotal] = useState(0);
  const [subscriptionTotal, setSubscriptionTotal] = useState(0);
  const [classes, setClasses] = useState<any[]>([]);
  const [selectedRecurring, setSelectedRecurring] = useState<any | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);


  const [newRecurring, setNewRecurring] = useState<{
    class_id: string;
    value: string;
    description: string;
    frequency: string;
    validity: Date | null;
  }>({
    class_id: "",
    value: "",
    description: "",
    frequency: "",
    validity: null,
  });

  useEffect(() => {
    fetchRecurringTransactions();
    fetchClasses();
  }, []);

  async function fetchRecurringTransactions() {
    const { data, error } = await supabase
      .from("recurring_transaction")
      .select("*, class:class_id(name)")
      .order("value", { ascending: false });

    if (error) {
      console.error("Erro:", error);
      return;
    }

    const transactions = data ?? [];
    setRecurring(transactions);

    const fixedSum = transactions
      .filter((item) => item.class?.name === "Fixa")
      .reduce((sum, item) => sum + (item.value || 0), 0);

    const subscriptionSum = transactions
      .filter((item) => item.class?.name === "Assinatura")
      .reduce((sum, item) => sum + (item.value || 0), 0);

    setFixedTotal(fixedSum);
    setSubscriptionTotal(subscriptionSum);
  }


  async function fetchClasses() {
    const { data } = await supabase.from("class").select("*");
    setClasses(data || []);
  }

  async function createRecurring() {
    const { error } = await supabase.from("recurring_transaction").insert([
      {
        ...newRecurring,
        value: parseFloat(newRecurring.value),
        validity: newRecurring.validity ? newRecurring.validity : null,

      },
    ]);

    if (error) {
      toast({
        title: "Erro",
        description: `Falha ao adicionar transação: ${error.message}`,
        variant: "destructive",
        duration: 2000,
      });
    } else {
      toast({
        title: "Sucesso",
        description: "Transação adicionada com sucesso!",
        duration: 2000,
      });
      fetchRecurringTransactions();
      setOpen(false);
    }
  }

  async function deleteRecurring() {
    if (!selectedRecurring) return;

    setLoading(selectedRecurring.id);
    setConfirmOpen(false);

    const { error } = await supabase
      .from("recurring_transaction")
      .delete()
      .match({ id: selectedRecurring.id });

    if (error) {
      toast({
        title: "Erro",
        description: `Falha ao excluir: ${error.message}`,
        variant: "destructive",
        duration: 2000,
      });
    } else {
      setRecurring((prev) =>
        prev.filter((t) => t.id !== selectedRecurring.id)
      );
      toast({
        title: "Deletado",
        description: "Recorrência removida com sucesso!",
        duration: 2000,
      });
    }
    setLoading(null);
    setSelectedRecurring(null);
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
            <div className="p-4 bg-red-300 shadow rounded-lg">
              <h3 className="text-lg font-semibold">Despesas Fixas</h3>
              <p className="text-2xl font-bold">R${fixedTotal.toFixed(2)}</p>
            </div>
            <div className="p-4 bg-blue-300 shadow rounded-lg">
              <h3 className="text-lg font-semibold">Assinaturas</h3>
              <p className="text-2xl font-bold">R${subscriptionTotal.toFixed(2)}</p>
            </div>
          </div>

          <div className="flex flex-col gap-4 sm:flex-row sm:justify-between sm:items-center mb-4">
            <h1 className="text-2xl font-bold">Transações Recorrentes</h1>
            <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
              <Dialog
                open={open}
                onOpenChange={(isOpen) => {
                  if (!isOpen) {
                    setNewRecurring({
                      class_id: "",
                      value: "",
                      description: "",
                      frequency: "",
                      validity: null,
                    });
                    setSelectedRecurring(null);
                  }
                  setOpen(isOpen);
                }}
              >
                <DialogTrigger asChild>
                  <Button>Adicionar Recorrência</Button>
                </DialogTrigger>
                <DialogContent className="max-w-md sm:max-w-lg w-full p-4 sm:p-6">
                  <DialogHeader>
                    <DialogTitle>Nova Recorrência</DialogTitle>
                  </DialogHeader>
                  <div className="grid grid-cols-1 gap-4">
                    <Label>Classe</Label>
                    <Select
                      onValueChange={(value: string) =>
                        setNewRecurring({ ...newRecurring, class_id: value })
                      }
                      value={newRecurring.class_id}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Selecione a Classe" />
                      </SelectTrigger>
                      <SelectContent>
                        {classes.map((c) => (
                          <SelectItem key={c.id} value={c.id}>
                            {c.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Label>Valor</Label>
                    <Input
                      type="number"
                      min="1"
                      value={newRecurring.value}
                      onChange={(e) =>
                        setNewRecurring({
                          ...newRecurring,
                          value: e.target.value,
                        })
                      }
                    />
                    <Label>Descrição</Label>
                    <Input
                      type="text"
                      value={newRecurring.description}
                      onChange={(e) =>
                        setNewRecurring({
                          ...newRecurring,
                          description: e.target.value,
                        })
                      }
                    />
                    <Label>Frequência</Label>
                    <Select
                      onValueChange={(value: string) =>
                        setNewRecurring({ ...newRecurring, frequency: value })
                      }
                      value={newRecurring.frequency}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Selecione a Frequência" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Anual">Anual</SelectItem>
                        <SelectItem value="Mensal">Mensal</SelectItem>
                        <SelectItem value="Semanal">Semanal</SelectItem>
                      </SelectContent>
                    </Select>
                    <Label>Data</Label>
                    <DatePicker
                      selectedDate={newRecurring.validity ?? undefined}
                      onSelect={(date) =>
                        setNewRecurring({
                          ...newRecurring,
                          validity: date ?? null,
                        })
                      }
                    />

                    <Button onClick={createRecurring}>Salvar</Button>
                  </div>
                </DialogContent>
              </Dialog>
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
                    <TableHead className="text-sm">Frequência</TableHead>
                    <TableHead className="text-sm">Validade</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody className="text-sm">
                  {recurringTransactions.map((recurring) => (
                    <TableRow key={recurring.id}>
                      <TableCell>{recurring.class?.name || "Sem Classe"}</TableCell>
                      <TableCell>R${recurring.value?.toFixed(2)}</TableCell>
                      <TableCell>{recurring.description || "Sem Descrição"}</TableCell>
                      <TableCell>{recurring.frequency}</TableCell>
                      <TableCell>{recurring.validity || "Sem Validade"}</TableCell>
                      <TableCell className="flex gap-2">

                        <AlertDialog
                          open={confirmOpen && selectedRecurring?.id === recurring.id}
                          onOpenChange={setConfirmOpen}
                        >
                          <AlertDialogTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => setSelectedRecurring(recurring)}
                            >
                              <Trash2 className="text-red-500" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>Tem certeza?</AlertDialogHeader>
                            <p>Esta ação não pode ser desfeita. Deseja remover esta Recorrência?</p>
                            <AlertDialogFooter>
                              <AlertDialogCancel onClick={() => setConfirmOpen(false)}>
                                Cancelar
                              </AlertDialogCancel>
                              <AlertDialogAction onClick={deleteRecurring} disabled={loading === recurring.id}>
                                Excluir
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </TableCell>
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