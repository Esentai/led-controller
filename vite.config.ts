import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Конфигурация Vite: React-плагин и доступ к dev-серверу из локальной сети
// (удобно открыть интерфейс с телефона в той же Wi-Fi сети).
export default defineConfig({
  plugins: [react()],
  // Относительные пути к ассетам: сайт работает и на localhost, и на
  // https://<user>.github.io/<repo>/ без указания имени репозитория
  base: './',
  server: {
    host: true,
    port: 5173,
  },
});
