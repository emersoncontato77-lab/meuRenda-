import React, { useState } from 'react';
import { ArrowLeft, Calculator, DollarSign, Percent, TrendingUp, AlertCircle, Info } from 'lucide-react';
import { Button, Card, Header, Input } from './Shared';
import { formatCurrency } from '../utils';

export const Pricing: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const [cost, setCost] = useState('');
  const [margin, setMargin] = useState('');

  const costNum = parseFloat(cost) || 0;
  const marginNum = parseFloat(margin) || 0;

  // Formula: Price = Cost / (1 - (Margin / 100))
  // Example: Cost 10, Margin 50%. Price = 10 / (1 - 0.5) = 10 / 0.5 = 20.
  const sellingPrice = marginNum < 100 && marginNum >= 0 && costNum > 0 
    ? costNum / (1 - marginNum / 100) 
    : 0;
  
  const estimatedProfit = sellingPrice - costNum;
  // Real Margin Verification: (Profit / Price) * 100
  const realMargin = sellingPrice > 0 ? (estimatedProfit / sellingPrice) * 100 : 0;

  return (
    <div className="animate-fade-in pb-10">
      {/* Custom Header for this flow */}
      <div className="flex items-center gap-4 mb-8">
          <button onClick={onBack} className="w-10 h-10 rounded-full bg-[#1A1A1A] border border-white/5 flex items-center justify-center active:scale-95 transition-transform text-gray-400 hover:text-white">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-xl font-bold text-white leading-none">Precificação</h1>
            <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">Calculadora Inteligente</span>
          </div>
      </div>

      <div className="grid gap-6">
        <Card>
            <div className="space-y-4">
                <Input
                    label="Custo do Produto"
                    type="number"
                    placeholder="0,00"
                    value={cost}
                    onChange={(e) => setCost(e.target.value)}
                    icon={<span className="text-neonGreen font-bold text-sm">R$</span>}
                />
                <Input
                    label="Margem Desejada (%)"
                    type="number"
                    placeholder="Ex: 50"
                    value={margin}
                    onChange={(e) => setMargin(e.target.value)}
                    icon={<Percent className="w-4 h-4 text-gray-400" />}
                />
            </div>
            <div className="mt-4 flex gap-2 items-start bg-[#0D0D0D] p-3 rounded-xl border border-white/5">
                <Info className="w-4 h-4 text-gray-500 mt-0.5 shrink-0" />
                <p className="text-[10px] text-gray-400 leading-tight">
                    O cálculo considera a margem sobre o preço final de venda, não apenas sobre o custo (Markup).
                </p>
            </div>
        </Card>

        {sellingPrice > 0 ? (
            <div className="space-y-4 animate-slide-up">
                {/* Result Hero Card */}
                <div className="bg-[#1A1A1A] rounded-[2rem] p-8 border border-neonGreen/30 shadow-[0_0_40px_rgba(57,255,20,0.15)] relative overflow-hidden text-center">
                    <div className="absolute -top-10 -right-10 w-40 h-40 bg-neonGreen/20 blur-3xl rounded-full pointer-events-none"></div>
                    
                    <span className="text-gray-400 text-[10px] font-bold uppercase tracking-[0.2em] block mb-4">Preço Sugerido de Venda</span>
                    <div className="text-[3.5rem] leading-none font-bold text-white mb-6 tracking-tighter">
                        <span className="text-2xl align-top opacity-50 mr-1">R$</span>
                        {new Intl.NumberFormat('pt-BR', { minimumFractionDigits: 2 }).format(sellingPrice)}
                    </div>
                    
                    <div className="flex justify-center">
                        <div className="inline-flex items-center gap-2 bg-neonGreen/10 px-4 py-2 rounded-xl border border-neonGreen/20">
                            <TrendingUp size={16} className="text-neonGreen" />
                            <span className="text-neonGreen text-xs font-bold uppercase tracking-wide">
                                Lucro Líquido: {formatCurrency(estimatedProfit)}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Details Grid */}
                <div className="grid grid-cols-2 gap-3">
                    <div className="bg-[#1A1A1A] rounded-[1.5rem] p-5 border border-white/5 text-center flex flex-col justify-center">
                        <span className="text-gray-500 text-[10px] font-bold uppercase tracking-wider block mb-1">Custo Base</span>
                        <span className="text-white font-bold text-lg">{formatCurrency(costNum)}</span>
                    </div>
                    <div className="bg-[#1A1A1A] rounded-[1.5rem] p-5 border border-white/5 text-center flex flex-col justify-center">
                        <span className="text-gray-500 text-[10px] font-bold uppercase tracking-wider block mb-1">Margem Real</span>
                        <span className="text-neonBlue font-bold text-lg">{realMargin.toFixed(1)}%</span>
                    </div>
                </div>
            </div>
        ) : (
            <div className="flex flex-col items-center justify-center py-12 opacity-30 gap-4">
                <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center">
                    <Calculator className="w-8 h-8 text-white" strokeWidth={1.5} />
                </div>
                <p className="text-white text-sm font-medium">Preencha os campos para calcular</p>
            </div>
        )}
      </div>
    </div>
  );
};