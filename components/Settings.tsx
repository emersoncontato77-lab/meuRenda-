import React, { useState } from 'react';
import { ArrowLeft, Trash2, AlertTriangle, ShieldAlert, Database, RefreshCcw } from 'lucide-react';
import { useApp } from '../context';
import { Header, Card } from './Shared';

type ActionType = 'CLEAR_SALES' | 'CLEAR_EXPENSES' | 'CLEAR_INVESTMENTS' | 'CLEAR_GOALS' | 'RESET_ALL' | null;

export const Settings: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const { clearTransactionsByType, clearGoals, resetApp } = useApp();
  const [confirmModal, setConfirmModal] = useState<ActionType>(null);

  const handleAction = () => {
    switch (confirmModal) {
      case 'CLEAR_SALES':
        clearTransactionsByType('INCOME');
        break;
      case 'CLEAR_EXPENSES':
        clearTransactionsByType('EXPENSE');
        break;
      case 'CLEAR_INVESTMENTS':
        clearTransactionsByType('INVESTMENT');
        break;
      case 'CLEAR_GOALS':
        clearGoals();
        break;
      case 'RESET_ALL':
        resetApp();
        break;
    }
    setConfirmModal(null);
  };

  const getModalContent = () => {
    switch (confirmModal) {
      case 'CLEAR_SALES': return { title: 'Apagar Vendas?', desc: 'Isso removerá todo o histórico de faturamento registrado. Essa ação não pode ser desfeita.' };
      case 'CLEAR_EXPENSES': return { title: 'Apagar Gastos?', desc: 'Todos os gastos registrados serão removidos permanentemente.' };
      case 'CLEAR_INVESTMENTS': return { title: 'Apagar Investimentos?', desc: 'Seu histórico de aportes será excluído permanentemente.' };
      case 'CLEAR_GOALS': return { title: 'Apagar Metas?', desc: 'Todas as metas configuradas serão perdidas.' };
      case 'RESET_ALL': return { title: 'ZERAR APLICATIVO?', desc: 'ATENÇÃO: Isso apagará TUDO (Vendas, Gastos, Investimentos e Metas). O app voltará ao estado inicial.' };
      default: return { title: '', desc: '' };
    }
  };

  const ActionButton = ({ 
    icon: Icon, 
    label, 
    desc, 
    onClick, 
    variant = 'default' 
  }: { 
    icon: any, 
    label: string, 
    desc: string, 
    onClick: () => void, 
    variant?: 'default' | 'danger' 
  }) => (
    <button 
      onClick={onClick}
      className={`w-full flex items-center justify-between p-4 rounded-2xl border transition-all active:scale-[0.98] group ${
        variant === 'danger' 
          ? 'bg-red-500/5 border-red-500/20 hover:bg-red-500/10' 
          : 'bg-[#1A1A1A] border-white/5 hover:bg-white/10'
      }`}
    >
      <div className="flex items-center gap-4">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
          variant === 'danger' ? 'bg-red-500/10 text-red-500' : 'bg-white/5 text-gray-400 group-hover:text-white'
        }`}>
          <Icon size={20} />
        </div>
        <div className="text-left">
          <span className={`block font-bold text-sm ${variant === 'danger' ? 'text-red-400' : 'text-white'}`}>{label}</span>
          <span className="text-[10px] text-gray-500">{desc}</span>
        </div>
      </div>
      <div className={`p-2 rounded-full ${variant === 'danger' ? 'text-red-500' : 'text-gray-600 group-hover:text-white'}`}>
        <Trash2 size={16} />
      </div>
    </button>
  );

  return (
    <div className="animate-fade-in pb-10 relative">
      <button onClick={onBack} className="flex items-center text-graySub hover:text-white mb-6 transition-colors">
        <ArrowLeft className="w-5 h-5 mr-2" /> 
        <span className="text-sm font-medium">Voltar</span>
      </button>

      <Header title="Gerenciar Dados" subtitle="Limpeza e manutenção do app" icon={Database} />

      <div className="space-y-6">
        <div className="space-y-3">
            <h3 className="text-[10px] font-bold text-gray-500 uppercase tracking-wider ml-2">Limpeza Parcial</h3>
            
            <ActionButton 
                icon={RefreshCcw} 
                label="Apagar Vendas" 
                desc="Zera seu histórico de faturamento"
                onClick={() => setConfirmModal('CLEAR_SALES')}
            />
            
            <ActionButton 
                icon={RefreshCcw} 
                label="Apagar Gastos" 
                desc="Remove todas as despesas lançadas"
                onClick={() => setConfirmModal('CLEAR_EXPENSES')}
            />

            <ActionButton 
                icon={RefreshCcw} 
                label="Apagar Investimentos" 
                desc="Remove registros de aplicações"
                onClick={() => setConfirmModal('CLEAR_INVESTMENTS')}
            />

            <ActionButton 
                icon={RefreshCcw} 
                label="Apagar Metas" 
                desc="Reseta objetivos mensais/semanais"
                onClick={() => setConfirmModal('CLEAR_GOALS')}
            />
        </div>

        <div className="space-y-3 pt-4 border-t border-white/5">
            <h3 className="text-[10px] font-bold text-red-500 uppercase tracking-wider ml-2 flex items-center gap-2">
                <ShieldAlert size={12} /> Zona de Perigo
            </h3>
            
            <ActionButton 
                icon={AlertTriangle} 
                label="ZERAR APLICATIVO" 
                desc="Apaga absolutamente tudo. Irreversível."
                onClick={() => setConfirmModal('RESET_ALL')}
                variant="danger"
            />
        </div>
      </div>

      {/* Confirmation Modal */}
      {confirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setConfirmModal(null)}></div>
            <div className="bg-[#1A1A1A] border border-white/10 rounded-[2rem] p-6 w-full max-w-sm relative z-10 animate-scale-in shadow-2xl">
                <div className="w-14 h-14 rounded-full bg-red-500/10 flex items-center justify-center mx-auto mb-4 border border-red-500/20">
                    <AlertTriangle className="text-red-500 w-7 h-7" />
                </div>
                
                <h3 className="text-xl font-bold text-white text-center mb-2">{getModalContent().title}</h3>
                <p className="text-sm text-gray-400 text-center mb-8 leading-relaxed">
                    {getModalContent().desc}
                </p>

                <div className="grid grid-cols-2 gap-3">
                    <button 
                        onClick={() => setConfirmModal(null)}
                        className="h-12 rounded-xl bg-white/5 text-white font-medium hover:bg-white/10 transition-colors text-sm"
                    >
                        Cancelar
                    </button>
                    <button 
                        onClick={handleAction}
                        className="h-12 rounded-xl bg-red-500 text-white font-bold hover:bg-red-600 transition-colors shadow-lg shadow-red-500/20 text-sm"
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