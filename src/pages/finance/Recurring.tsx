import { useEffect, useState } from "react";
import { Table, TableBody, TableCell, TableRow } from "@/components/ui/table";
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
                  onValueChange={(value) => setNewRecurring({ ...newRecurring, class_id: value })}
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
                  value={newRecurring.value}
                  onChange={(e) => setNewRecurring({ ...newRecurring, value: e.target.value })}
                />
                <Label>Validade</Label>
                <DatePicker
                  selected={newRecurring.validity}
                  onChange={(date) => setNewRecurring({ ...newRecurring, validity: date })}
                  isClearable
                  className="w-full p-2 border rounded"
                />
                <Button onClick={createOrUpdateRecurring}>{isEditing ? "Atualizar" : "Salvar"}</Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
        <Table>
          <TableBody>
            {recurringTransactions.map((recurring) => (
              <TableRow key={recurring.id}>
                <TableCell>
                  <Button onClick={() => { setSelectedRecurring(recurring); setIsEditing(true); setOpen(true); }}>
                    <Edit2 className="text-blue-500" />
                  </Button>
                  <Button onClick={() => deleteRecurring(recurring.id)}>
                    <Trash2 className="text-red-500" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
