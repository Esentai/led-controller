import { useCallback, useEffect, useRef, useState } from 'react';
import axios from 'axios';
import { getState, handleState } from '../api/led';
import type {
  ActionSource,
  ConnectionStatus,
  LogEntry,
  ToastKind,
  ToastMessage,
  UseLedResult,
} from '../types';

// Интервал фонового опроса устройства
const POLL_INTERVAL_MS = 4000;
// Сколько записей хранить в журнале
const LOG_LIMIT = 10;
// Время жизни уведомления
const TOAST_TTL_MS = 5000;
// Шаг обновления обратного отсчёта таймера
const TIMER_TICK_MS = 250;

// Режим запроса состояния: первичная загрузка, ручное обновление или фоновый опрос
type FetchMode = 'initial' | 'manual' | 'poll';

// Превращаем любую ошибку в понятный пользователю текст
function getErrorMessage(error: unknown): string {
  if (axios.isAxiosError(error)) {
    if (error.code === 'ECONNABORTED') return 'превышено время ожидания ответа';
    if (error.response) return `сервер ответил ${error.response.status} ${error.response.statusText}`.trim();
    return 'нет связи с сервером';
  }
  if (error instanceof Error) return error.message;
  return 'неизвестная ошибка';
}

export function useLed(): UseLedResult {
  const [isOn, setIsOn] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isToggling, setIsToggling] = useState<boolean>(false);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [connection, setConnection] = useState<ConnectionStatus>('unknown');
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [log, setLog] = useState<LogEntry[]>([]);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [autoOffMinutes, setAutoOffMinutes] = useState<number | null>(null);
  const [autoOffDeadline, setAutoOffDeadline] = useState<number | null>(null);
  const [remainingSec, setRemainingSec] = useState<number>(0);

  // Ref'ы для актуальных значений внутри асинхронных колбэков и интервалов
  const isMountedRef = useRef<boolean>(true);
  const isOnRef = useRef<boolean | null>(null);
  const togglingRef = useRef<boolean>(false);
  const connectionRef = useRef<ConnectionStatus>('unknown');
  // Счётчик переключений: ответы опроса, начатого до переключения, игнорируются
  const mutationVersionRef = useRef<number>(0);
  const idCounterRef = useRef<number>(0);
  const toastTimersRef = useRef<Map<number, number>>(new Map());

  const nextId = (): number => {
    idCounterRef.current += 1;
    return idCounterRef.current;
  };

  // Отслеживаем монтирование и очищаем таймеры уведомлений при размонтировании
  useEffect(() => {
    isMountedRef.current = true;
    const timers = toastTimersRef.current;
    return () => {
      isMountedRef.current = false;
      timers.forEach((timerId) => window.clearTimeout(timerId));
      timers.clear();
    };
  }, []);

  // Синхронно обновляем и state, и ref
  const applyState = useCallback((value: boolean | null) => {
    isOnRef.current = value;
    setIsOn(value);
  }, []);

  const applyConnection = useCallback((value: ConnectionStatus) => {
    connectionRef.current = value;
    setConnection(value);
  }, []);

  const dismissToast = useCallback((id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
    const timerId = toastTimersRef.current.get(id);
    if (timerId !== undefined) {
      window.clearTimeout(timerId);
      toastTimersRef.current.delete(id);
    }
  }, []);

  const pushToast = useCallback(
    (text: string, kind: ToastKind = 'error') => {
      const id = nextId();
      setToasts((prev) => [...prev, { id, kind, text }]);
      // Автоматически скрываем уведомление через TOAST_TTL_MS
      const timerId = window.setTimeout(() => dismissToast(id), TOAST_TTL_MS);
      toastTimersRef.current.set(id, timerId);
    },
    [dismissToast],
  );

  const addLog = useCallback((entry: Omit<LogEntry, 'id' | 'time'>) => {
    const record: LogEntry = { ...entry, id: nextId(), time: new Date() };
    setLog((prev) => [record, ...prev].slice(0, LOG_LIMIT));
  }, []);

  // Запрос текущего состояния светодиода
  const fetchState = useCallback(
    async (mode: FetchMode): Promise<void> => {
      // Во время переключения фоновый опрос не нужен — он может перезаписать оптимистичное состояние
      if (mode === 'poll' && togglingRef.current) return;

      const versionAtStart = mutationVersionRef.current;
      if (mode === 'manual') setIsRefreshing(true);

      try {
        const { data } = await getState();
        if (!isMountedRef.current) return;

        if (typeof data?.ledState !== 'number') {
          throw new Error('некорректный ответ сервера');
        }

        applyConnection('online');

        // Если за время запроса пользователь переключил лампу — ответ устарел
        if (versionAtStart !== mutationVersionRef.current || togglingRef.current) return;

        applyState(data.ledState === 1);
        setLastUpdated(new Date());
      } catch (error) {
        if (!isMountedRef.current) return;
        const wasOnline = connectionRef.current !== 'offline';
        applyConnection('offline');
        // При фоновом опросе уведомляем только о потере связи, а не о каждой неудаче
        if (mode !== 'poll' || wasOnline) {
          pushToast(`Не удалось получить состояние: ${getErrorMessage(error)}`);
        }
      } finally {
        if (isMountedRef.current) {
          if (mode === 'initial') setIsLoading(false);
          if (mode === 'manual') setIsRefreshing(false);
        }
      }
    },
    [applyConnection, applyState, pushToast],
  );

  // Установка состояния светодиода с оптимистичным обновлением и откатом при ошибке
  const setLedState = useCallback(
    async (next: boolean, source: ActionSource): Promise<void> => {
      // Защита от двойных кликов
      if (togglingRef.current) return;
      togglingRef.current = true;
      mutationVersionRef.current += 1;

      const previous = isOnRef.current;
      setIsToggling(true);
      applyState(next);

      try {
        await handleState(next);
        if (!isMountedRef.current) return;
        applyConnection('online');
        setLastUpdated(new Date());
        addLog({ targetOn: next, success: true, source });
      } catch (error) {
        if (!isMountedRef.current) return;
        const message = getErrorMessage(error);
        // Возвращаем прежнее состояние
        applyState(previous);
        applyConnection('offline');
        pushToast(`Не удалось ${next ? 'включить' : 'выключить'} светодиод: ${message}`);
        addLog({ targetOn: next, success: false, source, error: message });
      } finally {
        togglingRef.current = false;
        if (isMountedRef.current) setIsToggling(false);
      }
    },
    [addLog, applyConnection, applyState, pushToast],
  );

  const toggle = useCallback(() => {
    if (isOnRef.current === null) return;
    void setLedState(!isOnRef.current, 'user');
  }, [setLedState]);

  const refresh = useCallback(() => {
    void fetchState('manual');
  }, [fetchState]);

  // Первичная загрузка + периодический опрос, который останавливается в неактивной вкладке
  useEffect(() => {
    void fetchState('initial');

    let intervalId: number | null = null;

    const startPolling = () => {
      if (intervalId !== null) return;
      intervalId = window.setInterval(() => {
        void fetchState('poll');
      }, POLL_INTERVAL_MS);
    };

    const stopPolling = () => {
      if (intervalId === null) return;
      window.clearInterval(intervalId);
      intervalId = null;
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        // Вернулись на вкладку — сразу синхронизируемся и возобновляем опрос
        void fetchState('poll');
        startPolling();
      } else {
        stopPolling();
      }
    };

    if (document.visibilityState === 'visible') startPolling();
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      stopPolling();
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [fetchState]);

  // ---------- Таймер автовыключения ----------

  const startAutoOff = useCallback((minutes: number) => {
    if (isOnRef.current !== true) return;
    const totalMs = minutes * 60_000;
    setAutoOffMinutes(minutes);
    setAutoOffDeadline(Date.now() + totalMs);
    setRemainingSec(Math.ceil(totalMs / 1000));
  }, []);

  const cancelAutoOff = useCallback(() => {
    setAutoOffMinutes(null);
    setAutoOffDeadline(null);
    setRemainingSec(0);
  }, []);

  // Обратный отсчёт; по окончании — выключаем светодиод
  useEffect(() => {
    if (autoOffDeadline === null) return;

    const tick = () => {
      const leftMs = autoOffDeadline - Date.now();
      if (leftMs > 0) {
        setRemainingSec(Math.ceil(leftMs / 1000));
        return;
      }
      // Если сейчас идёт другой запрос — попробуем на следующем тике
      if (togglingRef.current) return;
      cancelAutoOff();
      void setLedState(false, 'timer');
    };

    tick();
    const intervalId = window.setInterval(tick, TIMER_TICK_MS);
    return () => window.clearInterval(intervalId);
  }, [autoOffDeadline, cancelAutoOff, setLedState]);

  // Если светодиод выключили любым способом (в т.ч. с другого устройства) — таймер больше не нужен
  useEffect(() => {
    if (isOn === false && autoOffDeadline !== null) cancelAutoOff();
  }, [isOn, autoOffDeadline, cancelAutoOff]);

  return {
    isOn,
    isLoading,
    isToggling,
    isRefreshing,
    connection,
    lastUpdated,
    log,
    toasts,
    autoOff: { minutes: autoOffMinutes, remainingSec },
    toggle,
    refresh,
    startAutoOff,
    cancelAutoOff,
    dismissToast,
  };
}
