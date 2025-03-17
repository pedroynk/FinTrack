import { useEffect, useState } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { supabase } from "@/lib/supabase";
import { CheckCircle, ChevronDown, Loader2, Trash2, XCircle } from "lucide-react";
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
  const [confirmOpenSoft, setConfirmOpenSoft] = useState(false);
  const [expandedRows, setExpandedRows] = useState<{ [key: string]: boolean }>({});




  const [newRecurring, setNewRecurring] = useState<{
    class_id: string;
    value: string;
    description: string;
    frequency: string;
    validity: string;
  }>({
    class_id: "",
    value: "",
    description: "",
    frequency: "",
    validity: "",
  });

  useEffect(() => {
    fetchRecurringTransactions();
    fetchClasses();
  }, []);

  async function fetchRecurringTransactions() {
    const { data, error } = await supabase
      .from("recurring_transaction")
      .select("*, class:class_id(name)")
      .neq("status", "FALSE")
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

  async function softDeleteRecurring(id: string) {
    setLoading(id);

    const { error } = await supabase
      .from("recurring_transaction")
      .update({ status: 0 })
      .eq("id", id);

    if (error) {
      toast({
        title: "Erro",
        description: `Falha ao desativar: ${error.message}`,
        variant: "destructive",
        duration: 2000,
      });
    } else {
      setRecurring((prev) => prev.filter((t) => t.id !== id));
      toast({
        title: "Desativado",
        description: "Transação recorrente desativada!",
        duration: 2000,
      });
    }
    setLoading(null);
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

  // Função para calcular os meses das parcelas
  function calculateInstallments(createdAt: string, validity: string | null) {
    if (!validity) return "Essa recorrência não é um parcelamento";

    const createdDate = new Date(createdAt);
    const validityDate = new Date(validity);

    let installments = [];
    let currentDate = new Date(createdDate);

    while (currentDate <= validityDate) {
      const month = currentDate.toLocaleString("pt-BR", { month: "long" });
      const year = currentDate.getFullYear();
      installments.push({ label: `${month.charAt(0).toUpperCase() + month.slice(1)}/${year}`, number: installments.length + 1 });

      currentDate.setMonth(currentDate.getMonth() + 1);
    }

    return installments;
  }

  // Atualiza o JSON "paid_parcels" no banco
  async function toggleParcelPayment(transactionId: string, installmentNumber: number, currentPaidParcels: number[]) {
    const updatedParcels = currentPaidParcels.includes(installmentNumber)
      ? currentPaidParcels.filter(p => p !== installmentNumber)
      : [...currentPaidParcels, installmentNumber];
  
    setRecurring(prevTransactions =>
      prevTransactions.map(transaction =>
        transaction.id === transactionId ? { ...transaction, paid_parcels: updatedParcels } : transaction
      )
    );
  
    // Atualiza as parcelas pagas no banco
    const { error } = await supabase
      .from("recurring_transaction")
      .update({ paid_parcels: updatedParcels })
      .eq("id", transactionId);
  
    if (error) {
      console.error("Erro ao atualizar parcelas pagas:", error);
      setRecurring(prevTransactions =>
        prevTransactions.map(transaction =>
          transaction.id === transactionId ? { ...transaction, paid_parcels: currentPaidParcels } : transaction
        )
      );
      return;
    }
  
    // Se a parcela foi marcada como paga, registra a transação na tabela "transaction"
    if (!currentPaidParcels.includes(installmentNumber)) {
      const recurring = recurringTransactions.find(t => t.id === transactionId);
  
      if (recurring) {
        const { error: transactionError } = await supabase
          .from("transaction")
          .insert([
            {
              class_id: recurring.class_id,
              value: recurring.value,
              description: recurring.description,
              transaction_at: new Date(),
              nature_id: 2,
            },
          ]);
  
        if (transactionError) {
          console.error("Erro ao registrar transação:", transactionError);
        }
      }
    }
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
            <h1 className="text-2xl font-bold">Despesas Fixas</h1>
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
                      validity: "",
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
                            date={newRecurring.validity ? new Date(newRecurring.validity) : new Date()}
                            onSelect={(date) =>
                                setNewRecurring({
                                    ...newRecurring,
                                    validity: date ? date.toISOString() : new Date().toISOString(),
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
            <div className="w-full overflow-auto">
              <Table>
                <TableHeader className="text-sm">
                  <TableRow>
                    <TableHead className="text-sm">Classe</TableHead>
                    <TableHead className="text-sm">Valor</TableHead>
                    <TableHead className="text-sm">Descrição</TableHead>
                    <TableHead className="text-sm">Frequência</TableHead>
                    <TableHead className="text-sm">Validade</TableHead>
                    <TableHead className="text-sm">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody className="text-sm">
                  {recurringTransactions.map((recurring) => {
                    const installments = calculateInstallments(recurring.created_at, recurring.validity);
                    const paidParcels = recurring.paid_parcels || []; // Garante que sempre seja um array

                    return (
                      <>
                        <TableRow key={recurring.id}>
                          <TableCell>{recurring.class?.name || "Sem Classe"}</TableCell>
                          <TableCell>R${recurring.value?.toFixed(2)}</TableCell>
                          <TableCell>{recurring.description || "Sem Descrição"}</TableCell>
                          <TableCell>{recurring.frequency}</TableCell>
                          <TableCell>{recurring.validity || "Sem Validade"}</TableCell>

                          <TableCell className="flex gap-2">
                            <AlertDialog open={confirmOpenSoft && selectedRecurring?.id === recurring.id}
                              onOpenChange={setConfirmOpenSoft}>
                              <AlertDialogTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => setSelectedRecurring(recurring)}
                                >
                                  <CheckCircle className="text-green-500" />
                                </Button>
                              </AlertDialogTrigger>

                              <AlertDialogContent>
                                <AlertDialogHeader>Tem certeza?</AlertDialogHeader>
                                <p>Esta ação não pode ser desfeita. Deseja marcar esta Recorrência como PAGA?</p>
                                <AlertDialogFooter>
                                  <AlertDialogCancel onClick={() => setConfirmOpenSoft(false)}>
                                    Cancelar
                                  </AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={() => {
                                      softDeleteRecurring(recurring.id);
                                      setConfirmOpenSoft(false);
                                    }}
                                  >
                                    Marcar Recorrência como Paga
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>

                            <AlertDialog open={confirmOpen && selectedRecurring?.id === recurring.id}
                              onOpenChange={setConfirmOpen}>
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
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => setExpandedRows((prev) => ({ ...prev, [recurring.id]: !prev[recurring.id] }))}
                            >
                              <ChevronDown className={`transition-transform ${expandedRows[recurring.id] ? "rotate-180" : ""}`} />
                            </Button>
                          </TableCell>
                        </TableRow>

                        {expandedRows[recurring.id] && (
                          <TableRow className="bg-gray-100">
                            <TableCell colSpan={7}>
                              <div className="p-4 border rounded-lg">
                                <h3 className="font-semibold">Parcelas</h3>
                                <div className="space-y-2">
                                  {typeof installments === "string" ? (
                                    <p>{installments}</p>
                                  ) : (
                                    installments.map((installment, index) => {
                                      const installmentNumber = index + 1;
                                      const isPaid = paidParcels.includes(installmentNumber);

                                      return (
                                        <div key={index} className="flex items-center justify-between p-2 border-b">
                                          <span>{installment.label}</span>

                                          <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => toggleParcelPayment(recurring.id, installmentNumber, paidParcels)}
                                          >
                                            {isPaid ? (
                                              <XCircle className="text-red-500" />
                                            ) : (
                                              <CheckCircle className="text-green-500" />
                                            )}
                                          </Button>
                                        </div>
                                      );
                                    })
                                  )}
                                </div>
                              </div>
                            </TableCell>
                          </TableRow>
                        )}
                      </>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}