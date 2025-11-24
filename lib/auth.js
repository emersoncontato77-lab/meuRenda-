import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from "firebase/auth";
import { collection, query, where, getDocs } from "firebase/firestore";
import { auth, db } from "./firebaseConfig";

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
 * Verifica se o email consta na coleção 'usuariosPagos' com pago = true
 */
export const checkPayment = async (email) => {
  try {
    const usuariosRef = collection(db, "usuariosPagos");
    // Query para buscar documento onde email é igual ao do usuário
    const q = query(usuariosRef, where("email", "==", email));
    
    const querySnapshot = await getDocs(q);
    
    if (querySnapshot.empty) {
      return false; // Usuário não encontrado na tabela de pagamentos
    }

    // Verifica se algum documento retornado tem pago === true
    let isPaid = false;
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      if (data.pago === true) {
        isPaid = true;
      }
    });

    return isPaid;
  } catch (error) {
    console.error("Erro ao verificar pagamento:", error);
    return false; // Assume não pago em caso de erro para segurança
  }
};