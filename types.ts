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
  targetValue: number; // Meta de Lucro Líquido
  workDays: number; // Calculado automaticamente
  selectedWeekDays: number[]; // 0 = Domingo, 1 = Segunda...
  startDate: string;
  endDate: string;
  isActive: boolean;
  // Novos campos para controle de margem
  marginMode: 'AUTO' | 'MANUAL'; 
  manualMarginValue?: number;
}

export interface AppState {
  transactions: Transaction[];
  goals: Goal[];
  addTransaction: (t: Omit<Transaction, 'id'>) => void;
  deleteTransaction: (id: string) => void;
  updateGoal: (g: Goal) => void;
  deleteGoal: (id: string) => void; // Nova função
  setActiveGoal: (id: string) => void;
  // New Management Functions
  clearTransactionsByType: (type: TransactionType) => void;
  clearGoals: () => void;
  resetApp: () => void;
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
  | 'pricing'
  | 'settings';