'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
// @ts-ignore
import { registerUser, loginUser, checkPayment } from '@/lib/auth';
import { Loader2, CheckCircle2, AlertCircle, Lock, Mail } from 'lucide-react';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'error' | 'success', text: string } | null>(null);
  const router = useRouter();

  const handleAction = async (action: 'LOGIN' | 'REGISTER') => {
    setLoading(true);
    setMessage(null);

    try {
      if (action === 'REGISTER') {
        // Fluxo de Registro
        await registerUser(email, password);
        setMessage({ type: 'success', text: 'Conta criada com sucesso! Faça login para continuar.' });
        setLoading(false);
      } else {
        // Fluxo de Login
        await loginUser(email, password);
        
        // Verificar Pagamento
        // checkPayment retorna true se pago.
        // Se false, ela mesma redireciona para o checkout.
        const isPaid = await checkPayment(email);
        
        if (isPaid) {
          router.push('/'); // Redireciona para Home se estiver pago
        }
      }
    } catch (error: any) {
      let errorMsg = 'Ocorreu um erro inesperado.';
      if (error.code === 'auth/invalid-credential' || error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password') {
        errorMsg = 'Email ou senha incorretos.';
      } else if (error.code === 'auth/email-already-in-use') {
        errorMsg = 'Este email já está cadastrado.';
      } else if (error.code === 'auth/weak-password') {
        errorMsg = 'A senha deve ter pelo menos 6 caracteres.';
      }
      
      console.error(error);
      setMessage({ type: 'error', text: errorMsg });
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0D0D0D] flex items-center justify-center p-4">
      
      <div className="w-full max-w-md bg-[#1A1A1A] border border-white/5 rounded-3xl p-8 shadow-2xl relative overflow-hidden">
        
        {/* Efeito de Fundo */}
        <div className="absolute top-0 right-0 w-40 h-40 bg-neonGreen/5 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none"></div>

        <div className="relative z-10">
          {/* Cabeçalho */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-neonGreen/10 text-neonGreen mb-4 border border-neonGreen/20 shadow-[0_0_15px_rgba(57,255,20,0.2)]">
              <span className="font-bold text-xl">M+</span>
            </div>
            <h1 className="text-2xl font-bold text-white tracking-tight">Login MeuRenda+</h1>
            <p className="text-gray-500 text-sm mt-2">Acesse seu painel de controle financeiro</p>
          </div>

          {/* Feedback de Mensagem */}
          {message && (
            <div className={`mb-6 p-4 rounded-xl flex items-start gap-3 text-sm font-medium animate-fade-in ${
              message.type === 'error' 
                ? 'bg-red-500/10 border border-red-500/20 text-red-400' 
                : 'bg-neonGreen/10 border border-neonGreen/20 text-neonGreen'
            }`}>
              {message.type === 'error' ? <AlertCircle size={18} className="mt-0.5 shrink-0" /> : <CheckCircle2 size={18} className="mt-0.5 shrink-0" />}
              <span>{message.text}</span>
            </div>
          )}

          {/* Formulário */}
          <div className="space-y-4">
            
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider ml-1">Email</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-600" />
                </div>
                <input 
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full h-12 bg-[#050505] border border-white/10 rounded-xl pl-11 pr-4 text-white placeholder-gray-600 focus:outline-none focus:border-neonGreen/50 focus:ring-1 focus:ring-neonGreen/50 transition-all"
                  placeholder="seu@email.com"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider ml-1">Senha</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-600" />
                </div>
                <input 
                  type="password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full h-12 bg-[#050505] border border-white/10 rounded-xl pl-11 pr-4 text-white placeholder-gray-600 focus:outline-none focus:border-neonGreen/50 focus:ring-1 focus:ring-neonGreen/50 transition-all"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <div className="pt-4 flex flex-col gap-3">
              <button
                onClick={() => handleAction('LOGIN')}
                disabled={loading}
                className="w-full h-12 bg-neonGreen text-black font-bold rounded-xl hover:bg-[#32e612] transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-[0_4px_20px_rgba(57,255,20,0.2)]"
              >
                {loading ? <Loader2 className="animate-spin" size={20} /> : 'Entrar'}
              </button>
              
              <button
                onClick={() => handleAction('REGISTER')}
                disabled={loading}
                className="w-full h-12 bg-white/5 text-white font-bold rounded-xl hover:bg-white/10 border border-white/10 transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Registrar
              </button>
            </div>

          </div>
        </div>

        <div className="mt-8 text-center border-t border-white/5 pt-6">
           <p className="text-[10px] text-gray-600">Protegido por Firebase Authentication</p>
        </div>

      </div>
    </div>
  );
}