import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  // Neste momento, estamos migrando para autenticação via Firebase no cliente.
  // Desativamos o bloqueio de middleware do Supabase para permitir acesso às rotas
  // enquanto a autenticação é gerenciada pelo app/login/page.tsx e lib/auth.js.
  
  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
}