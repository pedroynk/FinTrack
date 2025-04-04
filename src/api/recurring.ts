import { supabase } from "@/lib/supabase";
import { RecurringCreateRequest, Type } from "@/types/recurring";


export interface RecurringTransaction {
  id: string;
  value: number;
  description: string;
  frequency: string;
  validity: string | null;
  created_at: string;
  paid_parcels: number[];
  class: {
    id: string;
    name: string;
    type: {
      name: string;
      hex_color: string;
      lucide_icon: string;
      nature?: {
        name: string;
      };
    };
  };
}


export async function fetchTypes(): Promise<Type[]> {
  const { data, error } = await supabase
    .from('type')
    .select(`
      *,
      nature:nature_id(name)
    `)

  if (error) throw new Error(error.message);

  return data || []
}

export async function fetchRecurringTransactions(
  startDateTZString: string | null = null,
  endDateTZString: string | null = null
): Promise<RecurringTransaction[]> {
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

export async function createRecurringApi(newRecurring: RecurringCreateRequest) {
  const { error } = await supabase.from("recurring_transaction").insert([newRecurring]);
  if (error) throw error;
}

export async function updateRecurringApi(id: string, data: RecurringCreateRequest) {
  const payload = {
    class_id: data.class_id,
    value: data.value,
    description: data.description,
    frequency: data.frequency,
    validity: data.validity,
    status: data.status,
  };

  return supabase
    .from("recurring_transaction")
    .update(payload)
    .eq("id", id)
    .select(); // opcional: para retornar a linha atualizada
}


  export async function softDeleteRecurring(id: string) {

    const { error } = await supabase
      .from("recurring_transaction")
      .update({ status: 0 })
      .eq("id", id);
      if (error) throw error;

    }

  export async function deleteRecurringApi(recurringId: number) {
    const { error } = await supabase
      .from("recurring_transaction")
      .delete()
      .match({ id: recurringId });
    if (error) throw error;
  }

  export async function calculateInstallments(createdAt: string, validity: string | null) {
    if (!validity) return "Essa recorrência não é um parcelamento";

    const createdDate = new Date(createdAt);
    const validityDate = new Date(validity);

    let installments = [];
    let currentDate = new Date(createdDate);

    while (currentDate <= validityDate) {
      const month = currentDate.toLocaleString("pt-BR", { month: "long" });
      const year = currentDate.getFullYear();
      installments.push({ label: `${month.charAt(0).toUpperCase() + month.slice(1)}/${year}`, number: installments.length + 1 });

      currentDate.setMonth(currentDate.getMonth() + 1);
    }

    return installments;
  }

  export async function toggleParcelPayment(
    transactionId: string,
    installmentNumber: number,
    currentPaidParcels: number[],
    setRecurring: React.Dispatch<React.SetStateAction<any[]>>
  ) {
    const updatedParcels = currentPaidParcels.includes(installmentNumber)
      ? currentPaidParcels.filter(p => p !== installmentNumber) // Se já está paga, remover
      : [...currentPaidParcels, installmentNumber]; // Se não está paga, adicionar
  
    setRecurring(prevTransactions =>
      prevTransactions.map(transaction =>
        transaction.id === transactionId ? { ...transaction, paid_parcels: updatedParcels } : transaction
      )
    );
  
    const { error } = await supabase
      .from("recurring_transaction")
      .update({ paid_parcels: updatedParcels })
      .eq("id", transactionId);
  
    if (error) {
      console.error("Erro ao atualizar parcelas pagas:", error);
  
      setRecurring(prevTransactions =>
        prevTransactions.map(transaction =>
          transaction.id === transactionId ? { ...transaction, paid_parcels: currentPaidParcels } : transaction
        )
      );
    } else {
      if (!currentPaidParcels.includes(installmentNumber)) {
        await registerTransaction(transactionId, installmentNumber);
      }
    }
  }

  async function registerTransaction(transactionId: string, installmentNumber: number) {
    const utc3Date = new Date()
    .toISOString()
    .slice(0, 10)

    const { data: recurring, error: fetchError } = await supabase
      .from("recurring_transaction")
      .select("class_id, description, value")
      .eq("id", transactionId)
      .single();

    if (fetchError || !recurring) {
      console.error("Erro ao buscar a transação recorrente:", fetchError?.message || fetchError);
      return;
    }

    const newTransaction = {
      class_id: recurring.class_id,
      description: recurring.description,
      value: recurring.value,
      transaction_at: utc3Date,
    };

    console.log("Registrando nova transação:", newTransaction);

    const { error: insertError } = await supabase.from("transaction").insert([newTransaction]);

    if (insertError) {
      console.error("Erro ao registrar transação:", insertError.message || insertError);
    } else {
      console.log(`Parcela ${installmentNumber} registrada com sucesso!`);
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
      `)
  
    if (error) {
      throw new Error(error.message);
    }
  
    return data; 
  }