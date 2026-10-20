// Статус связи с устройством по результату последнего запроса
export type ConnectionStatus = 'unknown' | 'online' | 'offline';

// Источник действия: пользователь (кнопка/лампочка) или таймер автовыключения
export type ActionSource = 'user' | 'timer';

// Запись журнала действий
export interface LogEntry {
  id: number;
  time: Date;
  /** Какое состояние пытались установить: true — ВКЛ, false — ВЫКЛ */
  targetOn: boolean;
  success: boolean;
  source: ActionSource;
  /** Текст ошибки (если запрос не удался) */
  error?: string;
}

// Всплывающее уведомление
export type ToastKind = 'error' | 'info';

export interface ToastMessage {
  id: number;
  kind: ToastKind;
  text: string;
}

// Состояние таймера автовыключения
export interface AutoOffState {
  /** Выбранная длительность в минутах или null, если таймер не запущен */
  minutes: number | null;
  /** Оставшееся время в секундах */
  remainingSec: number;
}

// Всё, что хук useLed отдаёт компонентам
export interface UseLedResult {
  /** Состояние светодиода; null — ещё неизвестно (первая загрузка) */
  isOn: boolean | null;
  /** Идёт первичная загрузка состояния */
  isLoading: boolean;
  /** Выполняется запрос на переключение */
  isToggling: boolean;
  /** Выполняется ручное обновление */
  isRefreshing: boolean;
  connection: ConnectionStatus;
  lastUpdated: Date | null;
  log: LogEntry[];
  toasts: ToastMessage[];
  autoOff: AutoOffState;
  toggle: () => void;
  refresh: () => void;
  startAutoOff: (minutes: number) => void;
  cancelAutoOff: () => void;
  dismissToast: (id: number) => void;
}
