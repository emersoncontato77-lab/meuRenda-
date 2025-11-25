
import React, { useState, useEffect, useMemo } from 'react';
import { Target, Calculator, TrendingUp, AlertTriangle, Trash2, Edit2, ArrowLeft, Calendar, CalendarDays, Clock } from 'lucide-react';
import { useApp } from '../context';
import { Button, Input, Card, Header } from './Shared';
import { Goal, GoalType } from '../types';
import { calculateTotals, formatCurrency, getCurrentWeekRange } from '../utils';

const WEEKDAYS = [
  { label: 'S', value: 1, name: 'Segunda-feira' },
  { label: 'T', value: 2, name: 'Terça-feira' },
  { label: 'Q', value: 3, name: 'Quarta-feira' },
  { label: 'Q', value: 4, name: 'Quinta-feira' },
  { label: 'S', value: 5, name: 'Sexta-feira' },
  { label: 'S', value: 6, name: 'Sábado' },
  { label: 'D', value: 0, name: 'Domingo' },
];

const Goals: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const { goals, updateGoal, deleteGoal, transactions } = useApp();
  
  // --- STATE FOR FORM ---
  const activeGoal = useMemo(() => goals.find(g => g.isActive), [goals]);

  const [type, setType] = useState<GoalType>('MONTHLY');
  const [targetValue, setTargetValue] = useState<string>('');
  const [selectedWeekDays, setSelectedWeekDays] = useState<number[]>([1, 2, 3, 4, 5]); // Mon-Fri default
  const [customDays, setCustomDays] = useState<string>(''); // Para meta personalizada
  const [marginMode, setMarginMode] = useState<'AUTO' | 'MANUAL'>('AUTO');
  const [manualMargin, setManualMargin] = useState<string>('');
  
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Initialize form when activeGoal changes
  useEffect(() => {
    if (activeGoal) {
      setType(activeGoal.type);
      setTargetValue(activeGoal.targetValue.toString());
      setSelectedWeekDays(activeGoal.selectedWeekDays || [1,2,3,4,5]);
      setCustomDays(activeGoal.customTotalDays ? activeGoal.customTotalDays.toString() : '');
      setMarginMode(activeGoal.marginMode || 'AUTO');
      setManualMargin(activeGoal.manualMarginValue ? activeGoal.manualMarginValue.toString() : '');
    }
  }, [activeGoal]);

  // --- CÁLCULOS ESPECÍFICOS ---

  // 1. Calcular Margem
  const stats = useMemo(() => calculateTotals(transactions), [transactions]);
  const autoMargin = stats.income > 0 ? (stats.netProfit / stats.income) * 100 : 0;
  const effectiveMargin = marginMode === 'AUTO' ? autoMargin : (parseFloat(manualMargin) || 0);

  // 2. Funções de Cálculo de Dias e Valores
  const targetProfit = parseFloat(targetValue) || 0;

  // Função A: Meta Mensal (Existente)
  const calculateMonthlyDays = () => {
    if (selectedWeekDays.length === 0) return 0;
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    
    let count = 0;
    for (let day = 1; day <= daysInMonth; day++) {
      const currentDayDate = new Date(year, month, day);
      if (selectedWeekDays.includes(currentDayDate.getDay())) {
        count++;
      }
    }
    return count;
  };

  // Função B: Meta Semanal (Nova)
  const calcularMetaSemanal = () => {
    const daysCount = selectedWeekDays.length || 1; // Evita divisão por zero
    const dailyTarget = targetProfit / daysCount;
    return {
      totalDays: daysCount,
      dailyTarget: Math.round(dailyTarget * 100) / 100
    };
  };

  // Função C: Meta Personalizada (Nova)
  const calcularMetaPersonalizada = () => {
    const daysInput = parseInt(customDays) || 1;
    const dailyTarget = targetProfit / daysInput;
    return {
      totalDays: daysInput,
      dailyTarget: Math.round(dailyTarget * 100) / 100
    };
  };

  // --- Determinar valores finais baseado no tipo ---
  const calculationResult = useMemo(() => {
    if (type === 'MONTHLY') {
      const days = calculateMonthlyDays();
      const daily = days > 0 ? targetProfit / days : 0;
      return { days, dailyTarget: daily, label: 'Dias Úteis (Mês)' };
    } else if (type === 'WEEKLY') {
      const { totalDays, dailyTarget } = calcularMetaSemanal();
      return { days: totalDays, dailyTarget, label: 'Dias na Semana' };
    } else {
      const { totalDays, dailyTarget } = calcularMetaPersonalizada();
      return { days: totalDays, dailyTarget, label: 'Dias Totais' };
    }
  }, [type, targetProfit, selectedWeekDays, customDays]);

  // Daily Revenue Needed (Faturamento Diário Necessário)
  // Se margem for 0, assume 100% (lucro = faturamento) para não quebrar
  const safeMargin = effectiveMargin <= 0 ? 100 : effectiveMargin;
  const dailyRevenueNeeded = calculationResult.dailyTarget / (safeMargin / 100);

  // --- DAILY TRACKING LOGIC ---
  const dailyTracking = useMemo(() => {
    if (!activeGoal) return null;

    const { start: weekStart } = getCurrentWeekRange();
    const today = new Date();
    today.setHours(0,0,0,0);

    const weekData = [];
    
    // Se for CUSTOM e não depender de dias da semana específicos, 
    // a lógica de exibição diária pode ser simplificada ou mantida apenas para mostrar o progresso atual.
    // Para manter consistência visual, mantemos a visualização semanal se dias forem selecionados (Monthly/Weekly).
    // Se for Custom, talvez mostremos apenas um progresso geral ou assumimos dias úteis.
    
    // Para simplificar e manter o padrão visual conforme pedido:
    // Se for Custom, vamos assumir visualização dos últimos dias ou da semana atual se o usuário estiver operando.
    // Mas a lógica original depende de `selectedWeekDays`.
    // Se for CUSTOM, vamos forçar todos os dias como úteis para visualização ou usar os selecionados se o user não limpou.
    // Vamos usar selectedWeekDays mesmo no custom para "Visualização de Calendário", mas o cálculo matemático usa o input numérico.

    const daysToIterate = activeGoal.type === 'CUSTOM' ? [0,1,2,3,4,5,6] : activeGoal.selectedWeekDays;

    for (let i = 0; i < 7; i++) {
       const d = new Date(weekStart);
       d.setDate(d.getDate() + i);
       const dayIndex = d.getDay();

       if (daysToIterate.includes(dayIndex)) {
          const isToday = d.getTime() === today.getTime();
          const dayTx = transactions.filter(t => {
             const tDate = new Date(t.date);
             return tDate.toISOString().split('T')[0] === d.toISOString().split('T')[0] && t.type === 'INCOME';
          });
          
          const actualRevenue = dayTx.reduce((acc, t) => acc + t.amount, 0);
          
          // Recalcular o dailyRevenueNeeded baseada na meta ativa salva no banco
          let activeDailyTarget = 0;
          const activeSafeMargin = (activeGoal.marginMode === 'MANUAL' && activeGoal.manualMarginValue) 
            ? activeGoal.manualMarginValue 
            : (autoMargin > 0 ? autoMargin : 100);

          if (activeGoal.type === 'MONTHLY') {
             // Lógica mensal aproximada para display rápido
             activeDailyTarget = activeGoal.targetValue / (activeGoal.workDays || 20);
          } else if (activeGoal.type === 'WEEKLY') {
             activeDailyTarget = activeGoal.targetValue / (activeGoal.selectedWeekDays.length || 5);
          } else {
             activeDailyTarget = activeGoal.targetValue / (activeGoal.customTotalDays || 1);
          }
          
          const activeDailyRevenueNeeded = activeDailyTarget / (activeSafeMargin / 100);
          
          const progress = activeDailyRevenueNeeded > 0 ? (actualRevenue / activeDailyRevenueNeeded) * 100 : 0;

          let status: 'GREEN' | 'YELLOW' | 'RED' | 'GRAY' = 'GRAY';
          if (progress >= 100) status = 'GREEN';
          else if (progress >= 70) status = 'YELLOW';
          else if (d.getTime() < today.getTime()) status = 'RED'; 
          else if (isToday) status = 'YELLOW'; 

          weekData.push({
            date: d,
            name: WEEKDAYS.find(w => w.value === dayIndex)?.name,
            label: WEEKDAYS.find(w => w.value === dayIndex)?.label,
            actualRevenue,
            targetRevenue: activeDailyRevenueNeeded,
            progress,
            status,
            isToday
          });
       }
    }
    return weekData;
  }, [activeGoal, transactions, autoMargin]);


  // --- HANDLERS ---

  const toggleDay = (dayIndex: number) => {
    setSelectedWeekDays(prev => 
      prev.includes(dayIndex) 
        ? prev.filter(d => d !== dayIndex) 
        : [...prev, dayIndex]
    );
  };

  const handleSaveGoal = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (type !== 'CUSTOM' && selectedWeekDays.length === 0) {
      alert("Selecione pelo menos um dia de trabalho.");
      return;
    }

    if (type === 'CUSTOM' && (!customDays || parseInt(customDays) <= 0)) {
        alert("Defina a quantidade de dias para a meta personalizada.");
        return;
    }

    const newGoal: Goal = {
      id: activeGoal?.id || crypto.randomUUID(),
      type,
      targetValue: parseFloat(targetValue),
      workDays: calculationResult.days,
      selectedWeekDays: type === 'CUSTOM' ? [] : selectedWeekDays, // Custom não depende obrigatoriamente dos dias da semana
      customTotalDays: type === 'CUSTOM' ? parseInt(customDays) : undefined,
      startDate: activeGoal?.startDate || new Date().toISOString().split('T')[0],
      endDate: '',
      isActive: true,
      marginMode,
      manualMarginValue: marginMode === 'MANUAL' ? parseFloat(manualMargin) : undefined
    };

    updateGoal(newGoal);
    alert("Meta salva com sucesso!");
  };

  const handleDeleteGoal = () => {
    if (activeGoal) {
      deleteGoal(activeGoal.id);
      setTargetValue('');
      setManualMargin('');
      setCustomDays('');
      setSelectedWeekDays([1,2,3,4,5]);
      setShowDeleteConfirm(false);
    }
  };

  return (
    <div className="animate-fade-in max-w-4xl mx-auto pb-24">
      <button onClick={onBack} className="flex items-center text-graySub hover:text-white mb-6 transition-colors">
        <ArrowLeft className="w-5 h-5 mr-2" /> Voltar
      </button>

      <Header title="Metas & Objetivos" subtitle="Defina onde você quer chegar" icon={Target} />

      {/* --- ACOMPANHAMENTO DIÁRIO (Se houver meta ativa) --- */}
      {activeGoal && dailyTracking && dailyTracking.length > 0 && (
        <div className="mb-10 animate-slide-up">
           <div className="bg-gradient-to-r from-[#1A1A1A] to-[#111] p-5 rounded-[2rem] border border-white/5 shadow-xl">
              <div className="flex items-center gap-3 mb-6">
                 <div className="p-2 bg-neonGreen/10 rounded-xl text-neonGreen">
                    <TrendingUp size={20} />
                 </div>
                 <div>
                    <h2 className="text-lg font-bold text-white leading-none">
                        Progresso {activeGoal.type === 'MONTHLY' ? 'Mensal' : activeGoal.type === 'WEEKLY' ? 'Semanal' : 'Personalizado'}
                    </h2>
                    <p className="text-[11px] text-gray-400 mt-1">Acompanhe seu desempenho diário</p>
                 </div>
              </div>

              <div className="grid gap-3">
                 {dailyTracking.map((day) => (
                   <div key={day.date.toISOString()} className={`flex items-center justify-between p-3 rounded-xl border ${day.isToday ? 'bg-white/5 border-neonGreen/30' : 'bg-[#0D0D0D] border-white/5'}`}>
                      <div className="flex items-center gap-3">
                         <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold 
                            ${day.status === 'GREEN' ? 'bg-neonGreen text-black' : 
                              day.status === 'YELLOW' ? 'bg-yellow-500 text-black' :
                              day.status === 'RED' ? 'bg-red-500/20 text-red-500' : 'bg-gray-800 text-gray-500'}`}>
                            {day.label}
                         </div>
                         <div>
                            <span className={`text-sm font-bold ${day.isToday ? 'text-white' : 'text-gray-400'}`}>{day.name}</span>
                            <div className="flex gap-2 text-[10px] text-gray-500">
                               <span>Meta: {formatCurrency(day.targetRevenue)}</span>
                            </div>
                         </div>
                      </div>

                      <div className="text-right">
                         <span className={`block font-bold text-sm ${
                            day.status === 'GREEN' ? 'text-neonGreen' : 
                            day.status === 'YELLOW' ? 'text-yellow-500' : 
                            day.status === 'RED' ? 'text-red-500' : 'text-gray-500'
                         }`}>
                            {formatCurrency(day.actualRevenue)}
                         </span>
                         <div className="w-24 h-1.5 bg-gray-800 rounded-full mt-1 ml-auto overflow-hidden">
                            <div 
                               className={`h-full rounded-full ${
                                  day.status === 'GREEN' ? 'bg-neonGreen' : 
                                  day.status === 'YELLOW' ? 'bg-yellow-500' : 'bg-red-500'
                               }`}
                               style={{ width: `${Math.min(day.progress, 100)}%` }}
                            ></div>
                         </div>
                      </div>
                   </div>
                 ))}
              </div>
           </div>
        </div>
      )}

      {/* --- SELETOR DE TIPO DE META --- */}
      <div className="grid grid-cols-3 gap-2 mb-6 bg-[#0D0D0D] p-1.5 rounded-2xl border border-white/10">
        {(['MONTHLY', 'WEEKLY', 'CUSTOM'] as GoalType[]).map((t) => (
            <button
                key={t}
                onClick={() => setType(t)}
                className={`py-3 rounded-xl text-xs font-bold transition-all ${
                    type === t 
                    ? 'bg-neonBlue text-black shadow-lg shadow-neonBlue/20' 
                    : 'text-gray-500 hover:text-white hover:bg-white/5'
                }`}
            >
                {t === 'MONTHLY' ? 'Mensal' : t === 'WEEKLY' ? 'Semanal' : 'Personalizada'}
            </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Lado Esquerdo: Formulário */}
        <Card>
            <div className="flex justify-between items-center mb-6">
               <h2 className="text-xl font-bold text-white flex items-center gap-2">
                   <Edit2 size={18} className="text-neonBlue" /> 
                   {activeGoal ? 'Editar Meta' : 'Configurar Meta'}
               </h2>
               {activeGoal && (
                 <button 
                    onClick={() => setShowDeleteConfirm(true)} 
                    className="text-red-500 hover:bg-red-500/10 p-2 rounded-lg transition-colors text-xs font-bold flex items-center gap-1"
                 >
                    <Trash2 size={14} /> Excluir
                 </button>
               )}
            </div>

            <form onSubmit={handleSaveGoal}>
                
                {/* 1. Valor da Meta */}
                <div className="mb-6">
                  <Input 
                      label={type === 'MONTHLY' ? "Meta de Lucro (Mês)" : type === 'WEEKLY' ? "Meta de Lucro (Semana)" : "Meta de Lucro Total"}
                      type="number" 
                      placeholder="0,00"
                      value={targetValue} 
                      onChange={(e) => setTargetValue(e.target.value)}
                      required
                      className="text-2xl font-bold text-neonGreen placeholder-gray-700"
                  />
                </div>

                {/* 2. Configuração de Dias (Varia por tipo) */}
                {type === 'CUSTOM' ? (
                    <div className="mb-6 animate-fade-in">
                         <Input 
                            label="Em quantos dias você quer atingir essa meta?"
                            type="number" 
                            placeholder="Ex: 3 dias"
                            value={customDays} 
                            onChange={(e) => setCustomDays(e.target.value)}
                            required
                        />
                         <p className="text-[10px] text-gray-500 mt-1">
                            O app dividirá o valor total por essa quantidade de dias.
                         </p>
                    </div>
                ) : (
                    <div className="mb-6 animate-fade-in">
                        <label className="text-[10px] text-gray-500 font-bold uppercase tracking-wider ml-1 mb-3 block">
                            Dias de Trabalho {type === 'WEEKLY' ? 'na Semana' : 'Considerados'}
                        </label>
                        <div className="flex justify-between gap-1">
                            {WEEKDAYS.map((day) => {
                            const isSelected = selectedWeekDays.includes(day.value);
                            return (
                                <button
                                key={day.value}
                                type="button"
                                onClick={() => toggleDay(day.value)}
                                className={`flex-1 h-10 rounded-xl text-xs font-bold transition-all duration-200 border ${
                                    isSelected 
                                    ? 'bg-neonBlue text-black border-neonBlue shadow-[0_0_10px_rgba(0,191,255,0.3)]' 
                                    : 'bg-[#0D0D0D] text-gray-600 border-white/10 hover:border-white/30'
                                }`}
                                >
                                {day.label}
                                </button>
                            );
                            })}
                        </div>
                        <p className="text-[10px] text-gray-500 mt-2 text-right">
                            {type === 'MONTHLY' 
                                ? `Total calculado: ${calculationResult.days} dias úteis neste mês`
                                : `Total: ${selectedWeekDays.length} dias por semana`
                            }
                        </p>
                    </div>
                )}

                {/* 3. Margem de Lucro */}
                <div className="mb-8">
                   <label className="text-[10px] text-gray-500 font-bold uppercase tracking-wider ml-1 mb-3 block">
                      Definição de Margem
                   </label>
                   
                   <div className="bg-[#0D0D0D] p-1 rounded-2xl border border-white/10 flex mb-4">
                      <button
                        type="button"
                        onClick={() => setMarginMode('AUTO')}
                        className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all ${
                           marginMode === 'AUTO' ? 'bg-white/10 text-white shadow-sm' : 'text-gray-500 hover:text-gray-300'
                        }`}
                      >
                        Automática ({autoMargin.toFixed(1)}%)
                      </button>
                      <button
                        type="button"
                        onClick={() => setMarginMode('MANUAL')}
                        className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all ${
                           marginMode === 'MANUAL' ? 'bg-white/10 text-white shadow-sm' : 'text-gray-500 hover:text-gray-300'
                        }`}
                      >
                        Manual
                      </button>
                   </div>

                   {marginMode === 'MANUAL' && (
                      <div className="animate-fade-in">
                        <Input 
                           label="Margem Desejada (%)"
                           type="number"
                           value={manualMargin}
                           onChange={(e) => setManualMargin(e.target.value)}
                           placeholder="Ex: 30"
                        />
                      </div>
                   )}
                   
                   <div className="flex items-start gap-2 text-[10px] text-gray-500 bg-blue-500/5 p-3 rounded-xl border border-blue-500/10">
                      <Calculator size={14} className="text-blue-500 shrink-0 mt-0.5" />
                      <p>A margem define quanto você precisa faturar para sobrar o lucro desejado.</p>
                   </div>
                </div>

                <Button type="submit" className="w-full">
                   Salvar Meta {type === 'MONTHLY' ? 'Mensal' : type === 'WEEKLY' ? 'Semanal' : 'Personalizada'}
                </Button>
            </form>
        </Card>

        {/* Lado Direito: Preview / Resultado */}
        <div className="space-y-6">
            <Card className="bg-gradient-to-br from-[#1A1A1A] to-black border-neonGreen/30 relative overflow-hidden h-full flex flex-col justify-center">
                <div className="absolute top-0 right-0 w-40 h-40 bg-neonGreen/10 blur-[60px] pointer-events-none rounded-full"></div>
                
                <h3 className="text-gray-400 text-[10px] font-bold uppercase tracking-wider mb-6 relative z-10 flex items-center gap-2">
                   <Target size={14} /> Resumo do Planejamento
                </h3>

                <div className="space-y-8 relative z-10">
                   <div>
                      <span className="text-gray-500 text-xs block mb-1">Meta de Lucro ({type === 'MONTHLY' ? 'Total' : 'Alvo'})</span>
                      <div className="text-3xl font-bold text-white tracking-tight">
                         {targetValue ? formatCurrency(parseFloat(targetValue)) : 'R$ 0,00'}
                      </div>
                   </div>

                   <div className="grid grid-cols-2 gap-4">
                      <div className="bg-white/5 p-3 rounded-xl border border-white/5">
                         <span className="text-gray-500 text-[10px] block mb-1">{calculationResult.label}</span>
                         <span className="text-white font-bold text-lg">{calculationResult.days}</span>
                      </div>
                      <div className="bg-white/5 p-3 rounded-xl border border-white/5">
                         <span className="text-gray-500 text-[10px] block mb-1">Margem Usada</span>
                         <span className={`font-bold text-lg ${effectiveMargin > 0 ? 'text-neonBlue' : 'text-red-500'}`}>
                            {effectiveMargin.toFixed(1)}%
                         </span>
                      </div>
                   </div>

                   {/* MENSAGEM DINÂMICA DE RESULTADO */}
                   <div className="p-5 bg-neonGreen/5 rounded-2xl border border-neonGreen/20 shadow-[0_4px_20px_rgba(0,0,0,0.2)]">
                      <span className="text-neonGreen text-[10px] font-bold uppercase tracking-wider block mb-2">
                         Você precisa faturar por dia
                      </span>
                      <div className="text-4xl font-bold text-white tracking-tight mb-2">
                         {dailyRevenueNeeded && isFinite(dailyRevenueNeeded) 
                            ? formatCurrency(dailyRevenueNeeded) 
                            : 'R$ 0,00'}
                      </div>
                      
                      <p className="text-[10px] text-gray-400 leading-relaxed mt-3">
                        {type === 'CUSTOM' ? (
                            <>
                                Você precisa fazer <strong className="text-white">{formatCurrency(dailyRevenueNeeded)}</strong> por dia para atingir <strong className="text-white">{formatCurrency(targetProfit)}</strong> de lucro em <strong className="text-white">{calculationResult.days} dias</strong>.
                            </>
                        ) : (
                            <>
                                Para atingir seu lucro de {targetValue ? formatCurrency(parseFloat(targetValue)) : 'R$ 0,00'} trabalhando {calculationResult.days} dias {type === 'WEEKLY' ? 'na semana' : 'no mês'}.
                            </>
                        )}
                      </p>
                   </div>
                </div>
            </Card>
        </div>
      </div>

      {/* POPUP DE CONFIRMAÇÃO DE EXCLUSÃO */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
           <div className="bg-[#1A1A1A] border border-white/10 rounded-[2rem] p-6 w-full max-w-sm animate-scale-in">
              <div className="w-12 h-12 rounded-full bg-red-500/10 flex items-center justify-center mx-auto mb-4 text-red-500">
                 <AlertTriangle size={24} />
              </div>
              <h3 className="text-lg font-bold text-white text-center mb-2">Excluir Meta Atual?</h3>
              <p className="text-sm text-gray-400 text-center mb-6">
                 Tem certeza que deseja apagar sua meta atual? Todo o planejamento será resetado.
              </p>
              <div className="grid grid-cols-2 gap-3">
                 <button 
                    onClick={() => setShowDeleteConfirm(false)}
                    className="h-12 rounded-xl bg-white/5 text-white font-bold text-sm hover:bg-white/10"
                 >
                    Cancelar
                 </button>
                 <button 
                    onClick={handleDeleteGoal}
                    className="h-12 rounded-xl bg-red-500 text-white font-bold text-sm hover:bg-red-600 shadow-lg shadow-red-500/20"
                 >
                    Confirmar
                 </button>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};

export default Goals;
