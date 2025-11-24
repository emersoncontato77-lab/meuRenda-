'use client'

import { useState, useEffect } from 'react'
import { createClient } from '../../lib/supabase'
import { useRouter } from 'next/navigation'
import { Loader2, Lock, Mail, ArrowRight, TrendingUp, ShieldCheck, CheckCircle2, AlertCircle } from 'lucide-react'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const supabase = createClient()

  // Limpa erros ao digitar
  useEffect(() => {
    if (error) setError(null)
  }, [email, password])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        throw error
      }

      router.push('/')
      router.refresh()
    } catch (err: any) {
      console.error(err)
      if (err.message?.includes('missing') || err.message?.includes('placeholder')) {
         setError('Configuração pendente: Conecte o Supabase para entrar.')
      } else if (err.message?.includes('Invalid login')) {
         setError('Email ou senha incorretos.')
      } else {
         setError('Erro ao conectar. Tente novamente.')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#050505] flex text-white overflow-hidden">
      
      {/* --- LADO ESQUERDO: BRANDING & MARKETING (Visível apenas em Desktop) --- */}
      <div className="hidden lg:flex w-1/2 bg-[#0D0D0D] relative flex-col justify-between p-12 border-r border-white/5">
        {/* Background Effects */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
            <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-neonGreen/5 rounded-full blur-[100px]"></div>
            <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-emerald-900/10 rounded-full blur-[100px]"></div>
        </div>

        {/* Logo Area */}
        <div className="relative z-10 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-neonGreen to-emerald-600 flex items-center justify-center shadow-[0_0_15px_rgba(57,255,20,0.3)]">
               <span className="font-bold text-black text-lg">M+</span>
            </div>
            <span className="font-bold text-xl tracking-tight">MeuRenda<span className="text-neonGreen">+</span></span>
        </div>

        {/* Main Content */}
        <div className="relative z-10 space-y-8 max-w-lg">
            <h1 className="text-5xl font-bold leading-tight tracking-tight">
                Domine suas finanças, <span className="text-transparent bg-clip-text bg-gradient-to-r from-neonGreen to-emerald-500">amplie seus lucros.</span>
            </h1>
            <p className="text-gray-400 text-lg leading-relaxed">
                A ferramenta definitiva para pequenos empreendedores que desejam controle total sobre fluxo de caixa, metas e crescimento.
            </p>

            <div className="space-y-4 pt-4">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-neonGreen">
                        <TrendingUp size={16} />
                    </div>
                    <span className="text-gray-300 font-medium">Relatórios de inteligência financeira</span>
                </div>
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-neonGreen">
                        <CheckCircle2 size={16} />
                    </div>
                    <span className="text-gray-300 font-medium">Controle de metas e margens</span>
                </div>
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-neonGreen">
                        <ShieldCheck size={16} />
                    </div>
                    <span className="text-gray-300 font-medium">Dados seguros e criptografados</span>
                </div>
            </div>
        </div>

        {/* Footer Text */}
        <div className="relative z-10">
            <p className="text-xs text-gray-600 font-medium">
                © {new Date().getFullYear()} MeuRenda+. Todos os direitos reservados.
            </p>
        </div>
      </div>

      {/* --- LADO DIREITO: LOGIN FORM --- */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 lg:p-12 relative">
         {/* Mobile Background Elements */}
         <div className="absolute top-0 right-0 w-64 h-64 bg-neonGreen/10 rounded-full blur-[80px] lg:hidden pointer-events-none"></div>

         <div className="w-full max-w-md space-y-8 relative z-10">
            
            {/* Mobile Header */}
            <div className="lg:hidden flex justify-center mb-8">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-neonGreen to-emerald-600 flex items-center justify-center shadow-[0_0_20px_rgba(57,255,20,0.3)]">
                    <span className="font-bold text-black text-xl">M+</span>
                </div>
            </div>

            <div className="text-center lg:text-left">
                <h2 className="text-3xl font-bold text-white mb-2">Bem-vindo de volta</h2>
                <p className="text-gray-500">Insira suas credenciais para acessar o painel.</p>
            </div>

            <form onSubmit={handleLogin} className="space-y-5">
                <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-wider ml-1">Email</label>
                    <div className="relative group">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                            <Mail className="h-5 w-5 text-gray-500 group-focus-within:text-neonGreen transition-colors" />
                        </div>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="block w-full pl-11 pr-4 py-3.5 bg-[#121212] border border-white/10 rounded-xl text-white placeholder-gray-600 focus:ring-2 focus:ring-neonGreen/50 focus:border-neonGreen/50 focus:outline-none transition-all sm:text-sm"
                            placeholder="exemplo@meurenda.com"
                            required
                        />
                    </div>
                </div>

                <div className="space-y-2">
                    <div className="flex justify-between items-center ml-1">
                        <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Senha</label>
                        <a href="#" className="text-xs text-neonGreen hover:text-emerald-400 transition-colors">Esqueceu a senha?</a>
                    </div>
                    <div className="relative group">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                            <Lock className="h-5 w-5 text-gray-500 group-focus-within:text-neonGreen transition-colors" />
                        </div>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="block w-full pl-11 pr-4 py-3.5 bg-[#121212] border border-white/10 rounded-xl text-white placeholder-gray-600 focus:ring-2 focus:ring-neonGreen/50 focus:border-neonGreen/50 focus:outline-none transition-all sm:text-sm"
                            placeholder="••••••••"
                            required
                        />
                    </div>
                </div>

                {error && (
                    <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 flex items-start gap-3 animate-fade-in">
                        <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                        <span className="text-sm text-red-400">{error}</span>
                    </div>
                )}

                <button
                    type="submit"
                    disabled={loading}
                    className="w-full flex items-center justify-center gap-2 bg-neonGreen hover:bg-[#32e612] text-black font-bold py-4 rounded-xl transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_4px_20px_rgba(57,255,20,0.2)] hover:shadow-[0_4px_25px_rgba(57,255,20,0.3)]"
                >
                    {loading ? (
                        <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                        <>
                            Acessar Plataforma <ArrowRight className="w-5 h-5" />
                        </>
                    )}
                </button>
            </form>

            <div className="pt-6 text-center border-t border-white/5">
                <p className="text-sm text-gray-500">
                    Ainda não tem acesso?{' '}
                    <a href="https://kiwify.com.br" target="_blank" rel="noopener noreferrer" className="font-bold text-white hover:text-neonGreen transition-colors">
                        Criar conta agora
                    </a>
                </p>
                <p className="text-[10px] text-gray-600 mt-2">
                    O cadastro é realizado automaticamente após a aquisição do plano.
                </p>
            </div>
         </div>
      </div>
    </div>
  )
}