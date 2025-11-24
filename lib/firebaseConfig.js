import { initializeApp, getApps } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyCPnC5fteacoPE95Al8S7tquqIYBQyJ8qw",
  authDomain: "meurenda-2ec7d.firebaseapp.com",
  projectId: "meurenda-2ec7d",
  storageBucket: "meurenda-2ec7d.firebasestorage.app",
  messagingSenderId: "940217036220",
  appId: "1:940217036220:web:013cdafd74dd03d6f38fb9"
};

// Evita inicializar múltiplas vezes em hot-reload
const app = !getApps().length ? initializeApp(firebaseConfig) : getApps()[0];
const auth = getAuth(app);
const db = getFirestore(app);

export { auth, db };
export default firebaseConfig;