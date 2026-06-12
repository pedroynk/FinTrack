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

export interface Installment {
  label: string;
  number: number;
}

export type Installments = Installment[] | string;

export interface Recurring {
  id: string;
  class: Class;
  value: number;
  description: string;
  frequency: string;
  validity: string | null;
  status: boolean;
  created_at: string;
  paid_parcels: number[];
  installments?: Installments;
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
  id: string;
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