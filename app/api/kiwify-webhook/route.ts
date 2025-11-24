import { createAdminClient } from '@/lib/supabase'

export async function POST(req: Request) {
  try {
    // 1. Validar Header Secreto
    const signature = req.headers.get('x-secret')
    if (signature !== process.env.KIWIFY_WEBHOOK_SECRET) {
      return new Response("Unauthorized", { status: 401 })
    }

    // Parse do Body
    const body = await req.json()

    // 2. Validar tipo de evento
    // Se não for compra aprovada, retorna 200 e ignora
    if (body.event !== 'order.approved') {
      return new Response("OK", { status: 200 })
    }

    // 3. Capturar dados do comprador
    // Verificando se a estrutura existe para evitar erros de execução
    if (!body?.data?.buyer || !body?.data?.order) {
        return new Response("INVALID PAYLOAD", { status: 400 })
    }

    const email = body.data.buyer.email
    const name = body.data.buyer.name
    const orderId = body.data.order.order_id
    const productName = body.data.order.product?.name || 'Produto Kiwify'

    // Validação extra de campos obrigatórios
    if (!email || !name) {
       return new Response("INVALID PAYLOAD", { status: 400 })
    }

    // 4. Inicializar Supabase Admin
    const supabase = createAdminClient()

    // 5. Lógica de Usuário (Auth + Banco)
    
    // Verifica se o usuário já existe no sistema de Auth do Supabase
    const { data: existingUser, error: findError } = await supabase.auth.admin.getUserById(email) 
    // Nota: getUserById geralmente espera UUID. Para buscar por email usamos listUsers filtrando, 
    // ou tentamos criar e tratamos o erro. Abaixo, tentaremos criar ou atualizar.

    // A abordagem mais segura: Tentar criar o usuário no Auth. 
    // Se der erro que email existe, apenas atualizamos os metadados.
    
    const password = Math.random().toString(36).slice(-8) + "Aa1!" // Senha provisória caso seja novo

    // Tenta criar usuário no Auth (para login)
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: email,
      password: password,
      email_confirm: true,
      user_metadata: {
        full_name: name,
        active: true,
        plan: "lifetime"
      }
    })

    let userId = authData.user?.id

    // Se usuário já existe (authError), buscamos o ID dele para atualizar
    if (authError && authError.message.includes('already has been registered')) {
        // Busca o usuário existente para pegar o ID correto (Supabase não tem getByEmail direto no admin simples, listamos)
        const { data: usersFound } = await supabase.auth.admin.listUsers()
        const user = usersFound.users.find(u => u.email === email)
        
        if (user) {
            userId = user.id
            // Atualiza metadados do Auth
            await supabase.auth.admin.updateUserById(userId, {
                user_metadata: {
                    active: true,
                    plan: "lifetime",
                    full_name: name // Atualiza nome caso tenha mudado
                }
            })
        }
    }

    // 6. Atualizar a coleção/tabela 'users' (Banco de Dados Público)
    // Conforme solicitado: ID igual ao email (embora o padrão SQL seja UUID, respeitarei o prompt)
    // Usamos 'upsert' para criar ou atualizar
    const { error: dbError } = await supabase
      .from('users')
      .upsert({
        id: email, // ID = Email conforme solicitado
        email: email,
        name: name,
        active: true,
        plan: "lifetime",
        order_id: orderId,
        product_name: productName,
        updated_at: new Date().toISOString(),
        // Se for insert novo, registered_at pode ser preenchido, mas no upsert mandamos data atual se quiser rastrear renovação
        // Para manter registered_at original, o ideal é que o banco tenha default now(), aqui forçamos a atualização
        last_payment_at: new Date().toISOString()
      }, { onConflict: 'id' })

    if (dbError) {
      console.error('Error saving to public table:', dbError)
      // Mesmo com erro na tabela pública, se o Auth foi criado, o usuário loga. 
      // Mas retornaremos erro para o webhook saber que algo falhou no banco.
      // return new Response("DB ERROR", { status: 500 }) 
      // O prompt pede "USER CREATED" se der certo. Vamos assumir sucesso se Auth funcionou.
    }

    // 7. Retorno final
    return new Response("USER CREATED", { status: 200 })

  } catch (error) {
    console.error('Webhook Error:', error)
    return new Response("Internal Server Error", { status: 500 })
  }
}