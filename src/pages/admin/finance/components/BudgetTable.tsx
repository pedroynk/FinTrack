"use client";

import { Fragment } from "react";
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

function getRealizedValue(budget?: MonthlyBudgetSummary | null) {
  if (!budget) return 0;

  return budget.nature_name === "Receita"
    ? Number(budget.income_value || 0)
    : Number(budget.expense_value ?? budget.spent_value ?? 0);
}

function getRealizedLabel(budget?: MonthlyBudgetSummary | null) {
  return budget?.nature_name === "Receita" ? "Recebido" : "Gasto";
}

function getRemainingLabel(budget?: MonthlyBudgetSummary | null) {
  return budget?.nature_name === "Receita" ? "A receber" : "Restante";
}

function ProgressBar({ value, status }: { value: number; status: string }) {
  const normalized = Math.min(Number(value || 0), 100);

  const colorMap: Record<string, string> = {
    OK: "bg-green-500",
    ATENCAO: "bg-yellow-500",
    ATENÇÃO: "bg-yellow-500",
    CRITICO: "bg-orange-500",
    CRÍTICO: "bg-orange-500",
    QUASE: "bg-yellow-500",
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
    ATENÇÃO: "bg-yellow-500/15 text-yellow-500 border-yellow-500/30",
    CRITICO: "bg-orange-500/15 text-orange-500 border-orange-500/30",
    CRÍTICO: "bg-orange-500/15 text-orange-500 border-orange-500/30",
    QUASE: "bg-yellow-500/15 text-yellow-500 border-yellow-500/30",
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

function getRemainingClass(budget?: MonthlyBudgetSummary | null) {
  if (!budget) return "text-muted-foreground";

  const remaining = Number(budget.remaining_value || 0);
  const planned = Number(budget.planned_value || 0);

  if (budget.nature_name === "Receita") {
    if (remaining <= 0) return "text-green-500";
    if (planned > 0 && remaining <= planned * 0.3) return "text-yellow-500";
    return "text-red-500";
  }

  if (remaining < 0) return "text-red-500";
  if (planned > 0 && remaining <= planned * 0.3) return "text-yellow-500";
  return "text-green-500";
}

function BudgetActions({
  budget,
  confirmOpen,
  setConfirmOpen,
  selectedBudget,
  setSelectedBudget,
  deleteBudget,
  deleteLoading,
  handleEdit,
}: {
  budget: MonthlyBudgetSummary;
  confirmOpen: boolean;
  setConfirmOpen: (open: boolean) => void;
  selectedBudget: MonthlyBudgetSummary | null;
  setSelectedBudget: (budget: MonthlyBudgetSummary | null) => void;
  deleteBudget: () => void;
  deleteLoading: string | null;
  handleEdit: (budget: MonthlyBudgetSummary) => void;
}) {
  return (
    <div className="flex justify-end gap-2">
      <Button variant="outline" size="icon" onClick={() => handleEdit(budget)}>
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
              {deleteLoading === String(budget.id) ? "Excluindo..." : "Excluir"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
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
            <TableHead className="text-right">Realizado</TableHead>
            <TableHead className="text-right">Saldo</TableHead>
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
            Object.entries(groupedBudgets).map(([typeName, items]) => {
              const parent = items.find((b) => b.class_id === null);
              const children = items.filter((b) => b.class_id !== null);

              return (
                <Fragment key={typeName}>
                  <TableRow className="bg-muted/30 font-semibold hover:bg-muted/30">
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="text-sm font-bold">{typeName}</span>
                        <span className="text-xs text-muted-foreground">
                          {children.length} classe(s)
                        </span>
                      </div>
                    </TableCell>

                    <TableCell className="text-right">
                      {formatCurrency(parent?.planned_value ?? 0)}
                    </TableCell>

                    <TableCell className="text-right">
                      <div className="flex flex-col">
                        <span>{formatCurrency(getRealizedValue(parent))}</span>
                        <span className="text-xs text-muted-foreground">
                          {getRealizedLabel(parent)}
                        </span>
                      </div>
                    </TableCell>

                    <TableCell className={`text-right font-semibold ${getRemainingClass(parent)}`}>
                      <div className="flex flex-col">
                        <span>{formatCurrency(parent?.remaining_value ?? 0)}</span>
                        <span className="text-xs text-muted-foreground">
                          {getRemainingLabel(parent)}
                        </span>
                      </div>
                    </TableCell>

                    <TableCell>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-sm font-medium">
                            {Number(parent?.percentage_used || 0).toFixed(0)}%
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {parent?.nature_name === "Receita" ? "recebido" : "usado"}
                          </span>
                        </div>

                        <ProgressBar
                          value={Number(parent?.percentage_used || 0)}
                          status={parent?.status ?? "OK"}
                        />
                      </div>
                    </TableCell>

                    <TableCell>
                      <StatusBadge status={parent?.status ?? "OK"} />
                    </TableCell>

                    <TableCell>
                      {parent && (
                        <BudgetActions
                          budget={parent}
                          confirmOpen={confirmOpen}
                          setConfirmOpen={setConfirmOpen}
                          selectedBudget={selectedBudget}
                          setSelectedBudget={setSelectedBudget}
                          deleteBudget={deleteBudget}
                          deleteLoading={deleteLoading}
                          handleEdit={handleEdit}
                        />
                      )}
                    </TableCell>
                  </TableRow>

                  {children.map((budget) => (
                    <TableRow
                      key={budget.id}
                      className="transition-colors hover:bg-muted/40"
                    >
                      <TableCell>
                        <div className="flex items-center gap-3 pl-6">
                          <div className="h-8 w-0.5 rounded-full bg-muted-foreground/30" />
                          <span className="font-semibold">
                            {budget.class_name ?? "Sem classe"}
                          </span>
                        </div>
                      </TableCell>

                      <TableCell className="text-right font-medium">
                        {formatCurrency(budget.planned_value)}
                      </TableCell>

                      <TableCell className="text-right">
                        <div className="flex flex-col">
                          <span>{formatCurrency(getRealizedValue(budget))}</span>
                          <span className="text-xs text-muted-foreground">
                            {getRealizedLabel(budget)}
                          </span>
                        </div>
                      </TableCell>

                      <TableCell className={`text-right font-semibold ${getRemainingClass(budget)}`}>
                        <div className="flex flex-col">
                          <span>{formatCurrency(budget.remaining_value)}</span>
                          <span className="text-xs text-muted-foreground">
                            {getRemainingLabel(budget)}
                          </span>
                        </div>
                      </TableCell>

                      <TableCell>
                        <div className="space-y-2">
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-sm font-medium">
                              {Number(budget.percentage_used || 0).toFixed(0)}%
                            </span>
                            <span className="text-xs text-muted-foreground">
                              {budget.nature_name === "Receita" ? "recebido" : "usado"}
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
                        <BudgetActions
                          budget={budget}
                          confirmOpen={confirmOpen}
                          setConfirmOpen={setConfirmOpen}
                          selectedBudget={selectedBudget}
                          setSelectedBudget={setSelectedBudget}
                          deleteBudget={deleteBudget}
                          deleteLoading={deleteLoading}
                          handleEdit={handleEdit}
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </Fragment>
              );
            })
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