import { useEffect, useMemo, useState } from "react";

import {
  fetchMonthlyBudgetSummary,
  createMonthlyBudgetApi,
  updateMonthlyBudgetApi,
  deleteMonthlyBudgetApi,
  fetchDimensions,
} from "@/api/finance";

import { BudgetSummary } from "@/pages/admin/finance/components/BudgetSummary";
import { BudgetTable } from "@/pages/admin/finance/components/BudgetTable";
import { BudgetFormDialog } from "@/pages/admin/finance/components/BudgetFormDialog";

import type {
  Dimension,
  MonthlyBudgetCreateRequest,
  MonthlyBudgetSummary,
} from "@/types/finance";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

function getEmptyBudget(): MonthlyBudgetCreateRequest {
  return {
    type_id: null,
    class_id: null,
    budget_month: "",
    planned_value: 0,
  };
}

export default function Budget() {
  const today = new Date();
  const currentMonth = today.getMonth() + 1;
  const currentYear = today.getFullYear();

  const [selectedMonth, setSelectedMonth] = useState<number>(currentMonth);
  const [selectedYear, setSelectedYear] = useState<number>(currentYear);

  const budgetMonth = `${selectedYear}-${String(selectedMonth).padStart(2, "0")}-01`;

  const [summary, setSummary] = useState<MonthlyBudgetSummary[]>([]);
  const [dimensions, setDimensions] = useState<Dimension[]>([]);

  const [open, setOpen] = useState(false);
  const [newBudget, setNewBudget] = useState<MonthlyBudgetCreateRequest>(
    getEmptyBudget()
  );

  const [isEditing, setIsEditing] = useState(false);
  const [editingBudgetId, setEditingBudgetId] = useState<number | null>(null);

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [selectedBudget, setSelectedBudget] =
    useState<MonthlyBudgetSummary | null>(null);
  const [deleteLoading, setDeleteLoading] = useState<string | null>(null);

  const [loading, setLoading] = useState(false);

  const totals = useMemo(() => {
    const planned = summary.reduce(
      (acc, item) => acc + Number(item.planned_value || 0),
      0
    );
    const spent = summary.reduce(
      (acc, item) => acc + Number(item.spent_value || 0),
      0
    );
    const remaining = planned - spent;
    const percentage =
      planned > 0 ? Number(((spent / planned) * 100).toFixed(2)) : 0;

    return { planned, spent, remaining, percentage };
  }, [summary]);

  async function loadBudgetData() {
    setLoading(true);

    try {
      const summaryData = await fetchMonthlyBudgetSummary(budgetMonth);
      setSummary(summaryData);
    } finally {
      setLoading(false);
    }
  }

  async function loadDimensions() {
    const data = await fetchDimensions();
    setDimensions((data ?? []) as Dimension[]);
  }

  useEffect(() => {
    loadBudgetData();
  }, [budgetMonth]);

  useEffect(() => {
    loadDimensions();
  }, []);

  function resetForm() {
    setNewBudget(getEmptyBudget());
    setIsEditing(false);
    setEditingBudgetId(null);
  }

  async function saveBudget() {
    if (isEditing && editingBudgetId) {
      await updateMonthlyBudgetApi({
        id: editingBudgetId,
        ...newBudget,
      });
    } else {
      await createMonthlyBudgetApi(newBudget);
    }

    setOpen(false);
    resetForm();
    await loadBudgetData();
  }

  function handleEdit(budget: MonthlyBudgetSummary) {
    setIsEditing(true);
    setEditingBudgetId(budget.id);

    setNewBudget({
      type_id: budget.type_id,
      class_id: budget.class_id,
      budget_month: budget.budget_month,
      planned_value: Number(budget.planned_value),
    });

    setOpen(true);
  }

  async function deleteBudget() {
    if (!selectedBudget) return;

    setDeleteLoading(String(selectedBudget.id));

    try {
      await deleteMonthlyBudgetApi(selectedBudget.id);

      setSummary((prev) =>
        prev.filter((item) => item.id !== selectedBudget.id)
      );

      setConfirmOpen(false);
      setSelectedBudget(null);

      await loadBudgetData();
    } catch (error) {
      console.error("Erro ao excluir orçamento:", error);
    } finally {
      setDeleteLoading(null);
    }
  }

  return (
    <div className="p-4 sm:p-6 space-y-6">
      <div className="space-y-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            Orçamento mensal
          </h1>
          <p className="text-sm text-muted-foreground">
            Acompanhe o planejado, gasto e restante por categoria.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3 max-w-md">
          <Select
            onValueChange={(value) => setSelectedMonth(Number(value))}
            value={String(selectedMonth)}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Mês" />
            </SelectTrigger>

            <SelectContent>
              {[...Array(12)].map((_, i) => {
                const monthName = new Date(0, i).toLocaleString("pt-BR", {
                  month: "long",
                });

                const monthLabel =
                  monthName.charAt(0).toUpperCase() + monthName.slice(1);

                return (
                  <SelectItem key={i + 1} value={String(i + 1)}>
                    {monthLabel}
                  </SelectItem>
                );
              })}
            </SelectContent>
          </Select>

          <Select
            onValueChange={(value) => setSelectedYear(Number(value))}
            value={String(selectedYear)}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Ano" />
            </SelectTrigger>

            <SelectContent>
              {[...Array(currentYear - 2025 + 6)].map((_, i) => {
                const year = 2025 + i;

                return (
                  <SelectItem key={year} value={String(year)}>
                    {year}
                  </SelectItem>
                );
              })}
            </SelectContent>
          </Select>
        </div>
      </div>

      <BudgetSummary
        planned={totals.planned}
        spent={totals.spent}
        remaining={totals.remaining}
        percentage={totals.percentage}
      />

      <BudgetFormDialog
        open={open}
        setOpen={setOpen}
        newBudget={newBudget}
        setNewBudget={setNewBudget}
        saveBudget={saveBudget}
        dimensions={dimensions}
        isEditing={isEditing}
        onClose={resetForm}
      />

      <div className="w-full overflow-x-auto rounded-lg border">
        <BudgetTable
          budgets={summary}
          loading={loading}
          confirmOpen={confirmOpen}
          setConfirmOpen={setConfirmOpen}
          selectedBudget={selectedBudget}
          setSelectedBudget={setSelectedBudget}
          deleteBudget={deleteBudget}
          deleteLoading={deleteLoading}
          handleEdit={handleEdit}
        />
      </div>
    </div>
  );
}