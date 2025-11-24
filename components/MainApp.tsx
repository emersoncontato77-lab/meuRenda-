import React, { useState, useEffect } from 'react';
import { LayoutDashboard, Target, BarChart3, Calculator, TrendingUp, TrendingDown, Settings as SettingsIcon, LogOut } from 'lucide-react';
import Dashboard from './Dashboard';
import TransactionForm, { ExpenseByCategory } from './TransactionForms';
import Goals from './Goals';
import Reports from './Reports';
import { Pricing } from './Pricing';
import { Settings } from './Settings';
import { ViewState } from '../types';
import { createClient } from '../lib/supabase';
import { useRouter } from 'next/navigation';

const MainApp: React.FC = () => {
  const [currentView, setCurrentView] = useState<ViewState>('dashboard');
  const router = useRouter();
  const supabase = createClient();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/login');
    router.refresh();
  };

  const renderView = () => {
    switch (currentView) {
      case 'dashboard':
        return <Dashboard onNavigate={setCurrentView} />;
      case 'new-sale':
        return <TransactionForm type="INCOME" title="Nova Venda" onBack={() => setCurrentView('dashboard')} />;
      case 'new-expense':
        return (
            <div className="space-y-6">
                 <TransactionForm type="EXPENSE" title="Novo Gasto" onBack={() => setCurrentView('dashboard')} />
                 <div className="text-center">
                    <button onClick={() => setCurrentView('category-expenses')} className="text-neonBlue text-sm hover:underline">
                        Ver gastos por categoria
                    </button>
                 </div>
            </div>
        );
      case 'new-investment':
        return <TransactionForm type="INVESTMENT" title="Novo Investimento" onBack={() => setCurrentView('dashboard')} />;
      case 'category-expenses':
        return <ExpenseByCategory onBack={() => setCurrentView('new-expense')} />;
      case 'goals':
        return <Goals onBack={() => setCurrentView('dashboard')} />;
      case 'reports':
        return <Reports onBack={() => setCurrentView('dashboard')} />;
      case 'pricing':
        return <Pricing onBack={() => setCurrentView('dashboard')} />;
      case 'settings':
        return <Settings onBack={() => setCurrentView('dashboard')} />;
      default:
        return <Dashboard onNavigate={setCurrentView} />;
    }
  };

  return (
    <div className="min-h-screen bg-black flex justify-center items-start md:py-8 font-sans">
      <div className="w-full max-w-md bg-[#0D0D0D] md:rounded-[2.5rem] md:shadow-2xl md:border-[8px] md:border-[#1a1a1a] min-h-screen md:min-h-[850px] md:max-h-[900px] relative overflow-hidden flex flex-col selection:bg-neonGreen selection:text-black">
        
        {/* App Header */}
        <header className="px-6 pt-8 pb-4 bg-[#0D0D0D]/95 backdrop-blur-md z-40 flex justify-between items-center sticky top-0 border-b border-white/5">
          <div className="flex items-center gap-3" onClick={() => setCurrentView('dashboard')}>
            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-neonGreen to-emerald-600 flex items-center justify-center shadow-[0_0_15px_rgba(57,255,20,0.3)]">
               <span className="font-bold text-black text-sm">M+</span>
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-lg leading-none text-white">
                MeuRenda<span className="text-neonGreen">+</span>
              </span>
              <span className="text-[10px] text-gray-400 font-medium tracking-wide">CONTROLE FINANCEIRO</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
             <button 
                onClick={() => setCurrentView('pricing')}
                className="w-10 h-10 rounded-full bg-[#1A1A1A] flex items-center justify-center border border-white/5 hover:bg-white/10 transition-colors text-purple-500"
                title="Calculadora"
            >
                <Calculator className="w-5 h-5" />
            </button>
            <button 
                onClick={() => setCurrentView('settings')}
                className="w-10 h-10 rounded-full bg-[#1A1A1A] flex items-center justify-center border border-white/5 hover:bg-white/10 transition-colors text-gray-400 hover:text-white"
                title="Configurações"
            >
                <SettingsIcon className="w-5 h-5" />
            </button>
            <button 
                onClick={handleLogout}
                className="w-10 h-10 rounded-full bg-[#1A1A1A] flex items-center justify-center border border-white/5 hover:bg-red-500/10 transition-colors text-red-500"
                title="Sair"
            >
                <LogOut className="w-5 h-5" />
            </button>
          </div>
        </header>

        {/* Main Scrollable Area */}
        <main className="flex-1 overflow-y-auto px-5 pt-4 pb-32 scrollbar-hide">
          {renderView()}
        </main>

        {/* Bottom Navigation Bar */}
        <nav className="absolute bottom-0 left-0 right-0 bg-[#161616]/95 backdrop-blur-lg border-t border-white/5 px-2 py-3 z-50 md:rounded-b-[2rem]">
          <div className="flex justify-between items-end px-2">
            
            <button 
              onClick={() => setCurrentView('dashboard')}
              className={`flex flex-col items-center gap-1 w-14 transition-all ${currentView === 'dashboard' ? 'text-white' : 'text-gray-600 hover:text-gray-400'}`}
            >
              <div className={`p-1.5 rounded-xl transition-all ${currentView === 'dashboard' ? 'bg-white/10' : ''}`}>
                 <LayoutDashboard size={20} strokeWidth={currentView === 'dashboard' ? 2.5 : 2} />
              </div>
              <span className="text-[9px] font-bold tracking-wide">Início</span>
            </button>

            <button 
              onClick={() => setCurrentView('new-sale')}
              className={`flex flex-col items-center gap-1 w-14 transition-all ${currentView === 'new-sale' ? 'text-neonGreen' : 'text-gray-600 hover:text-gray-400'}`}
            >
              <div className={`p-1.5 rounded-xl transition-all ${currentView === 'new-sale' ? 'bg-neonGreen/10 shadow-[0_0_10px_rgba(57,255,20,0.2)]' : ''}`}>
                <TrendingUp size={20} strokeWidth={currentView === 'new-sale' ? 2.5 : 2} />
              </div>
              <span className="text-[9px] font-bold tracking-wide">Vendas</span>
            </button>

            <button 
              onClick={() => setCurrentView('new-expense')}
              className={`flex flex-col items-center gap-1 w-14 transition-all ${currentView === 'new-expense' || currentView === 'category-expenses' ? 'text-red-500' : 'text-gray-600 hover:text-gray-400'}`}
            >
              <div className={`p-1.5 rounded-xl transition-all ${currentView === 'new-expense' || currentView === 'category-expenses' ? 'bg-red-500/10 shadow-[0_0_10px_rgba(239,68,68,0.2)]' : ''}`}>
                <TrendingDown size={20} strokeWidth={currentView === 'new-expense' ? 2.5 : 2} />
              </div>
              <span className="text-[9px] font-bold tracking-wide">Gastos</span>
            </button>

            <button 
              onClick={() => setCurrentView('reports')}
              className={`flex flex-col items-center gap-1 w-14 transition-all ${currentView === 'reports' ? 'text-neonBlue' : 'text-gray-600 hover:text-gray-400'}`}
            >
               <div className={`p-1.5 rounded-xl transition-all ${currentView === 'reports' ? 'bg-neonBlue/10 shadow-[0_0_10px_rgba(0,191,255,0.2)]' : ''}`}>
                <BarChart3 size={20} strokeWidth={currentView === 'reports' ? 2.5 : 2} />
              </div>
              <span className="text-[9px] font-bold tracking-wide">Relatórios</span>
            </button>

            <button 
              onClick={() => setCurrentView('goals')}
              className={`flex flex-col items-center gap-1 w-14 transition-all ${currentView === 'goals' ? 'text-orange-500' : 'text-gray-600 hover:text-gray-400'}`}
            >
               <div className={`p-1.5 rounded-xl transition-all ${currentView === 'goals' ? 'bg-orange-500/10 shadow-[0_0_10px_rgba(249,115,22,0.2)]' : ''}`}>
                 <Target size={20} strokeWidth={currentView === 'goals' ? 2.5 : 2} />
              </div>
              <span className="text-[9px] font-bold tracking-wide">Metas</span>
            </button>

          </div>
        </nav>
      </div>
    </div>
  );
};

export default MainApp;