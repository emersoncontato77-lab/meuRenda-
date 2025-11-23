import React, { useState, useEffect, useMemo } from 'react';
import { Target, Calculator, CheckCircle, ArrowLeft, CalendarDays, BarChart3 } from 'lucide-react';
import { useApp } from '../context';
import { Button, Input, Select, Card, Header } from './Shared';
import { Goal, GoalType } from '../types';
import { calculateTotals, formatCurrency } from '../utils';

const WEEKDAYS = [
  { label: 'D', value: 0 }, // Domingo
  { label: 'S', value: 1 }, // Segunda
  { label: 'T', value: 2 }, // Terça
  { label: 'Q', value: 3 }, // Quarta
  { label: 'Q', value: 4 }, // Quinta
  { label: 'S', value: 5 }, // Sexta
  { label: 'S', value: 6 }, // Sábado
];

const Goals: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const { goals, updateGoal, setActiveGoal, transactions } = useApp();
  
  // Form State
  const [type, setType] = useState<GoalType>('MONTHLY');
  const [targetValue, setTargetValue] = useState<string>(''); // String to avoid leading zero bug
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState('');
  const [isActive, setIsActive] = useState(true);
  
  // New State for Days Selection (Default: Mon-Fri)
  const [selectedWeekDays, setSelectedWeekDays] = useState<number[]>([1, 2, 3, 4, 5]);

  // Derived State: Calculated Work Days based on Calendar
  const calculatedWorkDays = useMemo(() => {
    if (selectedWeekDays.length === 0) return 0;

    const start = new Date(startDate);
    // Adjust logic based on goal type
    if (type === 'WEEKLY') {
      // For weekly, we just count how many selected days exist in a standard week (simple count)
      // Or technically, how many selected days fall in the specific week of the start date.
      // Usually "Weekly Goal" implies a recurring standard week, so the count is just the length of array.
      return selectedWeekDays.length;
    } else {
      // Monthly: Count specific occurrences in the month of the startDate
      const year = start.getFullYear();
      const month = start.getMonth(); // 0-indexed
      const daysInMonth = new Date(year, month + 1, 0).getDate();
      
      let count = 0;
      for (let day = 1; day <= daysInMonth; day++) {
        const currentDayDate = new Date(year, month, day);
        if (selectedWeekDays.includes(currentDayDate.getDay())) {
          count++;
        }
      }
      return count;
    }
  }, [startDate, selectedWeekDays, type]);

  // Analysis State
  const [analysis, setAnalysis] = useState<{
    avgMargin: number;
    dailyProfitNeeded: number;
    dailyRevenueNeeded: number;
    totalDays: number;
  } | null>(null);

  const activeGoal = goals.find(g => g.isActive);

  // Toggle Day Selection
  const toggleDay = (dayIndex: number) => {
    setSelectedWeekDays(prev => 
      prev.includes(dayIndex) 
        ? prev.filter(d => d !== dayIndex) 
        : [...prev, dayIndex].sort()
    );
  };

  // Calculate Analysis based on Active Goal OR Current Form Data (Preview)
  useEffect(() => {
    const totals = calculateTotals(transactions);
    // Avoid division by zero. If income is 0, assume 0% margin yet.
    // Logic: Margin = NetProfit / Income
    const margin = totals.income > 0 ? (totals.netProfit / totals.income) : 0; 
    
    // Determine which values to use (Active Goal values vs Form Preview values)
    // Here we prioritize showing analysis for the *Form* being filled if user is interacting, 
    // otherwise show active goal.
    
    // Let's make the analysis card always reflect the FORM input if creating/editing, 
    // or the Active Goal if the form is empty.
    
    const targetNum = parseFloat(targetValue) || (activeGoal?.targetValue || 0);
    const daysNum = calculatedWorkDays > 0 ? calculatedWorkDays : (activeGoal?.workDays || 22);
    
    const dailyProfit = daysNum > 0 ? targetNum / daysNum : 0;
    const dailyRevenue = margin > 0 ? dailyProfit / margin : 0;

    setAnalysis({
      avgMargin: margin * 100,
      dailyProfitNeeded: dailyProfit,
      dailyRevenueNeeded: dailyRevenue,
      totalDays: daysNum
    });

  }, [targetValue, calculatedWorkDays, transactions, activeGoal]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (calculatedWorkDays === 0) {
      alert("Selecione pelo menos um dia da semana de trabalho.");
      return;
    }

    const newGoal: Goal = {
      id: crypto.randomUUID(),
      type,
      targetValue: parseFloat(targetValue),
      workDays: calculatedWorkDays, // Save the calculated value
      selectedWeekDays, // Save the pattern
      startDate,
      endDate,
      isActive
    };

    if (isActive) {
       goals.forEach(g => {
         if (g.isActive) updateGoal({ ...g, isActive: false });
       });
    }

    updateGoal(newGoal);
    setTargetValue('');
    alert('Meta definida com sucesso!');
  };

  return (
    <div className="animate-fade-in max-w-4xl mx-auto pb-20">
      <button onClick={onBack} className="flex items-center text-graySub hover:text-white mb-6 transition-colors">
        <ArrowLeft className="w-5 h-5 mr-2" /> Voltar
      </button>

      <Header title="Metas & Planejamento" subtitle="Automatize seus objetivos de lucro" icon={Target} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Form Section */}
        <Card>
            <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                <Calculator className="text-neonBlue" /> Nova Meta
            </h2>
            <form onSubmit={handleSubmit}>
                <Select label="Tipo de Meta" value={type} onChange={(e) => setType(e.target.value as GoalType)}>
                    <option value="MONTHLY">Lucro Mensal</option>
                    <option value="WEEKLY">Lucro Semanal</option>
                </Select>

                <Input 
                    label="Meta de Lucro Líquido (R$)" 
                    type="number" 
                    placeholder="0,00"
                    value={targetValue} 
                    onChange={(e) => setTargetValue(e.target.value)}
                    required
                    icon={<span className="text-neonGreen font-bold text-sm">R$</span>}
                />

                <div className="mb-6">
                  <label className="text-[10px] text-gray-500 font-bold uppercase tracking-wider ml-1 mb-2 block">
                    Dias de Trabalho ({type === 'MONTHLY' ? 'No Mês' : 'Na Semana'})
                  </label>
                  
                  {/* Day Selector */}
                  <div className="flex justify-between items-center bg-[#0D0D0D] p-2 rounded-2xl border border-white/10 mb-2">
                    {WEEKDAYS.map((day) => {
                      const isSelected = selectedWeekDays.includes(day.value);
                      return (
                        <button
                          key={day.value}
                          type="button"
                          onClick={() => toggleDay(day.value)}
                          className={`w-9 h-9 rounded-full text-xs font-bold transition-all duration-200 flex items-center justify-center ${
                            isSelected 
                              ? 'bg-neonBlue text-black shadow-[0_0_10px_rgba(0,191,255,0.4)] scale-110' 
                              : 'bg-[#1A1A1A] text-gray-600 hover:bg-white/5'
                          }`}
                        >
                          {day.label}
                        </button>
                      );
                    })}
                  </div>
                  
                  {/* Calculation Feedback */}
                  <div className="flex items-center gap-2 px-2">
                    <CalendarDays className="w-3 h-3 text-neonBlue" />
                    <p className="text-xs text-gray-400">
                      Total calculado: <span className="text-white font-bold">{calculatedWorkDays} dias</span> 
                      {type === 'MONTHLY' ? ' neste mês' : ' por semana'}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <Input 
                        label="Início do Período" 
                        type="date" 
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                        required
                    />
                     <div className="flex items-center gap-3 pt-4">
                         <input 
                            type="checkbox" 
                            id="active" 
                            checked={isActive} 
                            onChange={(e) => setIsActive(e.target.checked)}
                            className="w-5 h-5 accent-neonGreen rounded cursor-pointer bg-gray-800 border-gray-600"
                        />
                        <label htmlFor="active" className="text-sm text-white cursor-pointer select-none">Definir como Ativa</label>
                    </div>
                </div>

                <Button type="submit" className="w-full mt-4">Salvar e Calcular</Button>
            </form>
        </Card>

        {/* Analysis Section (Live Preview) */}
        <div className="space-y-6">
            {analysis ? (
                <Card className="bg-gradient-to-br from-[#1A1A1A] to-black border-neonGreen/30 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-neonGreen/10 blur-[50px] pointer-events-none rounded-full"></div>
                    
                    <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2 relative z-10">
                        <BarChart3 className="text-neonGreen" /> Análise de Viabilidade
                    </h2>
                    
                    <div className="space-y-4 relative z-10">
                        <div className="flex justify-between items-center pb-4 border-b border-white/5">
                             <div className="text-left">
                                <span className="text-graySub text-[10px] uppercase tracking-wider block mb-1">Margem Atual</span>
                                <div className={`text-xl font-bold ${analysis.avgMargin > 0 ? 'text-neonBlue' : 'text-gray-500'}`}>
                                    {analysis.avgMargin > 0 ? `${analysis.avgMargin.toFixed(1)}%` : '--'}
                                </div>
                             </div>
                             <div className="text-right">
                                <span className="text-graySub text-[10px] uppercase tracking-wider block mb-1">Dias Úteis</span>
                                <div className="text-xl font-bold text-white">
                                    {analysis.totalDays}
                                </div>
                             </div>
                        </div>

                        <div className="bg-white/5 p-4 rounded-xl border border-white/5">
                            <span className="text-graySub text-xs block mb-1">Lucro Diário Necessário</span>
                            <div className="text-2xl font-bold text-white">
                                {formatCurrency(analysis.dailyProfitNeeded)}
                            </div>
                            <p className="text-[10px] text-gray-500 mt-1">Para bater a meta de {formatCurrency(parseFloat(targetValue) || activeGoal?.targetValue || 0)}</p>
                        </div>

                        <div className="p-5 bg-neonGreen/5 rounded-2xl border border-neonGreen/20 shadow-[0_4px_20px_rgba(0,0,0,0.2)]">
                            <span className="text-neonGreen text-[10px] font-bold uppercase tracking-wider block mb-2">Meta de Venda Diária</span>
                            <div className="text-4xl font-bold text-white tracking-tight mb-2">
                                {isFinite(analysis.dailyRevenueNeeded) && analysis.dailyRevenueNeeded > 0 
                                    ? formatCurrency(analysis.dailyRevenueNeeded) 
                                    : 'R$ 0,00'}
                            </div>
                            <p className="text-[11px] text-gray-400 leading-relaxed">
                                Baseado na sua margem atual, você precisa <strong>faturar</strong> este valor por dia trabalhado para sobrar o lucro desejado.
                            </p>
                        </div>
                    </div>
                </Card>
            ) : null}

            {/* List of Goals */}
            <div className="space-y-3 max-h-64 overflow-y-auto pr-2 custom-scrollbar">
                <h3 className="font-bold text-graySub uppercase text-[10px] tracking-wider mb-2">Metas Salvas</h3>
                {goals.map(g => (
                    <div key={g.id} className={`p-4 rounded-2xl border transition-all ${g.isActive ? 'border-neonGreen bg-neonGreen/5' : 'border-white/5 bg-[#1A1A1A] hover:bg-white/5'}`}>
                        <div className="flex justify-between items-start">
                            <div>
                                <div className="font-bold text-white text-lg">{formatCurrency(g.targetValue)}</div>
                                <div className="text-xs text-gray-500 font-medium mt-1 flex items-center gap-2">
                                    <span className={`px-1.5 py-0.5 rounded text-[9px] uppercase ${g.type === 'MONTHLY' ? 'bg-purple-500/20 text-purple-400' : 'bg-orange-500/20 text-orange-400'}`}>
                                        {g.type === 'MONTHLY' ? 'Mensal' : 'Semanal'}
                                    </span>
                                    <span>• {g.workDays} dias</span>
                                </div>
                            </div>
                            <div className="flex gap-2">
                                {g.isActive ? (
                                    <span className="flex items-center gap-1 text-[10px] font-bold text-neonGreen bg-neonGreen/10 px-2 py-1 rounded-full border border-neonGreen/20">
                                        <CheckCircle size={12} /> ATIVA
                                    </span>
                                ) : (
                                    <button 
                                        onClick={() => setActiveGoal(g.id)}
                                        className="text-xs px-3 py-1.5 rounded-lg border border-gray-600 text-gray-400 hover:text-white hover:border-white transition-colors"
                                    >
                                        Ativar
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
      </div>
    </div>
  );
};

export default Goals;