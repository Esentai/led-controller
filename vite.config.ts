import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Конфигурация Vite: React-плагин и доступ к dev-серверу из локальной сети
// (удобно открыть интерфейс с телефона в той же Wi-Fi сети).
export default defineConfig({
  plugins: [react()],
  server: {
    host: true,
    port: 5173,
  },
});
