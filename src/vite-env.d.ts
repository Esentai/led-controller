/// <reference types="vite/client" />

// Типизация переменных окружения, доступных через import.meta.env
interface ImportMetaEnv {
  readonly VITE_API_URL: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
