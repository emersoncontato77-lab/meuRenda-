import { Transaction, Goal } from './types';

// Format currency
export const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
};

// Filter transactions by date range
export const filterTransactions = (
  transactions: Transaction[],
  startDate: Date,
  endDate: Date
) => {
  return transactions.filter((t) => {
    const d = new Date(t.date);
    // Para garantir comparação correta, usamos timestamps ajustando start para 00:00 e end para 23:59
    const target = d.getTime();
    const start = new Date(startDate);
    start.setHours(0, 0, 0, 0);
    const end = new Date(endDate);
    end.setHours(23, 59, 59, 999);
    
    // Comparação usando timestamps para evitar problemas de fuso horário simples
    return target >= start.getTime() && target <= end.getTime();
  });
};

// Get start/end of current month
export const getCurrentMonthRange = () => {
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth(), 1);
  const end = new Date(now.getFullYear(), now.getMonth() + 1, 0);
  return { start, end };
};

// Get start/end of current week (Calendar Week)
export const getCurrentWeekRange = () => {
  const curr = new Date();
  const first = curr.getDate() - curr.getDay(); 
  const last = first + 6; 

  const start = new Date(curr.setDate(first));
  const end = new Date(curr.setDate(last));
  return { start, end };
};

// Get range for Last 7 Days (Rolling week)
export const getLast7DaysRange = () => {
  const end = new Date(); // Hoje
  const start = new Date();
  start.setDate(end.getDate() - 6); // 6 dias atrás + hoje = 7 dias
  return { start, end };
};

// Calculate totals
export const calculateTotals = (transactions: Transaction[]) => {
  const income = transactions
    .filter((t) => t.type === 'INCOME')
    .reduce((acc, curr) => acc + curr.amount, 0);
  
  const expenses = transactions
    .filter((t) => t.type === 'EXPENSE')
    .reduce((acc, curr) => acc + curr.amount, 0);
  
  const investments = transactions
    .filter((t) => t.type === 'INVESTMENT')
    .reduce((acc, curr) => acc + curr.amount, 0);

  const netProfit = income - expenses - investments;

  return { income, expenses, investments, netProfit };
};

// --- FUNÇÕES PARA GRÁFICOS ---

export const groupTransactionsByDate = (transactions: Transaction[], startDate: Date, endDate: Date) => {
  const days: Record<string, { date: string; fullDate: string; income: number; expense: number; investment: number; profit: number }> = {};
  
  // 1. Inicializar todos os dias no range com zero
  // Clonar data para não alterar a referência original
  const current = new Date(startDate);
  const end = new Date(endDate);
  // Normalizar horas para loop
  current.setHours(0,0,0,0);
  end.setHours(23,59,59,999);

  while (current <= end) {
    const isoDate = current.toISOString().split('T')[0];
    const displayDate = current.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
    
    days[isoDate] = { 
      date: displayDate, 
      fullDate: isoDate,
      income: 0, 
      expense: 0, 
      investment: 0,
      profit: 0 
    };
    current.setDate(current.getDate() + 1);
  }

  // 2. Somar valores
  transactions.forEach(t => {
    // A data da transação já vem como YYYY-MM-DD string, então é compatível com a chave
    const isoDate = t.date; 
    
    // Só processa se estiver dentro do range (o filtro externo já deve ter cuidado disso, mas é uma segurança)
    if (days[isoDate]) {
      if (t.type === 'INCOME') {
        days[isoDate].income += t.amount;
        days[isoDate].profit += t.amount;
      } else if (t.type === 'EXPENSE') {
        days[isoDate].expense += t.amount;
        days[isoDate].profit -= t.amount;
      } else if (t.type === 'INVESTMENT') {
        days[isoDate].investment += t.amount;
        days[isoDate].profit -= t.amount; // Investimento sai do caixa (fluxo), mas tecnicamente é ativo. Para fluxo de caixa líquido, subtraímos.
      }
    }
  });

  return Object.values(days);
};

export const groupExpensesByCategory = (transactions: Transaction[]) => {
  const categories: Record<string, number> = {};
  let totalExpenses = 0;

  transactions.filter(t => t.type === 'EXPENSE').forEach(t => {
    const cat = t.category || 'Outros';
    categories[cat] = (categories[cat] || 0) + t.amount;
    totalExpenses += t.amount;
  });

  return Object.entries(categories)
    .map(([name, value]) => ({
      name,
      value,
      percent: totalExpenses > 0 ? (value / totalExpenses) * 100 : 0
    }))
    .sort((a, b) => b.value - a.value); // Order by highest value
};