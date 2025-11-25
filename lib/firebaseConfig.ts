import { initializeApp, getApps, FirebaseApp } from "firebase/app";
import { getAuth, Auth } from "firebase/auth";
import { getFirestore, Firestore } from "firebase/firestore/lite";

const firebaseConfig = {
  apiKey: "AIzaSyCPnC5fteacoPE95Al8S7tquqIYBQyJ8qw",
  authDomain: "meurenda-2ec7d.firebaseapp.com",
  projectId: "meurenda-2ec7d",
  storageBucket: "meurenda-2ec7d.firebasestorage.app",
  messagingSenderId: "940217036220",
  appId: "1:940217036220:web:013cdafd74dd03d6f38fb9"
};

// Inicialização segura para evitar duplicatas em hot-reload ou server-side
const app: FirebaseApp = !getApps().length ? initializeApp(firebaseConfig) : getApps()[0];
const auth: Auth = getAuth(app);
const db: Firestore = getFirestore(app);

// Exportações nomeadas para uso em outros módulos
export { auth, db };

// Exportação padrão da configuração
export default firebaseConfig;