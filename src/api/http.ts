import axios, { type AxiosResponse } from 'axios';

// Базовый адрес API берётся из переменной окружения (см. .env.example)
export const API_URL: string = (import.meta.env.VITE_API_URL ?? '').replace(/\/+$/, '');

if (!API_URL) {
  // Подсказка разработчику: без VITE_API_URL запросы уйдут на текущий origin
  console.warn('[LED Controller] VITE_API_URL не задан — проверьте файл .env');
}

// Общий тип ответа API-функций
export type PromiseResponse<T> = Promise<AxiosResponse<T>>;

// Единый экземпляр axios для всех запросов к устройству
export const http = axios.create({
  timeout: 5000,
  headers: {
    'Content-Type': 'application/json',
  },
});
