import React, { createContext, useContext, useEffect, useState } from 'react';
import { AppState, Transaction, Goal, TransactionType } from './types';

const AppContext = createContext<AppState | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [goals, setGoals] = useState<Goal[]>([]);

  // Load from LocalStorage on mount
  useEffect(() => {
    const savedTx = localStorage.getItem('meurenda_transactions');
    const savedGoals = localStorage.getItem('meurenda_goals');
    if (savedTx) setTransactions(JSON.parse(savedTx));
    if (savedGoals) setGoals(JSON.parse(savedGoals));
  }, []);

  // Save to LocalStorage on change
  useEffect(() => {
    localStorage.setItem('meurenda_transactions', JSON.stringify(transactions));
  }, [transactions]);

  useEffect(() => {
    localStorage.setItem('meurenda_goals', JSON.stringify(goals));
  }, [goals]);

  const addTransaction = (t: Omit<Transaction, 'id'>) => {
    const newTx: Transaction = { ...t, id: crypto.randomUUID() };
    setTransactions((prev) => [...prev, newTx]);
  };

  const deleteTransaction = (id: string) => {
    setTransactions((prev) => prev.filter((t) => t.id !== id));
  };

  const updateGoal = (g: Goal) => {
    setGoals((prev) => {
      const exists = prev.find((item) => item.id === g.id);
      if (exists) {
        return prev.map((item) => (item.id === g.id ? g : item));
      }
      return [...prev, g];
    });
  };

  const deleteGoal = (id: string) => {
    setGoals((prev) => prev.filter((g) => g.id !== id));
  };

  const setActiveGoal = (id: string) => {
    setGoals((prev) =>
      prev.map((g) => ({
        ...g,
        isActive: g.id === id,
      }))
    );
  };

  // --- Data Management Functions ---

  const clearTransactionsByType = (type: TransactionType) => {
    setTransactions((prev) => prev.filter((t) => t.type !== type));
  };

  const clearGoals = () => {
    setGoals([]);
  };

  const resetApp = () => {
    setTransactions([]);
    setGoals([]);
  };

  return (
    <AppContext.Provider
      value={{
        transactions,
        goals,
        addTransaction,
        deleteTransaction,
        updateGoal,
        deleteGoal,
        setActiveGoal,
        clearTransactionsByType,
        clearGoals,
        resetApp
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within AppProvider');
  return context;
};