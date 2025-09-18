import { supabase } from "@/lib/supabase";
import { Class, ClassCreateRequest, ClassUpdateRequest, Nature, Transaction, TransactionCreateRequest, Type, TypeCreateRequest, TypeUpdateRequest } from "@/types/finance";

export async function fetchNatures(): Promise<Nature[]> {
  const { data, error } = await supabase
    .from("nature")
    .select("id, name");
  if (error) throw new Error(error.message);
  return data || [];
}

// Type

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

export async function createTypeApi(newType: TypeCreateRequest): Promise<void> {
  if (!newType.order) {
    const { data, error: fetchError } = await supabase
      .from('type')
      .select('order')
      .order('order', { ascending: false })
      .limit(1);

    if (fetchError) throw fetchError;

    const lastOrder = data && data.length > 0 ? data[0].order : 0;
    newType.order = lastOrder + 1;
  }
  
  const { error } = await supabase
    .from('type')
    .insert([newType])

  if (error) throw error;
}

export async function updateTypeApi(updateData: TypeUpdateRequest): Promise<void>{
  const { id, ...updateFields } = updateData;

  const { error } = await supabase
    .from('type')
    .update(updateFields)
    .eq('id', id)

  if (error) throw error;
}

export async function deleteTypeApi(typeId: number): Promise<void> {
  const { error } = await supabase
    .from("type")
    .delete()
    .match({ id: typeId });
  if (error) throw error;
}

// Class

export async function fetchClasses(): Promise<Class[]> {
  const { data, error } = await supabase
    .from("class")
    .select(`
      *,
      type:type_id(name, nature:nature_id(name))
    `)

  if (error) throw new Error(error.message);

  return data || [];
}


export async function createClassApi(newClass: ClassCreateRequest): Promise<void> {  
  const { error } = await supabase
    .from('class')
    .insert([newClass])

  if (error) throw error;
}

export async function updateClassApi(updateData: ClassUpdateRequest): Promise<void>{
  const { id, ...updateFields } = updateData;
  
  const { error } = await supabase
    .from('class')
    .update(updateFields)
    .eq('id', id)

  if (error) throw error;
}
export async function deleteClassApi(classId: number): Promise<void> {
  const { error } = await supabase
    .from("class")
    .delete()
    .match({ id: classId });
  if (error) throw error;
}

// Nature

export async function deleteNatureApi(natureId: number): Promise<void> {
  const { error } = await supabase
    .from("nature")
    .delete()
    .match({ id: natureId });
  if (error) throw error;
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

export async function fetchTransactions(
  page: number = 1,
  pageSize: number = 10,
  startDateTZString: string | null = null,
  endDateTZString: string | null = null
): Promise<Transaction[]> {
  let query = supabase
    .from("transaction")
    .select(
      "*, class:class_id(id, name, type:type_id(name, hex_color, lucide_icon, nature:nature_id(name)))"
    )
    .order("id", { ascending: false })
    .range((page - 1) * pageSize, page * pageSize - 1);

  // Apply date filters only if provided
  if (startDateTZString) {
    query = query.gte("transaction_at", startDateTZString);
  }
  if (endDateTZString) {
    query = query.lte("transaction_at", endDateTZString);
  }

  const { data, error } = await query;

  if (error) {
    throw error;
  }
  
  return data || [];
}

export async function createTransactionApi(newTransaction: TransactionCreateRequest) {
  const { error } = await supabase.from("transaction").insert([newTransaction]);
  if (error) throw error;
}

export async function deleteTransactionApi(transactionId: number) {
  const { error } = await supabase
    .from("transaction")
    .delete()
    .match({ id: transactionId });
  if (error) throw error;
}

export async function updateTransactionApi(
  transactionId: string,
  updatedTransaction: TransactionCreateRequest
) {
  const transactionPayload = {
    ...updatedTransaction,
    value:
      typeof updatedTransaction.value === "string"
        ? parseFloat(updatedTransaction.value)
        : updatedTransaction.value,
  };

  const { error } = await supabase
    .from("transaction")
    .update(transactionPayload)
    .match({ id: transactionId });

  if (error) {
    throw error;
  }
}