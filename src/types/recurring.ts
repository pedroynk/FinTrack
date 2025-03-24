export interface Recurring {
  id: number;
  class: Class;
  value: number;
  description: string;
  frequency: string;
  validity: string | null;
  status: boolean;
  paid_parcels: JSON;
}

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

// QueryTypes

// Recurring

export interface RecurringCreateRequest {
  class_id: number;
  value: number;
  description: string;
  frequency: string;
  validity: string | null;
  status: boolean;
}

export interface RecurringUpdateRequest extends Partial<RecurringCreateRequest> {
  id: number;
}

// Transaction

export interface TransactionCreateRequest {
  value: number
  class_id: number;
  description: string;
  transaction_at: string;
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