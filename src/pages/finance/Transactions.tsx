import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import { CircleDollarSign, Trash2, RefreshCw, Loader2 } from "lucide-react";
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
import { DatePicker } from "@/components/DatePicker";
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

  const [open, setOpen] = useState(false);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState<string | null>(null);
  const [selectedTransaction, setSelectedTransaction] = useState<any | null>(
    null
  );
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
      .select(
        "*, class:class_id(name), nature:nature_id(name)"
      )
      .order("date", { ascending: false })
      .range((page - 1) * pageSize, page * pageSize - 1);
  
    console.log("Transações:", data);
    console.error("Erro:", error);
  
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
      console.error("Erro ao buscar Natureza:", error.message);
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
              )}{" "}
              Atualizar
            </Button>
            <Dialog open={open} onOpenChange={setOpen}>
              <DialogTrigger asChild>
                <Button>Adicionar Transação</Button>
              </DialogTrigger>
              <DialogContent className="max-w-md sm:max-w-lg w-full p-4 sm:p-6">
                <DialogHeader>
                  <DialogTitle>Nova Transação</DialogTitle>
                </DialogHeader>
                <div className="grid grid-cols-1 gap-4">
                  <Label>Natureza</Label>
                  <Select
                    onValueChange={(value: string) =>
                      setNewTransaction({ ...newTransaction, nature_id: value })
                    }
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Selecione a Natureza" />
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
                    onChange={(e) =>
                      setNewTransaction({
                        ...newTransaction,
                        description: e.target.value,
                      })
                    }
                  />
                  <Label>Data (Opcional)</Label>
                  <DatePicker
                    selectedDate={newTransaction.date}
                    onSelect={(date) =>
                      setNewTransaction({
                        ...newTransaction,
                        date: date || new Date(),
                      })
                    }
                  />
                  <Button onClick={createTransaction}>Salvar</Button>
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
                {isMobile ? null : (
                  <>
                    <TableHead>Natureza</TableHead>
                    <TableHead>Tipo</TableHead>
                  </>
                )}
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
      <>
        <TableCell>{transaction.nature?.name || 'Sem Natureza'}</TableCell>
        <TableCell>{transaction.class?.name || 'Sem Classe'}</TableCell>
      </>
    )}
    <TableCell>{transaction.class?.name || 'Sem Classe'}</TableCell>
    <TableCell className="text-left">R$ {transaction.value?.toFixed(2) || '0.00'}</TableCell>
    <TableCell>{transaction.description || 'Sem Descrição'}</TableCell>
    <TableCell>
    {transaction.date 
  ? new Date(transaction.date).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    })
  : 'Sem Data'}
    </TableCell>
    <TableCell>
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
          <p>
            Esta ação não pode ser desfeita. Deseja remover esta
            transação?
          </p>
          <AlertDialogFooter>
            <AlertDialogCancel
              onClick={() => setConfirmOpen(false)}
            >
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={deleteTransaction}
              disabled={loading === transaction.id}
            >
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
