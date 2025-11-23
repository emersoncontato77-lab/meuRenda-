import React, { useMemo } from 'react';
import { TrendingUp, TrendingDown, PiggyBank, Target, ChevronRight, Plus } from 'lucide-react';
import { useApp } from '../context';
import { calculateTotals, formatCurrency, getCurrentMonthRange } from '../utils';
import { ViewState } from '../types';

interface DashboardProps {
  onNavigate: (view: ViewState) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ onNavigate }) => {
  const { transactions, goals } = useApp();

  const stats = useMemo(() => {
    const { start, end } = getCurrentMonthRange();
    const monthlyTx = transactions.filter(t => {
      const d = new Date(t.date);
      return d >= start && d <= end;
    });
    return calculateTotals(monthlyTx);
  }, [transactions]);

  const activeGoal = goals.find(g => g.isActive);
  const profitProgress = activeGoal && activeGoal.targetValue > 0 
    ? Math.min(100, Math.max(0, (stats.netProfit / activeGoal.targetValue) * 100)) 
    : 0;

  return (
    <div className="space-y-6 animate-fade-in">
      
      {/* CARD PRINCIPAL - Lucro Líquido (Hero Card) */}
      <div 
        onClick={() => onNavigate('reports')}
        className="w-full bg-[#1A1A1A] rounded-[2rem] p-6 shadow-xl border border-white/5 relative overflow-hidden active:scale-[0.98] transition-all duration-200 cursor-pointer"
      >
        {/* Background glow effect */}
        <div className="absolute top-0 right-0 w-40 h-40 bg-neonGreen/10 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none"></div>
        
        <div className="relative z-10 flex flex-col items-center justify-center text-center py-2">
          <h2 className="text-gray-400 text-[11px] font-bold uppercase tracking-[0.2em] mb-4">Lucro Líquido Mensal</h2>
          
          <div className={`text-[3.5rem] leading-none font-bold tracking-tighter mb-8 ${stats.netProfit >= 0 ? 'text-white' : 'text-red-500'}`}>
            <span className="text-2xl align-top opacity-40 font-medium mr-1">R$</span>
            {new Intl.NumberFormat('pt-BR', { minimumFractionDigits: 2 }).format(stats.netProfit)}
          </div>
          
          <div className="w-full space-y-3">
            <div className="flex justify-between items-end px-1">
              <div className="flex items-center gap-2">
                 <span className="text-neonGreen text-xs font-bold bg-neonGreen/10 px-2 py-0.5 rounded-full border border-neonGreen/20">
                    {profitProgress.toFixed(0)}%
                 </span>
                 <span className="text-gray-500 text-[10px]">da meta</span>
              </div>
              <span className="text-gray-400 text-[10px] font-medium">
                META: <span className="text-white font-bold">{activeGoal ? formatCurrency(activeGoal.targetValue) : 'R$ 0,00'}</span>
              </span>
            </div>
            <div className="h-3 w-full bg-black rounded-full overflow-hidden border border-white/5">
              <div 
                className="h-full bg-neonGreen shadow-[0_0_12px_rgba(57,255,20,0.6)] transition-all duration-1000 ease-out relative"
                style={{ width: `${profitProgress}%` }}
              >
                  <div className="absolute right-0 top-0 bottom-0 w-1 bg-white/50"></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* GRID DE CARDS SECUNDÁRIOS */}
      <div className="grid grid-cols-2 gap-3">
        
        {/* Faturamento */}
        <div 
          onClick={() => onNavigate('new-sale')}
          className="bg-[#1A1A1A] p-5 rounded-[1.8rem] border border-white/5 active:scale-95 transition-transform duration-200 cursor-pointer flex flex-col h-40 justify-between group relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-20 h-20 bg-neonGreen/5 rounded-full blur-2xl -mr-5 -mt-5 pointer-events-none"></div>
          
          <div className="flex justify-between items-start z-10">
            <div className="w-11 h-11 rounded-2xl bg-[#0D0D0D] border border-white/5 flex items-center justify-center text-neonGreen shadow-lg">
              <TrendingUp size={22} />
            </div>
          </div>
          <div className="z-10">
            <span className="text-gray-500 text-[10px] font-bold uppercase tracking-wider">Faturamento</span>
            <span className="text-xl font-bold text-white block mt-1 truncate tracking-tight">
              {formatCurrency(stats.income)}
            </span>
            <div className="flex items-center gap-1 mt-3 text-[10px] text-neonGreen font-medium">
                <span>Toque para lançar</span>
            </div>
          </div>
        </div>

        {/* Gastos */}
        <div 
          onClick={() => onNavigate('new-expense')}
          className="bg-[#1A1A1A] p-5 rounded-[1.8rem] border border-white/5 active:scale-95 transition-transform duration-200 cursor-pointer flex flex-col h-40 justify-between group relative overflow-hidden"
        >
           <div className="absolute top-0 right-0 w-20 h-20 bg-red-500/5 rounded-full blur-2xl -mr-5 -mt-5 pointer-events-none"></div>

          <div className="flex justify-between items-start z-10">
            <div className="w-11 h-11 rounded-2xl bg-[#0D0D0D] border border-white/5 flex items-center justify-center text-red-500 shadow-lg">
              <TrendingDown size={22} />
            </div>
          </div>
          <div className="z-10">
            <span className="text-gray-500 text-[10px] font-bold uppercase tracking-wider">Gastos</span>
            <span className="text-xl font-bold text-white block mt-1 truncate tracking-tight">
              {formatCurrency(stats.expenses)}
            </span>
            <div className="flex items-center gap-1 mt-3 text-[10px] text-red-500 font-medium">
                <span>Novo gasto</span>
            </div>
          </div>
        </div>

        {/* Investimentos */}
        <div 
          onClick={() => onNavigate('new-investment')}
          className="bg-[#1A1A1A] p-5 rounded-[1.8rem] border border-white/5 active:scale-95 transition-transform duration-200 cursor-pointer flex flex-col h-40 justify-between group relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-20 h-20 bg-neonBlue/5 rounded-full blur-2xl -mr-5 -mt-5 pointer-events-none"></div>

          <div className="flex justify-between items-start z-10">
            <div className="w-11 h-11 rounded-2xl bg-[#0D0D0D] border border-white/5 flex items-center justify-center text-neonBlue shadow-lg">
              <PiggyBank size={22} />
            </div>
          </div>
          <div className="z-10">
            <span className="text-gray-500 text-[10px] font-bold uppercase tracking-wider">Investimentos</span>
            <span className="text-xl font-bold text-white block mt-1 truncate tracking-tight">
              {formatCurrency(stats.investments)}
            </span>
             <div className="flex items-center gap-1 mt-3 text-[10px] text-neonBlue font-medium">
                <span>Novo aporte</span>
            </div>
          </div>
        </div>

        {/* Metas */}
        <div 
          onClick={() => onNavigate('goals')}
          className="bg-[#1A1A1A] p-5 rounded-[1.8rem] border border-white/5 active:scale-95 transition-transform duration-200 cursor-pointer flex flex-col h-40 justify-between group relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-20 h-20 bg-purple-500/5 rounded-full blur-2xl -mr-5 -mt-5 pointer-events-none"></div>

          <div className="flex justify-between items-start z-10">
            <div className="w-11 h-11 rounded-2xl bg-[#0D0D0D] border border-white/5 flex items-center justify-center text-purple-500 shadow-lg">
              <Target size={22} />
            </div>
          </div>
          <div className="z-10">
            <span className="text-gray-500 text-[10px] font-bold uppercase tracking-wider">Metas</span>
            <span className="text-lg font-bold text-white block mt-1 leading-tight tracking-tight">
              Ajustar<br/>Objetivos
            </span>
             <div className="flex items-center gap-1 mt-3 text-[10px] text-purple-500 font-medium">
                <span>Definir metas</span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Dashboard;