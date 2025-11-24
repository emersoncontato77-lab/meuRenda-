import { createClient } from '@supabase/supabase-js'
import { Resend } from 'resend'
import { NextResponse } from 'next/server'

// Inicializar cliente Admin do Supabase (para criar usuário sem confirmação de email imediata do lado do cliente)
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
)

const resend = new Resend(process.env.RESEND_API_KEY)

export async function POST(request: Request) {
  try {
    const payload = await request.json()

    // 1. Validar Status da Compra (Kiwify envia 'paid' quando aprovado)
    // O payload da Kiwify varia, mas geralmente tem `order_status` ou `status`
    const status = payload.order_status || payload.status
    
    if (status !== 'paid') {
      return NextResponse.json({ message: 'Ignored: Not paid' }, { status: 200 })
    }

    const { email, full_name } = payload.customer || payload.Customer

    if (!email) {
      return NextResponse.json({ message: 'Error: No email provided' }, { status: 400 })
    }

    // 2. Gerar uma senha aleatória segura
    const password = Math.random().toString(36).slice(-8) + Math.random().toString(36).slice(-8).toUpperCase() + "!"

    // 3. Criar usuário no Supabase
    const { data: user, error: createError } = await supabaseAdmin.auth.admin.createUser({
      email: email,
      password: password,
      email_confirm: true, // Já confirma o email pois veio de uma compra paga
      user_metadata: {
        full_name: full_name
      }
    })

    if (createError) {
      // Se usuário já existe, podemos ignorar ou resetar senha (aqui optamos por logar e retornar ok para não falhar o webhook)
      console.error('User creation error (might already exist):', createError)
      return NextResponse.json({ message: 'User processed (or already exists)' }, { status: 200 })
    }

    // 4. Enviar Email com Credenciais via Resend
    await resend.emails.send({
      from: 'MeuRenda+ <acesso@seudominio.com>', // Configure seu domínio no Resend
      to: [email],
      subject: 'Seu Acesso ao MeuRenda+ Chegou! 🚀',
      html: `
        <div style="font-family: sans-serif; color: #333; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #000;">Bem-vindo ao MeuRenda+!</h1>
          <p>Olá, <strong>${full_name}</strong>!</p>
          <p>Sua compra foi confirmada e sua conta já está pronta.</p>
          <p>Aqui estão seus dados de acesso:</p>
          
          <div style="background: #f4f4f5; padding: 20px; border-radius: 10px; margin: 20px 0;">
            <p style="margin: 0;"><strong>Login:</strong> ${email}</p>
            <p style="margin: 10px 0 0 0;"><strong>Senha Temporária:</strong> ${password}</p>
          </div>

          <p>Acesse agora:</p>
          <a href="${process.env.NEXT_PUBLIC_APP_URL}/login" style="background: #39FF14; color: #000; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">
            Acessar Plataforma
          </a>

          <p style="font-size: 12px; color: #666; margin-top: 40px;">
            Recomendamos que você altere sua senha após o primeiro acesso.
          </p>
        </div>
      `
    })

    return NextResponse.json({ message: 'Success' }, { status: 200 })

  } catch (error) {
    console.error('Webhook Error:', error)
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 })
  }
}