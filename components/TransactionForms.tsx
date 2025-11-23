import React, { useState, useMemo } from 'react';
import { ArrowLeft, Save, Tag } from 'lucide-react';
import { useApp } from '../context';
import { Button, Input, Select, Header, Card } from './Shared';
import { EXPENSE_CATEGORIES, TransactionType } from '../types';

interface FormProps {
  type: TransactionType;
  onBack: () => void;
  title: string;
}

const TransactionForm: React.FC<FormProps> = ({ type, onBack, title }) => {
  const { addTransaction } = useApp();
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState(EXPENSE_CATEGORIES[0]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || !date) return;

    addTransaction({
      type,
      amount: parseFloat(amount),
      date,
      description,
      category: type === 'EXPENSE' ? category : undefined,
    });
    onBack();
  };

  return (
    <div className="max-w-2xl mx-auto animate-fade-in">
      <button onClick={onBack} className="flex items-center text-graySub hover:text-white mb-6 transition-colors">
        <ArrowLeft className="w-5 h-5 mr-2" /> Voltar
      </button>

      <Header title={title} subtitle="Preencha os detalhes abaixo" />

      <Card>
        <form onSubmit={handleSubmit}>
          <Input
            label="Data"
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            required
          />

          <Input
            label="Valor (R$)"
            type="number"
            step="0.01"
            placeholder="0,00"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            required
          />

          {type === 'EXPENSE' && (
            <Select
              label="Categoria"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            >
              {EXPENSE_CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </Select>
          )}

          <Input
            label={type === 'INVESTMENT' ? 'Descrição / Ativo' : 'Observação (Opcional)'}
            type="text"
            placeholder={type === 'INVESTMENT' ? 'Ex: CDB Banco X' : 'Detalhes adicionais...'}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />

          <div className="mt-8">
            <Button type="submit" className="w-full justify-center">
              <Save className="w-5 h-5" /> Salvar Registro
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
};

export const ExpenseByCategory: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const { transactions } = useApp();
  
  const expensesByCategory = useMemo(() => {
    const expenses = transactions.filter(t => t.type === 'EXPENSE');
    const grouped: Record<string, number> = {};
    
    expenses.forEach(t => {
      const cat = t.category || 'Outros';
      grouped[cat] = (grouped[cat] || 0) + t.amount;
    });
    
    return Object.entries(grouped).sort((a, b) => b[1] - a[1]);
  }, [transactions]);

  return (
    <div className="max-w-2xl mx-auto animate-fade-in">
       <button onClick={onBack} className="flex items-center text-graySub hover:text-white mb-6 transition-colors">
        <ArrowLeft className="w-5 h-5 mr-2" /> Voltar
      </button>
      <Header title="Gastos por Categoria" icon={Tag} />
      
      <div className="space-y-4">
        {expensesByCategory.map(([cat, total]) => (
          <Card key={cat} className="flex justify-between items-center">
            <span className="text-lg font-medium text-white">{cat}</span>
            <span className="text-xl font-bold text-red-400">
               {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(total)}
            </span>
          </Card>
        ))}
        {expensesByCategory.length === 0 && (
          <p className="text-graySub text-center">Nenhum gasto registrado ainda.</p>
        )}
      </div>
    </div>
  )
}

export default TransactionForm;