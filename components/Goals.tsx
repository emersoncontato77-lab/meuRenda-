import React, { useState, useEffect, useMemo } from 'react';
import { Target, Calculator, CheckCircle, ArrowLeft, CalendarDays, BarChart3, TrendingUp, AlertTriangle, Trophy } from 'lucide-react';
import { useApp } from '../context';
import { Button, Input, Select, Card, Header } from './Shared';
import { Goal, GoalType } from '../types';
import { calculateTotals, formatCurrency, getCurrentWeekRange } from '../utils';

const WEEKDAYS = [
  { label: 'D', value: 0, name: 'Domingo' },
  { label: 'S', value: 1, name: 'Segunda-feira' },
  { label: 'T', value: 2, name: 'Terça-feira' },
  { label: 'Q', value: 3, name: 'Quarta-feira' },
  { label: 'Q', value: 4, name: 'Quinta-feira' },
  { label: 'S', value: 5, name: 'Sexta-feira' },
  { label: 'S', value: 6, name: 'Sábado' },
];

const Goals: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const { goals, updateGoal, setActiveGoal, transactions } = useApp();
  
  // Form State
  const [type, setType] = useState<GoalType>('MONTHLY');
  const [targetValue, setTargetValue] = useState<string>('');
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState('');
  const [isActive, setIsActive] = useState(true);
  
  // Day Selection (Default: Mon-Fri)
  const [selectedWeekDays, setSelectedWeekDays] = useState<number[]>([1, 2, 3, 4, 5]);

  // Derived State: Calculated Work Days based on Calendar
  const calculatedWorkDays = useMemo(() => {
    if (selectedWeekDays.length === 0) return 0;

    const start = new Date(startDate);
    if (type === 'WEEKLY') {
      return selectedWeekDays.length;
    } else {
      const year = start.getFullYear();
      const month = start.getMonth();
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

  // Analysis State for FORM PREVIEW
  const [analysis, setAnalysis] = useState<{
    avgMargin: number;
    dailyProfitNeeded: number;
    dailyRevenueNeeded: number;
    totalDays: number;
  } | null>(null);

  const activeGoal = goals.find(g => g.isActive);

  // --- LOGIC: Active Goal Tracking ---
  const activeTracking = useMemo(() => {
    if (!activeGoal) return null;

    // 1. Calculate Global Margin based on all transactions (or current month/period)
    // Using all transactions for stability of the margin metric
    const totals = calculateTotals(transactions);
    const globalMargin = totals.income > 0 ? (totals.netProfit / totals.income) : 0; // % expressed as 0.x

    // 2. Calculate Targets based on Active Goal
    // How much profit needed per day worked?
    // If Monthly: Goal / WorkDays. If Weekly: Goal / WorkDays.
    const dailyProfitTarget = activeGoal.workDays > 0 ? activeGoal.targetValue / activeGoal.workDays : 0;
    
    // How much revenue needed? (ProfitTarget / Margin)
    // If margin is negative or zero, we fallback to just showing the profit target directly or 
    // assuming a 20% standard margin for estimation to avoid division by zero errors in UI,
    // but visually we will rely on Profit numbers if margin is weird.
    const safeMargin = globalMargin <= 0 ? 1 : globalMargin; // Fallback to 1:1 if no margin data
    const dailyRevenueTarget = dailyProfitTarget / safeMargin;

    // 3. Get Current Week Data
    const { start: weekStart, end: weekEnd } = getCurrentWeekRange();
    const today = new Date();
    today.setHours(0,0,0,0);

    // Filter transactions for this week
    const weeklyTransactions = transactions.filter(t => {
      const d = new Date(t.date);
      d.setHours(0,0,0,0);
      return d >= weekStart && d <= weekEnd;
    });

    // 4. Build Day-by-Day Stats
    const weekDaysStats = [];
    let currentDay = new Date(weekStart);
    
    // Iterate 7 days of the week
    for (let i = 0; i < 7; i++) {
        const dayDate = new Date(currentDay);
        const dayOfWeek = dayDate.getDay(); // 0-6
        const isWorkDay = activeGoal.selectedWeekDays ? activeGoal.selectedWeekDays.includes(dayOfWeek) : false;
        const isToday = dayDate.getTime() === today.getTime();
        const isFuture = dayDate.getTime() > today.getTime();

        // Get transactions for this specific day
        const dayTx = weeklyTransactions.filter(t => {
            const tDate = new Date(t.date);
            // Compare YYYY-MM-DD
            return tDate.toISOString().split('T')[0] === dayDate.toISOString().split('T')[0];
        });

        const dayTotals = calculateTotals(dayTx);

        weekDaysStats.push({
            date: dayDate,
            dayName: WEEKDAYS.find(w => w.value === dayOfWeek)?.name,
            dayLabel: WEEKDAYS.find(w => w.value === dayOfWeek)?.label,
            isWorkDay,
            isToday,
            isFuture,
            income: dayTotals.income,
            profit: dayTotals.netProfit,
            targetRevenue: isWorkDay ? dailyRevenueTarget : 0,
            targetProfit: isWorkDay ? dailyProfitTarget : 0,
            // Progress Calculation (Capped at 100 for visual bar, but kept raw for logic)
            revenueProgress: (isWorkDay && dailyRevenueTarget > 0) ? (dayTotals.income / dailyRevenueTarget) * 100 : 0,
            profitProgress: (isWorkDay && dailyProfitTarget > 0) ? (dayTotals.netProfit / dailyProfitTarget) * 100 : 0
        });

        currentDay.setDate(currentDay.getDate() + 1);
    }

    // Today's specific stats
    const todayStats = weekDaysStats.find(d => d.isToday);
    
    // Motivational Quote Logic
    let quote = { text: "Vamos começar o dia com tudo!", color: "text-gray-400" };
    if (todayStats && todayStats.isWorkDay) {
        if (todayStats.profitProgress >= 100) {
            quote = { text: "🔥 Meta diária concluída! Continue assim.", color: "text-neonGreen" };
        } else if (todayStats.profitProgress >= 70) {
            quote = { text: "🚀 Falta pouco! Mantenha o foco.", color: "text-yellow-400" };
        } else if (todayStats.profitProgress > 0) {
            quote = { text: "💡 A consistência constrói o resultado.", color: "text-blue-400" };
        } else if (!todayStats.isFuture) {
             quote = { text: "Você ainda consegue virar o jogo hoje!", color: "text-white" };
        }
    } else if (todayStats && !todayStats.isWorkDay) {
         quote = { text: "Hoje é dia de descanso ou planejamento.", color: "text-gray-500" };
    }

    return {
        dailyProfitTarget,
        dailyRevenueTarget,
        weekDaysStats,
        todayStats,
        quote,
        globalMargin
    };

  }, [activeGoal, transactions]);

  // Toggle Day Selection
  const toggleDay = (dayIndex: number) => {
    setSelectedWeekDays(prev => 
      prev.includes(dayIndex) 
        ? prev.filter(d => d !== dayIndex) 
        : [...prev, dayIndex].sort()
    );
  };

  // Preview Calculation for New Goal Form
  useEffect(() => {
    const totals = calculateTotals(transactions);
    const margin = totals.income > 0 ? (totals.netProfit / totals.income) : 0; 
    
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
      workDays: calculatedWorkDays,
      selectedWeekDays, 
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

      <Header title="Metas & Planejamento" subtitle="Defina e acompanhe seus objetivos" icon={Target} />

      {/* --- SECTION: DAILY TRACKING (Only if active goal exists) --- */}
      {activeGoal && activeTracking && (
        <div className="mb-10 animate-slide-up">
            <div className="flex items-center gap-2 mb-4">
                <Trophy className="text-yellow-500 w-5 h-5" />
                <h2 className="text-lg font-bold text-white uppercase tracking-wider">Acompanhamento Diário</h2>
            </div>
            
            {/* Motivational Banner */}
            <div className="bg-gradient-to-r from-[#1A1A1A] to-[#111] p-4 rounded-2xl border border-white/5 mb-6 flex items-center gap-4 shadow-lg">
                <div className={`p-3 rounded-full bg-[#0D0D0D] border border-white/5 ${activeTracking.quote.color}`}>
                   {activeTracking.todayStats?.profitProgress || 0 >= 100 ? <CheckCircle size={20} /> : <TrendingUp size={20} />}
                </div>
                <div>
                    <p className={`font-bold text-sm ${activeTracking.quote.color}`}>{activeTracking.quote.text}</p>
                    <p className="text-[10px] text-gray-500">Baseado no seu desempenho de hoje.</p>
                </div>
            </div>

            {/* Weekly Grid */}
            <div className="grid gap-3">
                {activeTracking.weekDaysStats.filter(d => d.isWorkDay).map((day) => {
                    const isSuccess = day.profit >= day.targetProfit;
                    const isClose = !isSuccess && day.profit >= (day.targetProfit * 0.7);
                    
                    let statusColor = "bg-gray-700";
                    let textColor = "text-gray-500";
                    let borderColor = "border-white/5";

                    if (day.income > 0 || day.isToday) {
                        if (isSuccess) {
                            statusColor = "bg-neonGreen";
                            textColor = "text-neonGreen";
                            borderColor = "border-neonGreen/30";
                        } else if (isClose) {
                            statusColor = "bg-yellow-500";
                            textColor = "text-yellow-500";
                            borderColor = "border-yellow-500/30";
                        } else {
                            statusColor = "bg-white"; // Progress bar color for low progress
                        }
                    }

                    return (
                        <div key={day.date.toISOString()} className={`p-4 rounded-2xl bg-[#1A1A1A] border ${day.isToday ? 'border-neonGreen/50 shadow-[0_0_15px_rgba(57,255,20,0.1)]' : 'border-white/5'} flex flex-col gap-3`}>
                            <div className="flex justify-between items-center">
                                <div className="flex items-center gap-3">
                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${day.isToday ? 'bg-neonGreen text-black' : 'bg-[#0D0D0D] text-gray-400'}`}>
                                        {day.dayLabel}
                                    </div>
                                    <div>
                                        <span className={`block text-sm font-bold ${day.isToday ? 'text-white' : 'text-gray-400'}`}>{day.dayName}</span>
                                        <span className="text-[10px] text-gray-600">
                                            Meta: {formatCurrency(day.targetProfit)} (Lucro)
                                        </span>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <span className={`block font-bold ${isSuccess ? 'text-neonGreen' : isClose ? 'text-yellow-500' : day.isToday ? 'text-white' : 'text-gray-500'}`}>
                                        {formatCurrency(day.profit)}
                                    </span>
                                    {day.profit < day.targetProfit && (
                                        <span className="text-[9px] text-gray-500">
                                            Faltam {formatCurrency(day.targetProfit - day.profit)}
                                        </span>
                                    )}
                                </div>
                            </div>

                            {/* Progress Bar */}
                            <div className="w-full h-2 bg-[#0D0D0D] rounded-full overflow-hidden relative">
                                <div 
                                    className={`h-full rounded-full transition-all duration-500 ${isSuccess ? 'bg-neonGreen' : isClose ? 'bg-yellow-500' : 'bg-gray-500'}`} 
                                    style={{ width: `${Math.min(day.profitProgress, 100)}%` }}
                                ></div>
                            </div>
                            
                            {/* Revenue Hint */}
                            <div className="flex justify-between items-center pt-1 border-t border-white/5 mt-1">
                                 <span className="text-[10px] text-gray-500 uppercase font-bold tracking-wider">Faturamento Necessário</span>
                                 <div className="flex gap-2 text-[10px]">
                                    <span className="text-gray-500">Real: <b className="text-gray-300">{formatCurrency(day.income)}</b></span>
                                    <span className="text-gray-600">/</span>
                                    <span className="text-gray-500">Alvo: <b className="text-gray-300">{formatCurrency(day.targetRevenue)}</b></span>
                                 </div>
                            </div>
                        </div>
                    );
                })}
                 {activeTracking.weekDaysStats.filter(d => d.isWorkDay).length === 0 && (
                    <div className="text-center py-4 text-gray-500 text-xs">
                        Nenhum dia de trabalho configurado para esta semana.
                    </div>
                 )}
            </div>
        </div>
      )}

      {/* --- SECTION: EDIT / CREATE GOAL --- */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pt-6 border-t border-white/10">
        
        {/* Form Section */}
        <Card>
            <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                <Calculator className="text-neonBlue" /> {activeGoal ? 'Ajustar Meta Atual' : 'Nova Meta'}
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
                        <BarChart3 className="text-neonGreen" /> Previsão (Simulação)
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