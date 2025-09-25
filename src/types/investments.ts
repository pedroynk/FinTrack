// Tipos crus que vêm da API (sem usar "any")
export interface RawInvestment {
  name?: string;
  description?: string;
  ticker?: string;
  updatedValue?: number;
  updated?: number;
  total?: number;
  income_name?: string;
  incomeName?: string;
  income?: { name?: string };
  [k: string]: unknown;
}

// Tabela "geral" — este É o shape que o InvestmentTables usa
export interface InvestmentGeral {
  name: string;           // <— obrigatório pro InvestmentTables
  description: string;
  updatedValue: number;
  income_name: string;
  [k: string]: unknown;
}

// Movimentações — shape que o InvestmentTables usa
export interface MovementRow {
  date: string;
  value: number;
  movement: string;
  description: string;
}

// Pie / Donut
export interface DistributionSlice {
  name: string;
  value: number;
  fill?: string;
}

// Charts (mantém exatamente o que o InvestmentCharts espera)
export interface TopInvestmentDTO {
  description: string;
  totalRentability: number;
}
export interface RentabilityDTO {
  month: string;
  totalRentability: number;
}
export interface IncomePoint {
  name: string;
  value: number;
}

// Resumo
export interface InvestmentSummaryResponse {
  investments: RawInvestment[]; // <— agora tipado, sem unknown[]
  invested: number;
  updated: number;
  gain: number;
}
