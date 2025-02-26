import { useEffect, useState } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { supabase } from "@/lib/supabase";
import { Plus, Edit2, Trash2 } from "lucide-react";
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
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogTrigger } from "@radix-ui/react-alert-dialog";
import { AlertDialogFooter, AlertDialogHeader } from "@/components/ui/alert-dialog";

export default function RecurringTransactions() {
  const { toast } = useToast();
  const [recurringTransactions, setRecurringTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedRecurring, setSelectedRecurring] = useState<any | null>(null);
  const [fixedTotal, setFixedTotal] = useState(0);
  const [subscriptionTotal, setSubscriptionTotal] = useState(0);
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

  async function createOrUpdateRecurring() {
    if (isEditing && selectedRecurring) {
      await updateRecurring();
    } else {
      await createRecurring();
    }
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

  async function updateRecurring() {
    if (!selectedRecurring) return;

    const { error } = await supabase
      .from("recurring_transaction")
      .update({
        ...newRecurring,
        value: parseFloat(newRecurring.value),
      })
      .match({ id: selectedRecurring.id });

    if (error) {
      toast({
        title: "Erro",
        description: `Falha ao atualizar Recorrência: ${error.message}`,
        variant: "destructive",
        duration: 2000,
      });
    } else {
      toast({
        title: "Sucesso",
        description: "Recorrência atualizada com sucesso!",
        duration: 2000,
      });
      fetchRecurringTransactions();
      setOpen(false);
      setIsEditing(false);
      setSelectedRecurring(null);
      resetForm();
    }
  }

  async function deleteRecurring(id: number) {
    const { error } = await supabase.from("recurring_transaction").delete().match({ id });

    if (error) {
      toast({
        title: "Erro",
        description: `Falha ao excluir: ${error.message}`,
        variant: "destructive",
        duration: 2000,
      });
    } else {
      toast({
        title: "Deletado",
        description: "Recorrência removida com sucesso!",
        duration: 2000,
      });
      fetchRecurringTransactions();
    }
  }

  function resetForm() {
    setNewRecurring({
      class_id: "",
      value: "",
      description: "",
      frequency: "",
      validity: null,
    });
  }

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8">
      <div className="space-y-6">
        <div className="flex justify-end">
          <Dialog
            open={open}
            onOpenChange={(isOpen) => {
              if (!isOpen) {
                resetForm();
                setIsEditing(false);
                setSelectedRecurring(null);
              }
              setOpen(isOpen);
            }}
          >
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2" /> {isEditing ? "Editar Recorrência" : "Adicionar Recorrência"}
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md w-full">
              <DialogHeader>
                <DialogTitle>{isEditing ? "Editar Recorrência" : "Nova Recorrência"}</DialogTitle>
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
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="text-left px-4 py-2">Classe</TableHead>
              <TableHead className="text-left px-4 py-2">Valor</TableHead>
              <TableHead className="text-left px-4 py-2">Descrição</TableHead>
              <TableHead className="text-left px-4 py-2">Frequência</TableHead>
              <TableHead className="text-left px-4 py-2">Validade</TableHead>
              <TableHead className="text-center px-4 py-2">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {recurringTransactions.map((recurring) => (
              <TableRow key={recurring.id}>
                <TableCell className="px-4 py-2">{recurring.class?.name || "Sem Classe"}</TableCell>
                <TableCell className="px-4 py-2">R${recurring.value?.toFixed(2)}</TableCell>
                <TableCell className="px-4 py-2">{recurring.description || "Sem Descrição"}</TableCell>
                <TableCell className="px-4 py-2">{recurring.frequency || "-"}</TableCell>
                <TableCell className="px-4 py-2">
                  {recurring.validity ? new Date(recurring.validity).toLocaleDateString("pt-BR") : "-"}
                </TableCell>
                <TableCell className="px-4 py-2 text-center">
                  <div className="flex gap-2 justify-center">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => {
                        setSelectedRecurring(recurring);
                        setIsEditing(true);
                        setOpen(true);
                      }}
                    >
                      <Edit2 className="text-blue-500" />
                    </Button>
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

                      <AlertDialogContent className="max-w-md p-6 rounded-lg shadow-lg bg-white">
                        <AlertDialogHeader className="text-lg font-semibold text-gray-900">
                          Tem certeza?
                        </AlertDialogHeader>

                        <p className="text-gray-600 text-sm">
                          Esta ação não pode ser desfeita. Deseja remover esta transação?
                        </p>

                        <AlertDialogFooter className="flex justify-end gap-2 mt-4">
                          <AlertDialogCancel
                            className="px-4 py-2 rounded-md border border-gray-300 text-gray-700 hover:bg-gray-100"
                            onClick={() => setConfirmOpen(false)}
                          >
                            Cancelar
                          </AlertDialogCancel>

                          <AlertDialogAction
                            className="px-4 py-2 rounded-md bg-yellow-500 text-white font-semibold hover:bg-yellow-600"
                            onClick={() => selectedRecurring && deleteRecurring(selectedRecurring.id)}
                            disabled={loading === recurring.id}
                          >
                            Excluir
                          </AlertDialogAction>

                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>


                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>


      </div>
    </div>
  );
}
