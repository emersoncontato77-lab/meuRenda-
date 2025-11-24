'use client'

import { AppProvider } from '../context';
import App from '../components/MainApp';

export default function Home() {
  return (
    <AppProvider>
      <App />
    </AppProvider>
  );
}