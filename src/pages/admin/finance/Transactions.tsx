import { useEffect, useState } from "react";
import {RefreshCw, Loader2 } from "lucide-react";

import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import Pagination from "./components/Pagination";
import { useSidebar } from "@/components/ui/sidebar";
import { Dimension, Transaction, TransactionCreateRequest } from "@/types/finance";
import { TransactionsTable } from "./components/TransactionsTable";
import { useTransactions } from "@/hooks/database/useTransactions";
import { TransactionFormDialog } from "./components/TransactionFormDialog";
import { createTransactionApi, deleteTransactionApi, fetchDimensions, updateTransactionApi } from "@/api/finance";


export default function Transactions() {
  const { toast } = useToast();
  const { isMobile } = useSidebar();

  const [dimensions, setDimensions] = useState<Dimension[]>([]);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const { transactions, setTransactions, loadingTransactions, refetchTransactions } = useTransactions(page, pageSize);

  const new_transaction_default = {
    class_id: 0,
    value: 0,
    description: "",
    transaction_at: new Date().toISOString(),
  }

  const [newTransaction, setNewTransaction] = useState<TransactionCreateRequest>(new_transaction_default);

  const [formOpen, setOpen] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState<string | null>(null);
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
   fetchDimensions().then((dimensions) => setDimensions(dimensions))
  }, []);

  async function createTransaction() {
    try {
      await createTransactionApi(newTransaction);
      toast({
        title: "Sucesso",
        description: "Transação adicionada com sucesso!",
        duration: 2000,
      });
      refetchTransactions()
      setOpen(false);
      setNewTransaction(new_transaction_default)
    } catch (error) {
      toast({
        title: "Erro",
        description: `Falha ao adicionar transação: ${error}`,
        variant: "destructive",
        duration: 2000,
      });
    }
  }

  async function deleteTransaction() {
    if (!selectedTransaction) return;
    setDeleteLoading(String(selectedTransaction.id));
    setConfirmOpen(false);
    try {
      deleteTransactionApi(selectedTransaction.id)
      setTransactions((prev) =>
        prev.filter((t) => t.id !== selectedTransaction.id)
      );
      toast({
        title: "Deletado",
        description: "Transação removida com sucesso!",
        duration: 2000,
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: `Falha ao excluir: ${error}`,
        variant: "destructive",
        duration: 2000,
      });
    }
    finally {
      setDeleteLoading(null);
      setSelectedTransaction(null);
    }
  }

  async function editTransaction() {
    if (!selectedTransaction) return;
    try {
      await updateTransactionApi(String(selectedTransaction.id), newTransaction);
      toast({
        title: "Sucesso",
        description: "Transação atualizada com sucesso!",
        duration: 2000,
      });
      refetchTransactions();
      setOpen(false);
      setIsEditing(false);
      setSelectedTransaction(null);
    } catch (error) {
      toast({
        title: "Erro",
        description: `Falha ao editar transação: ${error}`,
        variant: "destructive",
        duration: 2000,
      });
    }
  }

  function handleEdit(transaction: Transaction) {
    setSelectedTransaction(transaction);
    setNewTransaction({
      class_id: transaction.class.id,
      value: transaction.value,
      description: transaction.description,
      transaction_at: new Date(transaction.transaction_at).toISOString(),
    });
    setIsEditing(true);
    setOpen(true);
  }

  return (
    <div className="container mx-auto sm:px-4 lg:px-8">
      <div className="sm:p-2 lg:p-4">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:justify-between sm:items-center mb-4">
          <h1 className="text-2xl font-bold">Transações</h1>
          <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
            <Button
              onClick={refetchTransactions}
              variant="outline"
              disabled={loadingTransactions}
            >
              {loadingTransactions ? (
                <Loader2 className="mr-2 animate-spin" />
              ) : (
                <RefreshCw className="mr-2" />
              )}{" "}
              Atualizar
            </Button>
            <TransactionFormDialog
              open={formOpen}
              setOpen={setOpen}
              newTransaction={newTransaction}
              setNewTransaction={setNewTransaction}
              createTransaction={isEditing ? editTransaction : createTransaction}
              dimensions={dimensions}
              isEditing={isEditing}
              onClose={() => {
                setIsEditing(false);
                setSelectedTransaction(null);
                setNewTransaction(new_transaction_default);
              }}
            />
          </div>
        </div>

        {/* Transactions Table */}
        <TransactionsTable
          transactions={transactions}
          isMobile={isMobile}
          confirmOpen={confirmOpen}
          setConfirmOpen={setConfirmOpen}
          selectedTransaction={selectedTransaction}
          setSelectedTransaction={setSelectedTransaction}
          deleteTransaction={deleteTransaction}
          deleteLoading={deleteLoading}
          handleEdit={handleEdit}
        />

        <Pagination
          page={page}
          pageSize={pageSize}
          onSetPage={setPage}
          onSetPageSize={setPageSize}
        />
      </div>
    </div>
  );
}
