'use client'

import { useState } from 'react'
import { createClient } from '../../lib/supabase'
import { useRouter } from 'next/navigation'
import { Loader2, Lock, Mail, ArrowRight } from 'lucide-react'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const supabase = createClient()

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
      setError('Credenciais inválidas. Verifique seu email e senha.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#0D0D0D] flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-[#1A1A1A] rounded-[2rem] border border-white/5 shadow-2xl p-8 relative overflow-hidden">
        
        {/* Decorative Blur */}
        <div className="absolute top-0 right-0 w-40 h-40 bg-neonGreen/10 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none"></div>

        <div className="relative z-10">
          <div className="flex justify-center mb-8">
            <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-neonGreen to-emerald-600 flex items-center justify-center shadow-[0_0_20px_rgba(57,255,20,0.3)]">
               <span className="font-bold text-black text-xl">M+</span>
            </div>
          </div>

          <h1 className="text-2xl font-bold text-white text-center mb-2">Bem-vindo de volta</h1>
          <p className="text-gray-500 text-sm text-center mb-8">Acesse seu painel de controle financeiro</p>

          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <label className="text-[10px] text-gray-500 font-bold uppercase tracking-wider ml-1">Email</label>
              <div className="relative">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-[#0D0D0D] border border-white/10 rounded-xl h-12 pl-12 pr-4 text-white focus:outline-none focus:border-neonGreen/50 focus:ring-1 focus:ring-neonGreen/50 transition-all"
                  placeholder="seu@email.com"
                  required
                />
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-600" />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] text-gray-500 font-bold uppercase tracking-wider ml-1">Senha</label>
              <div className="relative">
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-[#0D0D0D] border border-white/10 rounded-xl h-12 pl-12 pr-4 text-white focus:outline-none focus:border-neonGreen/50 focus:ring-1 focus:ring-neonGreen/50 transition-all"
                  placeholder="••••••••"
                  required
                />
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-600" />
              </div>
            </div>

            {error && (
              <div className="bg-red-500/10 border border-red-500/20 text-red-500 text-xs p-3 rounded-xl flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse"></div>
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-neonGreen text-black h-12 rounded-xl font-bold text-sm tracking-wide hover:bg-[#32e612] transition-all flex items-center justify-center gap-2 active:scale-[0.98] mt-6 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  Entrar no App <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-white/5 text-center">
            <p className="text-xs text-gray-600">
              Não tem acesso? <a href="#" className="text-neonGreen hover:underline">Adquira o MeuRenda+</a>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}