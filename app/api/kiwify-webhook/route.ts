import { db } from '@/lib/firebaseConfig';
import { doc, setDoc } from 'firebase/firestore';
import { NextRequest, NextResponse } from 'next/server';

interface KiwifyPayload {
  event: string;
  data: {
    buyer: {
      email: string;
      name: string;
    };
  };
}

export async function POST(req: NextRequest) {
  try {
    // 1. Validar Header Secreto (Opcional se a env não estiver definida, para evitar bloqueio total em dev)
    const signature = req.headers.get('x-secret');
    const secret = process.env.KIWIFY_WEBHOOK_SECRET;

    if (secret && signature !== secret) {
      console.warn("Webhook attempt without valid secret");
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // Parse do Body
    const body = (await req.json()) as KiwifyPayload;

    // 2. Validar tipo de evento
    if (body.event !== 'order.approved') {
      return new NextResponse("OK", { status: 200 });
    }

    // 3. Capturar dados do comprador
    const email = body.data?.buyer?.email;
    const name = body.data?.buyer?.name;

    if (!email) {
       return new NextResponse("INVALID PAYLOAD", { status: 400 });
    }

    // 4. Salvar no Firestore (usuariosPagos)
    // Usando setDoc com merge para não sobrescrever outros campos se existirem
    await setDoc(doc(db, "usuariosPagos", email), {
        email: email,
        nome: name,
        pago: true,
        dataPagamento: new Date().toISOString(),
        metodo: "kiwify_webhook"
    }, { merge: true });

    console.log(`Pagamento confirmado para: ${email}`);

    return new NextResponse("USER UPDATED", { status: 200 });

  } catch (error) {
    console.error('Webhook Error:', error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}