export type TransactionType = 'INCOME' | 'EXPENSE' | 'INVESTMENT';

export interface Transaction {
  id: string;
  date: string; // ISO string YYYY-MM-DD
  amount: number;
  type: TransactionType;
  category?: string; // For expenses
  description?: string; // Observation/Description
}

export type GoalType = 'MONTHLY' | 'WEEKLY';

export interface Goal {
  id: string;
  type: GoalType;
  targetValue: number;
  workDays: number; // Calculated automatically now, but kept for cache
  selectedWeekDays?: number[]; // 0 = Sunday, 1 = Monday, etc.
  startDate: string;
  endDate: string;
  isActive: boolean;
}

export interface AppState {
  transactions: Transaction[];
  goals: Goal[];
  addTransaction: (t: Omit<Transaction, 'id'>) => void;
  deleteTransaction: (id: string) => void;
  updateGoal: (g: Goal) => void;
  setActiveGoal: (id: string) => void;
}

export const EXPENSE_CATEGORIES = [
  'Alimentação',
  'Gasolina',
  'Transporte',
  'Material',
  'Outros'
];

export type ViewState = 
  | 'dashboard' 
  | 'new-sale' 
  | 'new-expense' 
  | 'new-investment' 
  | 'category-expenses'
  | 'goals' 
  | 'reports'
  | 'pricing';