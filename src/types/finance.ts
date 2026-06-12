export interface Nature {
  id: number;
  name: string;
}

export interface Type {
  id: number;
  name: string;
  nature: Nature;
  hex_color: string | null;
  lucide_icon: string | null;
}

export interface Class {
  id: number;
  name: string;
  type: Type;
}

export interface Transaction {
  id: number;
  value: number;
  description: string;
  transaction_at: string;
  class: Class;
}
export interface Dimension {
  id: number;
  name: string;
  types: {
    id: number;
    name: string;
    classes: {
      id: number;
      name: string;
    }[];
  }[];

}

// QueryTypes

// Type

export interface TypeCreateRequest {
  name: string;
  nature_id: number;
  hex_color?: string | null;
  lucide_icon?: string | null;
  order?: number;
}

export interface TypeUpdateRequest extends Partial<TypeCreateRequest> {
  id: number;
}

// Transaction

export interface TransactionCreateRequest {
  value: number
  class_id: number;
  description: string;
  transaction_at: string;
}

// Class

export interface ClassCreateRequest {
  name: string;
  type_id: number;
}

export interface ClassUpdateRequest extends Partial<ClassCreateRequest> {
  id: number;
}

// Budget
export interface MonthlyBudget {
  id: number;
  user_id: number;
  type_id: number;
  class_id: number | null;
  budget_month: string;
  planned_value: number;
  created_at: string;
}

export interface MonthlyBudgetCreateRequest {
  type_id: number | null;
  class_id: number | null;
  budget_month: string;
  planned_value: number;
}

export interface MonthlyBudgetUpdateRequest {
  id: number;
  type_id?: number | null;
  class_id?: number | null;
  budget_month?: string;
  planned_value?: number;
}

export interface MonthlyBudgetSummary {
  id: number;
  type_id: number;
  type_name: string;
  class_id: number | null;
  class_name: string | null;
  nature_name: string;
  expense_value: number;
  income_value: number;
  budget_month: string;
  planned_value: number;
  spent_value: number;
  remaining_value: number;
  percentage_used: number;
    status: 'OK' | 'ATENÇÃO' | 'CRÍTICO' | 'ESTOUROU';
}

export interface MonthlyBudgetSuggestion {
  type_id: number;
  type_name: string;
  class_id: number | null;
  class_name: string | null;
  suggested_value: number;
  average_spent: number;
}

export interface ValueByNatureYearMonth {
  year: number;
  month: number;
  receita_total: number;
  despesa_total: number;
}