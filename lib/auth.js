import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
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
 * Verifica se o email possui um documento na coleção 'usuariosPagos' com pago = true.
 * Usa referência direta de documento (ID = email) conforme solicitado.
 */
export const checkPayment = async (email) => {
  try {
    // Referência direta ao documento onde o ID é o email
    const docRef = doc(db, "usuariosPagos", email);
    const docSnap = await getDoc(docRef);
    
    // Verifica se documento existe e se o campo 'pago' é true
    if (docSnap.exists() && docSnap.data().pago === true) {
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