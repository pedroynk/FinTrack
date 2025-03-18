import { Trash2, Pen, CircleDollarSign } from "lucide-react";

import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from "@/components/ui/alert-dialog";
import { Transaction } from "@/types/finance";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DynamicIcon, IconName } from "lucide-react/dynamic";
interface TransactionsTableProps {
  transactions: Transaction[];
  isMobile: boolean;
  confirmOpen: boolean;
  setConfirmOpen: (open: boolean) => void;
  selectedTransaction: Transaction | null; 
  setSelectedTransaction: (transaction: Transaction | null) => void;
  deleteTransaction: () => void;
  deleteLoading: string | null;
  handleEdit: (transaction: Transaction) => void;
}

export function TransactionsTable({
  transactions,
  isMobile,
  confirmOpen,
  setConfirmOpen,
  selectedTransaction,
  setSelectedTransaction,
  deleteTransaction,
  deleteLoading,
  handleEdit, // destructured here
}: TransactionsTableProps) {
  
  
  function getIcon(transaction: Transaction) {
    if (transaction.class.type.lucide_icon)
    {
      return <DynamicIcon 
        name={transaction.class.type.lucide_icon as IconName}
        style={{ color: String(transaction.class.type.hex_color) }}
      />
    }

    switch (transaction.class.type.nature.name) {
      case "Receita":
        return <CircleDollarSign className="text-green-500" />;
      case "Despesa":
        return <CircleDollarSign className="text-red-500" />;
      default:
        return null;
    }
  }
  
  return (
    <div className="w-full overflow-x-auto max-w-full">
      <Table>
        <TableHeader>
          <TableRow>
            {!isMobile && (
              <>
                <TableHead></TableHead>
                <TableHead>Natureza</TableHead>
              </>
            )}
            <TableHead>Tipo</TableHead>
            <TableHead>Classe</TableHead>
            <TableHead>Valor</TableHead>
            <TableHead>Descrição</TableHead>
            <TableHead>Data</TableHead>
            <TableHead>Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {transactions.map((t) => (
            <TableRow key={t.id}>
              {!isMobile && (
                <>
                  <TableCell>{getIcon(t)}</TableCell>
                  <TableCell>{t.class?.type?.nature?.name}</TableCell>
                </>
              )}
              <TableCell>{t.class?.type?.name}</TableCell>
              <TableCell>{t.class?.name}</TableCell>
              <TableCell className="text-center">R$ {t.value}</TableCell>
              <TableCell>{t.description}</TableCell>
              <TableCell>{new Date(t.transaction_at).toLocaleDateString()}</TableCell>
              <TableCell className="flex gap-2">
                {/* Edit Button */}
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleEdit(t)}
                >
                  <Pen className="text-blue-500" />
                </Button>
                {/* Delete Confirmation */}
                <AlertDialog
                  open={confirmOpen && selectedTransaction?.id === t.id}
                  onOpenChange={setConfirmOpen}
                >
                  <AlertDialogTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setSelectedTransaction(t)}
                    >
                      <Trash2 className="text-red-500" />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>Tem certeza?</AlertDialogHeader>
                    <p>
                      Esta ação não pode ser desfeita. Deseja remover esta transação?
                    </p>
                    <AlertDialogFooter>
                      <AlertDialogCancel onClick={() => setConfirmOpen(false)}>
                        Cancelar
                      </AlertDialogCancel>
                      <AlertDialogAction
                        onClick={deleteTransaction}
                        disabled={deleteLoading === String(t.id)}
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
  );
}
