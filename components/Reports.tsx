import React, { useState, useMemo } from 'react';
import { 
  ArrowLeft, 
  BarChart3, 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  PiggyBank,
  PieChart as PieIcon,
  ChevronDown,
  Calendar
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { useApp } from '../context';
import { Header } from './Shared';
import { 
  filterTransactions, 
  getCurrentMonthRange, 
  getLast7DaysRange, 
  formatCurrency, 
  groupTransactionsByDate,
  groupExpensesByCategory
} from '../utils';
import { Transaction } from '../types';

type ReportView = 'MAIN' | 'REVENUE' | 'EXPENSES' | 'PROFIT' | 'INVESTMENTS';
type TimeRange = 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'CUSTOM';

const COLORS = ['#39FF14', '#00BFFF', '#FF4444', '#FFA500', '#9333EA', '#FFFFFF'];

const Reports: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const { transactions } = useApp();
  const [currentView, setCurrentView] = useState<ReportView>('MAIN');
  const [timeRange, setTimeRange] = useState<TimeRange>('WEEKLY');
  const [customStart, setCustomStart] = useState(new Date().toISOString().split('T')[0]);
  const [customEnd, setCustomEnd] = useState(new Date().toISOString().split('T')[0]);

  // --- Lógica de Dados Compartilhada ---
  const { filteredData, chartData, categoryData, totals } = useMemo(() => {
    let start: Date, end: Date;

    if (timeRange === 'DAILY') {
        start = new Date(); // Hoje
        end = new Date();
    } else if (timeRange === 'WEEKLY') {
      // Correção: Últimos 7 dias em vez de semana de calendário
      const range = getLast7DaysRange();
      start = range.start;
      end = range.end;
    } else if (timeRange === 'MONTHLY') {
      const range = getCurrentMonthRange();
      start = range.start;
      end = range.end;
    } else {
      start = new Date(customStart);
      end = new Date(customEnd);
      // Ajuste de fuso horário manual para input type="date"
      start.setHours(0,0,0,0); 
      end.setHours(23,59,59,999);
    }

    const filtered = filterTransactions(transactions, start, end);
    const groupedDate = groupTransactionsByDate(transactions, start, end);
    const groupedCategory = groupExpensesByCategory(filtered);

    // Totais do período
    const income = filtered.filter(t => t.type === 'INCOME').reduce((acc, t) => acc + t.amount, 0);
    const expenses = filtered.filter(t => t.type === 'EXPENSE').reduce((acc, t) => acc + t.amount, 0);
    const investments = filtered.filter(t => t.type === 'INVESTMENT').reduce((acc, t) => acc + t.amount, 0);
    const profit = income - expenses - investments;

    return { 
      filteredData: filtered, 
      chartData: groupedDate, 
      categoryData: groupedCategory,
      totals: { income, expenses, investments, profit }
    };
  }, [transactions, timeRange, customStart, customEnd]);

  // --- Componentes de UI Internos ---

  const TimeFilter = () => (
    <div className="bg-[#1A1A1A] p-2 rounded-2xl border border-white/5 mb-6 shadow-lg">
      <div className="flex overflow-x-auto pb-2 md:pb-0 gap-2 scrollbar-hide">
        {(['DAILY', 'WEEKLY', 'MONTHLY', 'CUSTOM'] as TimeRange[]).map((t) => (
          <button
            key={t}
            onClick={() => setTimeRange(t)}
            className={`px-4 py-2 rounded-xl text-[10px] font-bold uppercase tracking-wider whitespace-nowrap transition-all ${
              timeRange === t 
                ? 'bg-neonGreen/10 text-neonGreen border border-neonGreen/20 shadow-[0_0_10px_rgba(57,255,20,0.1)]' 
                : 'text-gray-500 hover:bg-white/5 hover:text-white'
            }`}
          >
            {t === 'DAILY' ? 'Diário' : t === 'WEEKLY' ? '7 Dias' : t === 'MONTHLY' ? 'Mensal' : 'Personalizado'}
          </button>
        ))}
      </div>

      {timeRange === 'CUSTOM' && (
        <div className="flex gap-2 mt-3 pt-3 border-t border-white/5 animate-fade-in">
             <input 
                type="date" 
                value={customStart}
                onChange={(e) => setCustomStart(e.target.value)}
                className="bg-[#0D0D0D] border border-white/10 rounded-lg px-2 py-2 text-white text-xs w-full outline-none focus:border-neonGreen/50"
            />
            <input 
                type="date" 
                value={customEnd}
                onChange={(e) => setCustomEnd(e.target.value)}
                className="bg-[#0D0D0D] border border-white/10 rounded-lg px-2 py-2 text-white text-xs w-full outline-none focus:border-neonGreen/50"
            />
        </div>
      )}
    </div>
  );

  const CustomTooltip = ({ active, payload, label, prefix = 'R$ ' }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-[#0D0D0D] border border-white/10 p-3 rounded-xl shadow-xl z-50">
          <p className="text-gray-400 text-[10px] font-bold mb-1">{label}</p>
          <p className="text-white font-bold text-sm">
            {prefix}{new Intl.NumberFormat('pt-BR', { minimumFractionDigits: 2 }).format(payload[0].value)}
          </p>
        </div>
      );
    }
    return null;
  };

  const TransactionList = ({ data, typeFilter }: { data: Transaction[], typeFilter?: string }) => {
    const list = typeFilter ? data.filter(t => t.type === typeFilter) : data;
    
    if (list.length === 0) return (
      <div className="text-center py-6 text-gray-600 text-xs">
        Nenhum registro encontrado neste período.
      </div>
    );

    return (
      <div className="mt-6 space-y-3">
        <h3 className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-2">
            Detalhamento ({list.length})
        </h3>
        <div className="max-h-60 overflow-y-auto pr-1 custom-scrollbar space-y-2">
            {list.map(t => (
                <div key={t.id} className="bg-[#0D0D0D] p-3 rounded-xl border border-white/5 flex justify-between items-center">
                    <div>
                        <div className="text-white text-xs font-medium">{t.description || (t.category ? t.category : 'Sem descrição')}</div>
                        <div className="text-[10px] text-gray-500">{new Date(t.date).toLocaleDateString('pt-BR', {timeZone: 'UTC'})}</div>
                    </div>
                    <div className="font-bold text-sm">
                        {formatCurrency(t.amount)}
                    </div>
                </div>
            ))}
        </div>
      </div>
    );
  };

  // --- SUB-VIEWS ---

  const RevenueView = () => (
    <div className="animate-fade-in space-y-6 pb-20">
      <div className="bg-[#1A1A1A] p-6 rounded-[2rem] border border-white/5 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-neonGreen/10 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none"></div>
        <span className="text-neonGreen text-[10px] font-bold uppercase tracking-wider block mb-1">Faturamento {timeRange === 'DAILY' ? 'de Hoje' : 'do Período'}</span>
        <div className="text-4xl font-bold text-white tracking-tight">{formatCurrency(totals.income)}</div>
      </div>

      <div className="h-64 w-full bg-[#1A1A1A] p-4 rounded-[2rem] border border-white/5">
         <h3 className="text-gray-400 text-[10px] font-bold uppercase mb-4 pl-2">Gráfico de Vendas</h3>
         <div className="w-full h-full overflow-x-auto pb-6">
            <div style={{ minWidth: chartData.length > 10 ? '600px' : '100%' }} className="h-full">
                <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#333" />
                    <XAxis dataKey="date" stroke="#666" fontSize={10} tickLine={false} axisLine={false} />
                    <Tooltip content={<CustomTooltip />} cursor={{fill: '#ffffff05'}} />
                    <Bar dataKey="income" fill="#39FF14" radius={[4, 4, 0, 0]} />
                </BarChart>
                </ResponsiveContainer>
            </div>
         </div>
      </div>

      <TransactionList data={filteredData} typeFilter="INCOME" />
    </div>
  );

  const ExpenseView = () => (
    <div className="animate-fade-in space-y-6 pb-20">
      <div className="bg-[#1A1A1A] p-6 rounded-[2rem] border border-white/5 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-red-500/10 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none"></div>
        <span className="text-red-500 text-[10px] font-bold uppercase tracking-wider block mb-1">Gastos {timeRange === 'DAILY' ? 'de Hoje' : 'do Período'}</span>
        <div className="text-4xl font-bold text-white tracking-tight">{formatCurrency(totals.expenses)}</div>
      </div>

      <div className="h-64 w-full bg-[#1A1A1A] p-4 rounded-[2rem] border border-white/5">
         <h3 className="text-gray-400 text-[10px] font-bold uppercase mb-4 pl-2">Gráfico de Gastos</h3>
         <div className="w-full h-full overflow-x-auto pb-6">
            <div style={{ minWidth: chartData.length > 10 ? '600px' : '100%' }} className="h-full">
                <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#333" />
                    <XAxis dataKey="date" stroke="#666" fontSize={10} tickLine={false} axisLine={false} />
                    <Tooltip content={<CustomTooltip />} cursor={{fill: '#ffffff05'}} />
                    <Bar dataKey="expense" fill="#EF4444" radius={[4, 4, 0, 0]} />
                </BarChart>
                </ResponsiveContainer>
            </div>
         </div>
      </div>

      {/* Pie Chart & Categories */}
      {categoryData.length > 0 && (
          <div className="bg-[#1A1A1A] p-6 rounded-[2rem] border border-white/5">
            <h3 className="text-gray-400 text-[10px] font-bold uppercase mb-6 flex items-center gap-2">
                <PieIcon size={14} /> Distribuição por Categoria
            </h3>
            
            <div className="flex flex-col items-center mb-8">
                <div className="w-48 h-48 relative">
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                        <Pie
                            data={categoryData}
                            cx="50%"
                            cy="50%"
                            innerRadius={60}
                            outerRadius={80}
                            paddingAngle={5}
                            dataKey="value"
                            stroke="none"
                        >
                            {categoryData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                        </Pie>
                        <Tooltip content={<CustomTooltip />} />
                        </PieChart>
                    </ResponsiveContainer>
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                        <span className="text-xs font-bold text-gray-500">Categorias</span>
                    </div>
                </div>
            </div>

            <div className="space-y-3">
                {categoryData.map((cat, index) => (
                    <div key={cat.name} className="flex items-center justify-between p-3 rounded-xl bg-[#0D0D0D] border border-white/5">
                        <div className="flex items-center gap-3">
                            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }}></div>
                            <span className="text-sm text-white font-medium">{cat.name}</span>
                        </div>
                        <div className="text-right">
                            <div className="text-sm font-bold text-white">{formatCurrency(cat.value)}</div>
                            <div className="text-[10px] text-gray-500">{cat.percent.toFixed(1)}%</div>
                        </div>
                    </div>
                ))}
            </div>
          </div>
      )}

      <TransactionList data={filteredData} typeFilter="EXPENSE" />
    </div>
  );

  const ProfitView = () => (
    <div className="animate-fade-in space-y-6 pb-20">
       <div className="bg-[#1A1A1A] p-6 rounded-[2rem] border border-white/5 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none"></div>
        <span className="text-white text-[10px] font-bold uppercase tracking-wider block mb-1">Lucro Líquido</span>
        <div className={`text-4xl font-bold tracking-tight ${totals.profit >= 0 ? 'text-white' : 'text-red-500'}`}>
            {formatCurrency(totals.profit)}
        </div>
        <p className="text-gray-500 text-[10px] mt-2">Margem Líquida: {totals.income > 0 ? ((totals.profit / totals.income) * 100).toFixed(1) : 0}%</p>
      </div>

      <div className="h-64 w-full bg-[#1A1A1A] p-4 rounded-[2rem] border border-white/5">
         <h3 className="text-gray-400 text-[10px] font-bold uppercase mb-4 pl-2">Evolução de Lucro</h3>
         <div className="w-full h-full overflow-x-auto pb-6">
            <div style={{ minWidth: chartData.length > 10 ? '600px' : '100%' }} className="h-full">
                <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#333" />
                    <XAxis dataKey="date" stroke="#666" fontSize={10} tickLine={false} axisLine={false} />
                    <Tooltip content={<CustomTooltip />} cursor={{stroke: '#ffffff20'}} />
                    <Line 
                        type="monotone" 
                        dataKey="profit" 
                        stroke="#FFFFFF" 
                        strokeWidth={3} 
                        dot={{r: 4, fill: '#1A1A1A', stroke: '#FFFFFF', strokeWidth: 2}} 
                        activeDot={{r: 6, fill: '#FFFFFF'}}
                    />
                </LineChart>
                </ResponsiveContainer>
            </div>
         </div>
      </div>
    </div>
  );

  const InvestmentView = () => (
    <div className="animate-fade-in space-y-6 pb-20">
      <div className="bg-[#1A1A1A] p-6 rounded-[2rem] border border-white/5 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-neonBlue/10 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none"></div>
        <span className="text-neonBlue text-[10px] font-bold uppercase tracking-wider block mb-1">Total Investido {timeRange === 'DAILY' ? 'Hoje' : 'no Período'}</span>
        <div className="text-4xl font-bold text-white tracking-tight">{formatCurrency(totals.investments)}</div>
      </div>

      <div className="h-64 w-full bg-[#1A1A1A] p-4 rounded-[2rem] border border-white/5">
         <h3 className="text-gray-400 text-[10px] font-bold uppercase mb-4 pl-2">Aportes Realizados</h3>
         <div className="w-full h-full overflow-x-auto pb-6">
            <div style={{ minWidth: chartData.length > 10 ? '600px' : '100%' }} className="h-full">
                <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#333" />
                    <XAxis dataKey="date" stroke="#666" fontSize={10} tickLine={false} axisLine={false} />
                    <Tooltip content={<CustomTooltip />} cursor={{fill: '#ffffff05'}} />
                    <Bar dataKey="investment" fill="#00BFFF" radius={[4, 4, 0, 0]} />
                </BarChart>
                </ResponsiveContainer>
            </div>
         </div>
      </div>

      <TransactionList data={filteredData} typeFilter="INVESTMENT" />
    </div>
  );

  // --- MAIN RENDER ---
  
  const renderContent = () => {
    switch (currentView) {
        case 'REVENUE': return <RevenueView />;
        case 'EXPENSES': return <ExpenseView />;
        case 'PROFIT': return <ProfitView />;
        case 'INVESTMENTS': return <InvestmentView />;
        default: return null;
    }
  };

  if (currentView === 'MAIN') {
      return (
        <div className="animate-fade-in max-w-4xl mx-auto pb-20">
            <button onClick={onBack} className="flex items-center text-graySub hover:text-white mb-6 transition-colors">
                <ArrowLeft className="w-5 h-5 mr-2" /> 
                <span className="text-sm font-medium">Voltar para Dashboard</span>
            </button>
            
            <Header title="Relatórios" subtitle="Inteligência para o seu negócio" icon={BarChart3} />

            <div className="space-y-4">
                {/* Card Faturamento */}
                <div 
                    onClick={() => setCurrentView('REVENUE')}
                    className="group bg-[#1A1A1A] p-6 rounded-[2rem] border border-white/5 relative overflow-hidden cursor-pointer active:scale-[0.98] transition-transform"
                >
                    <div className="absolute top-0 right-0 w-32 h-32 bg-neonGreen/10 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none transition-opacity group-hover:opacity-100 opacity-50"></div>
                    <div className="relative z-10 flex justify-between items-center">
                        <div>
                             <div className="w-10 h-10 rounded-xl bg-neonGreen/10 flex items-center justify-center text-neonGreen mb-4 border border-neonGreen/20">
                                <TrendingUp size={20} />
                            </div>
                            <h3 className="text-lg font-bold text-white">Faturamento</h3>
                            <p className="text-xs text-gray-500 mt-1">Análise detalhada de vendas</p>
                        </div>
                        <div className="h-8 w-8 rounded-full bg-white/5 flex items-center justify-center text-gray-400">
                             <ChevronDown className="-rotate-90 w-4 h-4" />
                        </div>
                    </div>
                </div>

                {/* Card Gastos */}
                <div 
                    onClick={() => setCurrentView('EXPENSES')}
                    className="group bg-[#1A1A1A] p-6 rounded-[2rem] border border-white/5 relative overflow-hidden cursor-pointer active:scale-[0.98] transition-transform"
                >
                    <div className="absolute top-0 right-0 w-32 h-32 bg-red-500/10 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none transition-opacity group-hover:opacity-100 opacity-50"></div>
                    <div className="relative z-10 flex justify-between items-center">
                        <div>
                             <div className="w-10 h-10 rounded-xl bg-red-500/10 flex items-center justify-center text-red-500 mb-4 border border-red-500/20">
                                <TrendingDown size={20} />
                            </div>
                            <h3 className="text-lg font-bold text-white">Gastos</h3>
                            <p className="text-xs text-gray-500 mt-1">Categorias e evolução de custos</p>
                        </div>
                        <div className="h-8 w-8 rounded-full bg-white/5 flex items-center justify-center text-gray-400">
                             <ChevronDown className="-rotate-90 w-4 h-4" />
                        </div>
                    </div>
                </div>

                 {/* Card Lucro */}
                 <div 
                    onClick={() => setCurrentView('PROFIT')}
                    className="group bg-[#1A1A1A] p-6 rounded-[2rem] border border-white/5 relative overflow-hidden cursor-pointer active:scale-[0.98] transition-transform shadow-[0_4px_20px_rgba(0,0,0,0.3)]"
                >
                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none transition-opacity group-hover:opacity-100 opacity-50"></div>
                    <div className="relative z-10 flex justify-between items-center">
                        <div>
                             <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-white mb-4 border border-white/20">
                                <DollarSign size={20} />
                            </div>
                            <h3 className="text-lg font-bold text-white">Lucro Líquido</h3>
                            <p className="text-xs text-gray-500 mt-1">O resultado real do seu bolso</p>
                        </div>
                        <div className="h-8 w-8 rounded-full bg-white/5 flex items-center justify-center text-gray-400">
                             <ChevronDown className="-rotate-90 w-4 h-4" />
                        </div>
                    </div>
                </div>

                {/* Card Investimentos (Novo) */}
                <div 
                    onClick={() => setCurrentView('INVESTMENTS')}
                    className="group bg-[#1A1A1A] p-6 rounded-[2rem] border border-white/5 relative overflow-hidden cursor-pointer active:scale-[0.98] transition-transform"
                >
                    <div className="absolute top-0 right-0 w-32 h-32 bg-neonBlue/10 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none transition-opacity group-hover:opacity-100 opacity-50"></div>
                    <div className="relative z-10 flex justify-between items-center">
                        <div>
                             <div className="w-10 h-10 rounded-xl bg-neonBlue/10 flex items-center justify-center text-neonBlue mb-4 border border-neonBlue/20">
                                <PiggyBank size={20} />
                            </div>
                            <h3 className="text-lg font-bold text-white">Investimentos</h3>
                            <p className="text-xs text-gray-500 mt-1">Acompanhe seus aportes</p>
                        </div>
                        <div className="h-8 w-8 rounded-full bg-white/5 flex items-center justify-center text-gray-400">
                             <ChevronDown className="-rotate-90 w-4 h-4" />
                        </div>
                    </div>
                </div>
            </div>
        </div>
      );
  }

  // Se for uma Sub-View
  return (
    <div className="animate-fade-in max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-6">
            <button onClick={() => setCurrentView('MAIN')} className="flex items-center text-graySub hover:text-white transition-colors">
                <ArrowLeft className="w-5 h-5 mr-2" /> 
                <span className="text-sm font-medium">Voltar para Relatórios</span>
            </button>
        </div>
        
        <div className="mb-6">
            <h1 className="text-2xl font-bold text-white tracking-tight">
                {currentView === 'REVENUE' && 'Relatório de Faturamento'}
                {currentView === 'EXPENSES' && 'Relatório de Gastos'}
                {currentView === 'PROFIT' && 'Relatório de Lucro'}
                {currentView === 'INVESTMENTS' && 'Relatório de Investimentos'}
            </h1>
        </div>

        <TimeFilter />
        {renderContent()}
    </div>
  );
};

export default Reports;