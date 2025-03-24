import { RecurringFormDialog } from "@/pages/admin/finance/components/RecurringFormDialog";
import { RecurringTable } from "@/pages/admin/finance/components/RecurringTable";
import { useEffect, useState } from "react";
import { calculateInstallments, fetchRecurringTransactions, RecurringTransaction, sumRecurringByNature, fetchDimensions, updateRecurringApi, createRecurringApi } from "@/api/recurring";
import { RecurringSummary } from "./components/RecurringSummary";
import type { Dimension, Recurring, RecurringCreateRequest } from "@/types/recurring";
import { toast } from "@/hooks/use-toast";

export default function Recurring() {
  const [recurring, setRecurring] = useState<RecurringTransaction[]>([]);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmOpenSoft, setConfirmOpenSoft] = useState(false);
  const [confirmPaymentOpen, setConfirmPaymentOpen] = useState(false);
  const [selectedRecurring, setSelectedRecurring] = useState<any | null>(null);
  const [open, setOpen] = useState(false);
  const [totalFixesPay, setTotalFixesPay] = useState(0);
  const [totalFixesReceivable, setTotalFixesReceivable] = useState(0);

  const new_recurring_default = {
    class_id: 0,
    value: 0,
    description: "",
    frequency: "",
    validity: null,
    status: true,
  }

  const [newRecurring, setNewRecurring] = useState<RecurringCreateRequest>(new_recurring_default);

  const [isEditing, setIsEditing] = useState(false);

  const [dimensions, setDimensions] = useState<Dimension[]>([]);
  const [selectedParcel, setSelectedParcel] = useState<{ transactionId: string; installmentNumber: number } | null>(null);

  const reloadRecurring = async () => {
    try {
      const data = await fetchRecurringTransactions();
      const withInstallments = await Promise.all(
        data.map(async (rec) => ({
          ...rec,
          installments: await calculateInstallments(rec.created_at, rec.validity),
        }))
      );
      setRecurring(withInstallments);

      const summary = await sumRecurringByNature();
      setTotalFixesPay(summary.totalFixesPay);
      setTotalFixesReceivable(summary.totalFixesReceivable);
    } catch (err) {
      console.error("Erro ao buscar recorrências:", err);
    }
  };

  useEffect(() => {
    reloadRecurring();
    fetchAndSetDimensions();
  }, []);

  const fetchAndSetDimensions = async () => {
    try {
      const dims = await fetchDimensions();
      setDimensions(dims);
    } catch (err) {
      console.error("Erro ao buscar dimensões:", err);
    }
  };

  async function editRecurring() {
    if (!selectedRecurring) return;
    try {
      await updateRecurringApi(selectedRecurring.id, newRecurring); // 👈 passa os dois!
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
        description: `Falha ao editar Recorrência: ${error}`,
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
      reloadRecurring()
      setOpen(false);
      setNewRecurring(new_recurring_default)
    } catch (error) {
      toast({
        title: "Erro",
        description: `Falha ao adicionar Recorrência: ${error}`,
        variant: "destructive",
        duration: 2000,
      });
    }
  }

  return (
    <div className="p-6 space-y-6">
      <RecurringSummary
        totalFixesReceivable={totalFixesReceivable}
        totalFixesPay={totalFixesPay}
      />
      <RecurringFormDialog
        open={open}
        setOpen={setOpen}
        newRecurring={newRecurring}
        setNewRecurring={setNewRecurring}
        createRecurring={isEditing ? editRecurring : handleCreateRecurring}
        isEditing={isEditing}
        onClose={() => setOpen(false)}
        dimensions={dimensions}
      />
      <RecurringTable
        recurring={recurring}
        setRecurring={setRecurring}
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
    </div>
  );
}
