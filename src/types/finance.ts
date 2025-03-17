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
