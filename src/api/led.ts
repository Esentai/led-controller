import { API_URL, http, type PromiseResponse } from './http';

// Получить текущее состояние светодиода: ledState = 1 (включён) / 0 (выключен)
export const getState = (): PromiseResponse<{ ledState: number }> => {
  return http.get(`${API_URL}/device/raspberrypi-zero-2w/led`);
}

// Установить состояние светодиода: true — включить, false — выключить
export const handleState = (state: boolean): PromiseResponse<void> => {
  return http.post(`${API_URL}/device/raspberrypi-zero-2w/led`, {
    ledState: state ? 1 : 0
  });
}
