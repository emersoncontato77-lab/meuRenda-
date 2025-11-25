import { db } from '@/lib/firebaseConfig';
import { doc, setDoc } from 'firebase/firestore/lite';

export async function POST(req: Request) {
  try {
    // 1. Validar Header Secreto
    const signature = req.headers.get('x-secret')
    if (signature !== process.env.KIWIFY_WEBHOOK_SECRET) {
      // Se não houver segredo configurado na Vercel, loga aviso, mas retorna erro 401 para segurança
      console.warn("Webhook attempt without valid secret");
      return new Response("Unauthorized", { status: 401 })
    }

    // Parse do Body
    const body = await req.json()

    // 2. Validar tipo de evento
    if (body.event !== 'order.approved') {
      return new Response("OK", { status: 200 })
    }

    // 3. Capturar dados do comprador
    const email = body.data?.buyer?.email
    const name = body.data?.buyer?.name

    if (!email) {
       return new Response("INVALID PAYLOAD", { status: 400 })
    }

    // 4. Salvar no Firestore (usuariosPagos)
    // O app verifica db.collection("usuariosPagos").doc(email).data().pago
    
    // Nota: Como estamos usando o Client SDK no servidor, isso funciona, mas exige que 
    // as Regras de Segurança do Firestore permitam escritas ou que esta rota tenha privilégios de Admin.
    // Para ambientes de produção rigorosos, deve-se usar 'firebase-admin'.
    // Aqui assumimos que o objetivo é fazer o app funcionar com a configuração atual.
    
    await setDoc(doc(db, "usuariosPagos", email), {
        email: email,
        nome: name,
        pago: true,
        dataPagamento: new Date().toISOString(),
        metodo: "kiwify_webhook"
    }, { merge: true });

    console.log(`Pagamento confirmado para: ${email}`);

    return new Response("USER UPDATED", { status: 200 })

  } catch (error) {
    console.error('Webhook Error:', error)
    return new Response("Internal Server Error", { status: 500 })
  }
}