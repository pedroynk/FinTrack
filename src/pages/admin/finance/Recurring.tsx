import { RecurringFormDialog } from "@/pages/admin/finance/components/RecurringFormDialog";
import { RecurringTable } from "@/pages/admin/finance/components/RecurringTable";
import { useEffect, useState } from "react";
import {
  calculateInstallments,
  fetchRecurringTransactions,
  sumRecurringByNature,
  fetchDimensions,
  updateRecurringApi,
  createRecurringApi,
} from "@/api/recurring";
import { RecurringSummary } from "./components/RecurringSummary";
import type { Dimension, Recurring, RecurringCreateRequest } from "@/types/recurring";
import { toast } from "@/hooks/use-toast";

export default function Recurring() {
  const [recurring, setRecurring] = useState<Recurring[]>([]);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmOpenSoft, setConfirmOpenSoft] = useState(false);
  const [confirmPaymentOpen, setConfirmPaymentOpen] = useState(false);
  const [selectedRecurring, setSelectedRecurring] = useState<Recurring | null>(null);
  const [open, setOpen] = useState(false);
  const [totalFixesPay, setTotalFixesPay] = useState(0);
  const [totalFixesReceivable, setTotalFixesReceivable] = useState(0);

  const new_recurring_default: RecurringCreateRequest = {
    class_id: 0,
    value: 0,
    description: "",
    frequency: "",
    validity: null,
    status: true,
  };

  const [newRecurring, setNewRecurring] =
    useState<RecurringCreateRequest>(new_recurring_default);

  const [isEditing, setIsEditing] = useState(false);
  const [dimensions, setDimensions] = useState<Dimension[]>([]);
  const [selectedParcel, setSelectedParcel] = useState<{
    transactionId: string;
    installmentNumber: number;
  } | null>(null);

  const reloadRecurring = async () => {
    try {
      const data = await fetchRecurringTransactions();
      const withInstallments = data.map((rec) => ({
        ...rec,
        installments: calculateInstallments(rec.created_at, rec.validity),
      }));

      setRecurring(withInstallments);

      const summary = await sumRecurringByNature();
      setTotalFixesPay(summary.totalFixesPay);
      setTotalFixesReceivable(summary.totalFixesReceivable);
    } catch (err) {
      console.error("Erro ao buscar recorrências:", err);
    }
  };

  const fetchAndSetDimensions = async () => {
    try {
      const dims = await fetchDimensions();
      setDimensions(dims);
    } catch (err) {
      console.error("Erro ao buscar dimensões:", err);
    }
  };

  useEffect(() => {
    reloadRecurring();
    fetchAndSetDimensions();
  }, []);

  async function editRecurring() {
    if (!selectedRecurring) return;

    try {
      await updateRecurringApi(selectedRecurring.id, newRecurring);
      toast({
        title: "Sucesso",
        description: "Recorrência atualizada com sucesso!",
        duration: 2000,
      });

      reloadRecurring();
      setOpen(false);
      setIsEditing(false);
      setSelectedRecurring(null);
    } catch (error) {
      toast({
        title: "Erro",
        description: `Falha ao editar recorrência: ${error}`,
        variant: "destructive",
        duration: 2000,
      });
    }
  }

  function handleEdit(recurring: Recurring) {
    setSelectedRecurring(recurring);
    setNewRecurring({
      class_id: recurring.class.id,
      value: recurring.value,
      description: recurring.description,
      frequency: recurring.frequency,
      validity: recurring.validity,
      status: true,
    });
    setIsEditing(true);
    setOpen(true);
  }

  async function handleCreateRecurring() {
    try {
      await createRecurringApi(newRecurring);
      toast({
        title: "Sucesso",
        description: "Recorrência adicionada com sucesso!",
        duration: 2000,
      });

      reloadRecurring();
      setOpen(false);
      setNewRecurring(new_recurring_default);
    } catch (error) {
      toast({
        title: "Erro",
        description: `Falha ao adicionar recorrência: ${error}`,
        variant: "destructive",
        duration: 2000,
      });
    }
  }

  function handleCloseForm() {
    setOpen(false);
    setIsEditing(false);
    setSelectedRecurring(null);
    setNewRecurring(new_recurring_default);
  }

  return (
    <main className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6 overflow-x-hidden">
      <section className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="min-w-0">
          <h1 className="text-2xl font-bold tracking-tight">Recorrências</h1>
          <p className="text-sm text-muted-foreground">
            Gerencie receitas e despesas fixas do seu planejamento financeiro.
          </p>
        </div>
      </section>

      <RecurringSummary
        totalFixesReceivable={totalFixesReceivable}
        totalFixesPay={totalFixesPay}
      />

      <section>
        <RecurringFormDialog
          open={open}
          setOpen={setOpen}
          newRecurring={newRecurring}
          setNewRecurring={setNewRecurring}
          createRecurring={isEditing ? editRecurring : handleCreateRecurring}
          isEditing={isEditing}
          onClose={handleCloseForm}
          dimensions={dimensions}
        />
      </section>

      <section className="w-full min-w-0 overflow-x-auto rounded-xl border">
        <RecurringTable
          recurring={recurring}
          confirmOpen={confirmOpen}
          setConfirmOpen={setConfirmOpen}
          confirmOpenSoft={confirmOpenSoft}
          setConfirmOpenSoft={setConfirmOpenSoft}
          confirmPaymentOpen={confirmPaymentOpen}
          setConfirmPaymentOpen={setConfirmPaymentOpen}
          selectedRecurring={selectedRecurring}
          setSelectedRecurring={setSelectedRecurring}
          selectedParcel={selectedParcel}
          setSelectedParcel={setSelectedParcel}
          reloadRecurring={reloadRecurring}
          handleEditRecurring={handleEdit}
        />
      </section>
    </main>
  );
}
