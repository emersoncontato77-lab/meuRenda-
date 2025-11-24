import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from "firebase/auth";
import { collection, query, where, getDocs } from "firebase/firestore";
import { auth, db } from "./firebaseConfig";

// Link do Checkout Kiwify
const KIWIFY_CHECKOUT_URL = "https://pay.kiwify.com.br/frCIztC";

/**
 * Cria um novo usuário no Firebase Auth
 */
export const registerUser = async (email, password) => {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    return userCredential.user;
  } catch (error) {
    console.error("Erro ao registrar:", error);
    throw error;
  }
};

/**
 * Faz login do usuário no Firebase Auth
 */
export const loginUser = async (email, password) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return userCredential.user;
  } catch (error) {
    console.error("Erro ao logar:", error);
    throw error;
  }
};

/**
 * Verifica se o email consta na coleção 'usuariosPagos' com pago = true.
 * Se NÃO for pago, redireciona automaticamente para o Kiwify.
 * Retorna true se for pago.
 */
export const checkPayment = async (email) => {
  try {
    const usuariosRef = collection(db, "usuariosPagos");
    const q = query(usuariosRef, where("email", "==", email));
    
    const querySnapshot = await getDocs(q);
    
    let isPaid = false;
    
    if (!querySnapshot.empty) {
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        if (data.pago === true) {
          isPaid = true;
        }
      });
    }

    if (isPaid) {
      return true;
    } else {
      // Redirecionamento direto caso não tenha pago
      window.location.href = KIWIFY_CHECKOUT_URL;
      return false;
    }

  } catch (error) {
    console.error("Erro ao verificar pagamento:", error);
    // Em caso de erro, redireciona para pagamento por segurança
    window.location.href = KIWIFY_CHECKOUT_URL;
    return false;
  }
};