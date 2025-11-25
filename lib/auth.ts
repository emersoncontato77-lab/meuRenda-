import { createUserWithEmailAndPassword, signInWithEmailAndPassword, User, UserCredential } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore/lite";
import { auth, db } from "./firebaseConfig";

// Link do Checkout Kiwify
const KIWIFY_CHECKOUT_URL = "https://pay.kiwify.com.br/frCIztC";

/**
 * Cria um novo usuário no Firebase Auth
 */
export const registerUser = async (email: string, password: string): Promise<User> => {
  try {
    const userCredential: UserCredential = await createUserWithEmailAndPassword(auth, email, password);
    return userCredential.user;
  } catch (error) {
    console.error("Erro ao registrar:", error);
    throw error;
  }
};

/**
 * Faz login do usuário no Firebase Auth
 */
export const loginUser = async (email: string, password: string): Promise<User> => {
  try {
    const userCredential: UserCredential = await signInWithEmailAndPassword(auth, email, password);
    return userCredential.user;
  } catch (error) {
    console.error("Erro ao logar:", error);
    throw error;
  }
};

/**
 * Verifica se o email possui um documento na coleção 'usuariosPagos' com pago = true.
 */
export const checkPayment = async (email: string): Promise<boolean> => {
  try {
    // Referência direta ao documento onde o ID é o email
    const docRef = doc(db, "usuariosPagos", email);
    const docSnap = await getDoc(docRef);
    
    // Verifica se documento existe e se o campo 'pago' é true
    if (docSnap.exists() && docSnap.data().pago === true) {
      return true;
    } else {
      // Redirecionamento direto caso não tenha pago
      if (typeof window !== 'undefined') {
        window.location.href = KIWIFY_CHECKOUT_URL;
      }
      return false;
    }
  } catch (error) {
    console.error("Erro ao verificar pagamento:", error);
    // Em caso de erro, redireciona para pagamento por segurança
    if (typeof window !== 'undefined') {
        window.location.href = KIWIFY_CHECKOUT_URL;
    }
    return false;
  }
};