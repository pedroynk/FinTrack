import { supabase } from "@/lib/supabase";
import {
  Installment,
  Installments,
  Recurring,
  RecurringCreateRequest,
  Type,
} from "@/types/recurring";

export async function fetchTypes(): Promise<Type[]> {
  const { data, error } = await supabase
    .from("type")
    .select(`
      *,
      nature:nature_id(name)
    `);

  if (error) throw new Error(error.message);

  return data || [];
}

export async function fetchRecurringTransactions(
  startDateTZString: string | null = null,
  endDateTZString: string | null = null
): Promise<Recurring[]> {
  let query = supabase
    .from("recurring_transaction")
    .select(
      "*, class:class_id(id, name, type:type_id(name, hex_color, lucide_icon, nature:nature_id(name)))"
    )
    .neq("status", "FALSE")
    .order("id", { ascending: false })

  if (startDateTZString) {
    query = query.gte("created_at", startDateTZString);
  }
  if (endDateTZString) {
    query = query.lte("created_at", endDateTZString);
  }

  const { data, error } = await query;

  if (error) throw error;
  return data || [];
}

export async function createRecurringApi(
  newRecurring: RecurringCreateRequest
): Promise<void> {
  const { error } = await supabase
    .from("recurring_transaction")
    .insert([newRecurring]);

  if (error) throw error;
}

export async function updateRecurringApi(
  id: string,
  data: RecurringCreateRequest
): Promise<void> {
  const payload = {
    class_id: data.class_id,
    value: data.value,
    description: data.description,
    frequency: data.frequency,
    validity: data.validity,
    status: data.status,
  };

  const { error } = await supabase
    .from("recurring_transaction")
    .update(payload)
    .eq("id", id);

  if (error) throw error;
}

export async function softDeleteRecurring(id: string): Promise<void> {
  const { error } = await supabase
    .from("recurring_transaction")
    .update({ status: 0 })
    .eq("id", id);

  if (error) throw error;
}

export async function deleteRecurringApi(recurringId: string): Promise<void> {
  const { error } = await supabase
    .from("recurring_transaction")
    .delete()
    .match({ id: recurringId });

  if (error) throw error;
}

export function calculateInstallments(
  createdAt: string,
  validity: string | null
): Installments {
  if (!validity) return "Essa recorrência não é um parcelamento";

  const createdDate = new Date(createdAt);
  const validityDate = new Date(validity);
  const installments: Installment[] = [];
  const currentDate = new Date(createdDate);

  while (currentDate <= validityDate) {
    const month = currentDate.toLocaleString("pt-BR", { month: "long" });
    const year = currentDate.getFullYear();

    installments.push({
      label: `${month.charAt(0).toUpperCase() + month.slice(1)}/${year}`,
      number: installments.length + 1,
    });

    currentDate.setMonth(currentDate.getMonth() + 1);
  }

  return installments;
}

export async function updateRecurringParcelPayment(
  transactionId: string,
  installmentNumber: number,
  currentPaidParcels: number[]
): Promise<number[]> {
  const updatedParcels = currentPaidParcels.includes(installmentNumber)
    ? currentPaidParcels.filter((parcel) => parcel !== installmentNumber)
    : [...currentPaidParcels, installmentNumber];

  const { error } = await supabase
    .from("recurring_transaction")
    .update({ paid_parcels: updatedParcels })
    .eq("id", transactionId);

  if (error) throw error;

  if (!currentPaidParcels.includes(installmentNumber)) {
    await registerTransaction(transactionId);
  }

  return updatedParcels;
}

async function registerTransaction(transactionId: string): Promise<void> {
  const utc3Date = new Date()
    .toISOString()
    .slice(0, 10);

  const { data: recurring, error: fetchError } = await supabase
    .from("recurring_transaction")
    .select("class_id, description, value")
    .eq("id", transactionId)
    .single();

  if (fetchError || !recurring) {
    throw new Error(fetchError?.message || "Erro ao buscar a transação recorrente.");
  }

  const newTransaction = {
    class_id: recurring.class_id,
    description: recurring.description,
    value: recurring.value,
    transaction_at: utc3Date,
  };

  const { error: insertError } = await supabase
    .from("transaction")
    .insert([newTransaction]);

  if (insertError) {
    throw new Error(insertError.message);
  }
}

export async function sumRecurringByNature() {
  const { data, error } = await supabase
    .from("vw_recurring_transaction_with_nature")
    .select("*")
    .neq("status", false);

  if (error) throw error;

  let totalFixesPay = 0;
  let totalFixesReceivable = 0;

  for (const item of data ?? []) {
    if (item.nature_id === 2) {
      totalFixesPay += item.sum || 0;
    } else if (item.nature_id === 1) {
      totalFixesReceivable += item.sum || 0;
    }
  }

  return { totalFixesPay, totalFixesReceivable };
}

export async function fetchDimensions() {
  const { data, error } = await supabase
    .from("nature")
    .select(`
      id,
      name,
      types: type!nature_id (
        id,
        name,
        classes: class!type_id (
          id,
          name
        )
      )
    `);

  if (error) {
    throw new Error(error.message);
  }

  return data;
}