'use client'

import { AppProvider } from '../context';
import App from '../components/MainApp'; // Vamos mover o App.tsx para components/MainApp.tsx

export default function Home() {
  return (
    <AppProvider>
      <App />
    </AppProvider>
  );
}