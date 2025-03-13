import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DatePicker } from "@/components/DatePicker";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { supabase } from "@/lib/supabase";
import { CircleDollarSign, Trash2, RefreshCw, Loader2, Edit2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from "@/components/ui/alert-dialog";
import "react-datepicker/dist/react-datepicker.css";
import { useSidebar } from "@/components/ui/sidebar";

export default function Transactions() {
  const { isMobile } = useSidebar();

  const { toast } = useToast();
  const [transactions, setTransactions] = useState<any[]>([]);
  const [classes, setClasses] = useState<any[]>([]);
  const [natures, setNatures] = useState<any[]>([]);
  const [newTransaction, setNewTransaction] = useState({
    nature_id: "",
    value: "",
    class_id: "",
    description: "",
    date: new Date(),
  });
  const [newClass, setNewClass] = useState({
    name: "",
  });

  const [open, setOpen] = useState(false);
  const [openClass, setOpenClass] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState<string | null>(null);
  const [selectedTransaction, setSelectedTransaction] = useState<any | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);

  useEffect(() => {
    fetchClasses();
    fetchNatures();
  }, []);

  useEffect(() => {
    fetchTransactions();
  }, [page, pageSize]);

  async function fetchTransactions() {
    setRefreshing(true);
    const { data, error } = await supabase
      .from("transaction")
      .select("*, class:class_id(name), nature:nature_id(name)")
      .order("date", { ascending: false })
      .range((page - 1) * pageSize, page * pageSize - 1);

    if (error) {
      console.error("Erro:", error);
    }

    setTransactions(data || []);
    setRefreshing(false);
  }

  async function fetchClasses() {
    const { data } = await supabase.from("class").select("*");
    setClasses(data || []);
  }

  async function fetchNatures() {
    const { data, error } = await supabase.from("nature").select("*");
    if (error) {
      console.error("Erro ao buscar Tipo:", error.message);
    }
    setNatures(data || []);
  }

  async function createTransaction() {
    const { error } = await supabase.from("transaction").insert([
      {
        ...newTransaction,
        value: parseFloat(newTransaction.value),
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
      fetchTransactions();
      setOpen(false);
    }
  }

  async function updateTransaction() {
    if (!selectedTransaction) return;

    const { error } = await supabase
      .from("transaction")
      .update({
        ...newTransaction,
        value: parseFloat(newTransaction.value),
      })
      .match({ id: selectedTransaction.id });

    if (error) {
      toast({
        title: "Erro",
        description: `Falha ao atualizar transação: ${error.message}`,
        variant: "destructive",
        duration: 2000,
      });
    } else {
      toast({
        title: "Sucesso",
        description: "Transação atualizada com sucesso!",
        duration: 2000,
      });

      fetchTransactions();
      setOpen(false);
      setIsEditing(false);
      setSelectedTransaction(null);

      setNewTransaction({
        nature_id: "",
        value: "",
        class_id: "",
        description: "",
        date: new Date(),
      });
    }
  }


  async function deleteTransaction() {
    if (!selectedTransaction) return;

    setLoading(selectedTransaction.id);
    setConfirmOpen(false);

    const { error } = await supabase
      .from("transaction")
      .delete()
      .match({ id: selectedTransaction.id });

    if (error) {
      toast({
        title: "Erro",
        description: `Falha ao excluir: ${error.message}`,
        variant: "destructive",
        duration: 2000,
      });
    } else {
      setTransactions((prev) =>
        prev.filter((t) => t.id !== selectedTransaction.id)
      );
      toast({
        title: "Deletado",
        description: "Transação removida com sucesso!",
        duration: 2000,
      });
    }
    setLoading(null);
    setSelectedTransaction(null);
  }

  function getIcon(nature: string) {
    switch (nature) {
      case "Receita":
        return <CircleDollarSign className="text-green-500" />;
      case "Despesa":
        return <CircleDollarSign className="text-red-500" />;
    }
  }

  async function createClass() {
    const { error } = await supabase.from("class").insert([
      {
        name: newClass.name,
      },
    ]);

    if (error) {
      toast({
        title: "Erro",
        description: `Falha ao adicionar Classe: ${error.message}`,
        variant: "destructive",
        duration: 2000,
      });
    } else {
      toast({
        title: "Sucesso",
        description: "Classe adicionada com sucesso!",
        duration: 2000,
      });
      fetchTransactions();
      setOpenClass(false);
    }
  }

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8">
      <div className="sm:p-2 lg:p-4">
        {/* Header and Dialog */}
        <div className="flex flex-col gap-4 sm:flex-row sm:justify-between sm:items-center mb-4">
          <h1 className="text-2xl font-bold">Transações</h1>
          <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
            <Button
              onClick={fetchTransactions}
              variant="outline"
              disabled={refreshing}
            >
              {refreshing ? (
                <Loader2 className="mr-2 animate-spin" />
              ) : (
                <RefreshCw className="mr-2" />
              )} {" "}
              Atualizar
            </Button>
            <Dialog
              open={open}
              onOpenChange={(isOpen) => {
                if (!isOpen) {
                  setNewTransaction({
                    nature_id: "",
                    value: "",
                    class_id: "",
                    description: "",
                    date: new Date(),
                  });
                  setIsEditing(false);
                  setSelectedTransaction(null);
                }
                setOpen(isOpen);
              }}
            >
              <DialogTrigger asChild>
                <Button>Adicionar Transação</Button>
              </DialogTrigger>
              <DialogContent className="max-w-md sm:max-w-lg w-full p-4 sm:p-6">
                <DialogHeader>
                  <DialogTitle>{isEditing ? "Editar Transação" : "Nova Transação"}</DialogTitle>
                </DialogHeader>
                <div className="grid grid-cols-1 gap-4">
                  <Label>Tipo</Label>
                  <Select
                    onValueChange={(value: string) =>
                      setNewTransaction({ ...newTransaction, nature_id: value })
                    }
                    value={newTransaction.nature_id}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Selecione o Tipo" />
                    </SelectTrigger>
                    <SelectContent>
                      {natures.map((t) => (
                        <SelectItem key={t.id} value={t.id}>
                          {t.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Label>Classe</Label>
                  <Select
                    onValueChange={(value: string) =>
                      setNewTransaction({ ...newTransaction, class_id: value })
                    }
                    value={newTransaction.class_id}
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
                    value={newTransaction.value}
                    onChange={(e) =>
                      setNewTransaction({
                        ...newTransaction,
                        value: e.target.value,
                      })
                    }
                  />
                  <Label>Descrição</Label>
                  <Input
                    type="text"
                    value={newTransaction.description}
                    onChange={(e) =>
                      setNewTransaction({
                        ...newTransaction,
                        description: e.target.value,
                      })
                    }
                  />
                  <Label>Data</Label>
                  <DatePicker
                    selectedDate={newTransaction.date}
                    onSelect={(date) =>
                      setNewTransaction({
                        ...newTransaction,
                        date: date ?? new Date(),
                      })
                    }
                  />
                  <Button onClick={isEditing ? updateTransaction : createTransaction}>
                    {isEditing ? "Atualizar" : "Salvar"}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
            <Dialog
            open={openClass}
            onOpenChange={(isOpen) => {
              if (!isOpen) {
                setNewClass({
                  name: "",
                });
              }
              setOpenClass(isOpen);
            }}
          >
              <DialogTrigger asChild>
                <Button>Adicionar Classe</Button>
              </DialogTrigger>
              <DialogContent className="max-w-md sm:max-w-lg w-full p-4 sm:p-6">
                <DialogHeader>
                  <DialogTitle>Adicionar Classe</DialogTitle>
                </DialogHeader>
                <div className="grid grid-cols-1 gap-4">
                  <Label>Nome da Classe</Label>
                  <Input
                    type="text"
                    value={newClass.name}
                    onChange={(e) =>
                      setNewClass({
                        ...newClass,
                        name: e.target.value,
                      })
                    }
                  />
                  <Button onClick={createClass}>
                    Salvar
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Transactions Table */}
        <div className="w-full overflow-x-auto max-w-full">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead></TableHead>
                {isMobile ? null : <TableHead>Tipo</TableHead>}
                <TableHead>Classe</TableHead>
                <TableHead>Valor</TableHead>
                <TableHead>Descrição</TableHead>
                <TableHead>Data</TableHead>
                <TableHead>Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {transactions.map((transaction) => (
                <TableRow key={transaction.id}>
                  <TableCell>{getIcon(transaction.class?.nature?.name)}</TableCell>
                  {isMobile ? null : (
                    <TableCell>{transaction.nature?.name || 'Sem Tipo'}</TableCell>
                  )}
                  <TableCell>{transaction.class?.name || 'Sem Classe'}</TableCell>
                  <TableCell className="text-left">R$ {transaction.value?.toFixed(2) || '0.00'}</TableCell>
                  <TableCell>{transaction.description || 'Sem Descrição'}</TableCell>
                  <TableCell>{transaction.date}</TableCell>
                  <TableCell className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => {
                        setNewTransaction({
                          nature_id: transaction.nature_id,
                          value: transaction.value.toString(),
                          class_id: transaction.class_id,
                          description: transaction.description,
                          date: new Date(transaction.date),
                        });
                        setSelectedTransaction(transaction);
                        setIsEditing(true);
                        setOpen(true);
                      }}
                    >
                      <Edit2 className="text-blue-500" />
                    </Button>
                    <AlertDialog
                      open={confirmOpen && selectedTransaction?.id === transaction.id}
                      onOpenChange={setConfirmOpen}
                    >
                      <AlertDialogTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setSelectedTransaction(transaction)}
                        >
                          <Trash2 className="text-red-500" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>Tem certeza?</AlertDialogHeader>
                        <p>Esta ação não pode ser desfeita. Deseja remover esta transação?</p>
                        <AlertDialogFooter>
                          <AlertDialogCancel onClick={() => setConfirmOpen(false)}>
                            Cancelar
                          </AlertDialogCancel>
                          <AlertDialogAction onClick={deleteTransaction} disabled={loading === transaction.id}>
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

        {/* Pagination */}
        <div className="flex flex-col sm:flex-row justify-between items-center gap-3">
          <div className="flex items-center space-x-2">
            <Label>Por página</Label>
            <Select
              value={String(pageSize)}
              onValueChange={(value: string) => setPageSize(Number(value))}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Selecionar" />
              </SelectTrigger>
              <SelectContent>
                {[5, 10, 20, 50].map((size) => (
                  <SelectItem key={size} value={String(size)}>
                    {size}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center space-x-2">
            <Button
              disabled={page === 1}
              onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
            >
              Anterior
            </Button>
            <span>Página {page}</span>
            <Button
              disabled={transactions.length < pageSize}
              onClick={() => setPage((prev) => prev + 1)}
            >
              Próxima
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
