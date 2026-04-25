"use client";

import { Pen, Trash2 } from "lucide-react";

import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
  AlertDialogTitle,
  AlertDialogDescription,
} from "@/components/ui/alert-dialog";

import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import type { MonthlyBudgetSummary } from "@/types/finance";

interface BudgetTableProps {
  budgets: MonthlyBudgetSummary[];
  loading?: boolean;
  confirmOpen: boolean;
  setConfirmOpen: (open: boolean) => void;
  selectedBudget: MonthlyBudgetSummary | null;
  setSelectedBudget: (budget: MonthlyBudgetSummary | null) => void;
  deleteBudget: () => void;
  deleteLoading: string | null;
  handleEdit: (budget: MonthlyBudgetSummary) => void;
}

const formatCurrency = (value: number) =>
  Number(value || 0).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });

function ProgressBar({ value, status }: { value: number; status: string }) {
  const normalized = Math.min(Number(value || 0), 100);

  const colorMap: Record<string, string> = {
    OK: "bg-green-500",
    ATENCAO: "bg-yellow-500",
    CRITICO: "bg-orange-500",
    ESTOUROU: "bg-red-500",
  };

  return (
    <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
      <div
        className={`h-full transition-all ${colorMap[status] ?? "bg-blue-500"}`}
        style={{ width: `${normalized}%` }}
      />
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    OK: "bg-green-500/15 text-green-500 border-green-500/30",
    ATENCAO: "bg-yellow-500/15 text-yellow-500 border-yellow-500/30",
    CRITICO: "bg-orange-500/15 text-orange-500 border-orange-500/30",
    ESTOUROU: "bg-red-500/15 text-red-500 border-red-500/30",
  };

  return (
    <span
      className={`
        inline-flex items-center rounded-full border px-2.5 py-1
        text-xs font-semibold
        ${map[status] ?? "bg-muted text-muted-foreground"}
      `}
    >
      {status}
    </span>
  );
}

function getRemainingClass(budget: MonthlyBudgetSummary) {
  const remaining = Number(budget.remaining_value || 0);
  const planned = Number(budget.planned_value || 0);

  if (remaining < 0) return "text-red-500";
  if (planned > 0 && remaining <= planned * 0.3) return "text-yellow-500";
  return "text-green-500";
}

export function BudgetTable({
  budgets,
  loading = false,
  confirmOpen,
  setConfirmOpen,
  selectedBudget,
  setSelectedBudget,
  deleteBudget,
  deleteLoading,
  handleEdit,
}: BudgetTableProps) {
  
  // 🔥 AGRUPAMENTO POR TIPO
  const groupedBudgets = budgets.reduce<Record<string, MonthlyBudgetSummary[]>>(
    (acc, budget) => {
      const key = budget.type_name ?? "Sem tipo";

      if (!acc[key]) acc[key] = [];
      acc[key].push(budget);

      return acc;
    },
    {}
  );

  return (
    <div className="w-full overflow-x-auto rounded-xl border bg-card">
      <Table>
        <TableHeader>
          <TableRow className="hover:bg-transparent">
            <TableHead className="min-w-[220px]">Categoria</TableHead>
            <TableHead className="text-right">Orçado</TableHead>
            <TableHead className="text-right">Gasto</TableHead>
            <TableHead className="text-right">Restante</TableHead>
            <TableHead className="min-w-[160px]">Uso</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Ações</TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {loading ? (
            <TableRow>
              <TableCell colSpan={7} className="h-24 text-center text-muted-foreground">
                Carregando orçamento...
              </TableCell>
            </TableRow>
          ) : budgets.length ? (
            Object.entries(groupedBudgets).map(([typeName, items]) => (
              <>
                {/* HEADER DO TIPO */}
                <TableRow key={typeName} className="bg-muted/30 hover:bg-muted/30">
                  <TableCell colSpan={7} className="py-3">
                    <div className="flex flex-col">
                      <span className="text-sm font-bold">{typeName}</span>
                      <span className="text-xs text-muted-foreground">
                        {items.length} orçamento(s)
                      </span>
                    </div>
                  </TableCell>
                </TableRow>

                {/* SUBCLASSES */}
                {items.map((budget) => (
                  <TableRow
                    key={budget.id}
                    className="transition-colors hover:bg-muted/40"
                  >
                    <TableCell>
                      <div className="flex items-center gap-3 pl-4">
                        <div className="h-8 w-0.5 rounded-full bg-muted-foreground/30" />

                        <div className="flex flex-col">
                          <span className="font-semibold">
                            {budget.class_name ?? "Geral do tipo"}
                          </span>
                        </div>
                      </div>
                    </TableCell>

                    <TableCell className="text-right font-medium">
                      {formatCurrency(budget.planned_value)}
                    </TableCell>

                    <TableCell className="text-right">
                      {formatCurrency(budget.spent_value)}
                    </TableCell>

                    <TableCell
                      className={`text-right font-semibold ${getRemainingClass(budget)}`}
                    >
                      {formatCurrency(budget.remaining_value)}
                    </TableCell>

                    <TableCell>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-sm font-medium">
                            {Number(budget.percentage_used || 0).toFixed(0)}%
                          </span>
                          <span className="text-xs text-muted-foreground">
                            usado
                          </span>
                        </div>

                        <ProgressBar
                          value={Number(budget.percentage_used || 0)}
                          status={budget.status}
                        />
                      </div>
                    </TableCell>

                    <TableCell>
                      <StatusBadge status={budget.status} />
                    </TableCell>

                    <TableCell>
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => handleEdit(budget)}
                        >
                          <Pen className="h-4 w-4 text-blue-500" />
                        </Button>

                        <AlertDialog
                          open={confirmOpen && selectedBudget?.id === budget.id}
                          onOpenChange={(open) => {
                            setConfirmOpen(open);
                            if (!open) setSelectedBudget(null);
                          }}
                        >
                          <AlertDialogTrigger asChild>
                            <Button
                              variant="outline"
                              size="icon"
                              onClick={() => {
                                setSelectedBudget(budget);
                                setConfirmOpen(true);
                              }}
                            >
                              <Trash2 className="h-4 w-4 text-red-500" />
                            </Button>
                          </AlertDialogTrigger>

                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Tem certeza?</AlertDialogTitle>
                              <AlertDialogDescription>
                                Esta ação não pode ser desfeita. Deseja remover este orçamento?
                              </AlertDialogDescription>
                            </AlertDialogHeader>

                            <AlertDialogFooter>
                              <AlertDialogCancel
                                onClick={() => {
                                  setConfirmOpen(false);
                                  setSelectedBudget(null);
                                }}
                              >
                                Cancelar
                              </AlertDialogCancel>

                              <AlertDialogAction
                                onClick={(event) => {
                                  event.preventDefault();
                                  deleteBudget();
                                }}
                                disabled={deleteLoading === String(budget.id)}
                              >
                                {deleteLoading === String(budget.id)
                                  ? "Excluindo..."
                                  : "Excluir"}
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={7} className="h-24 text-center text-muted-foreground">
                Nenhum orçamento encontrado para este mês.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}