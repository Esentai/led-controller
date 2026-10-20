import type { ConnectionStatus } from '../types';
import { Spinner } from './Spinner';

interface StatusBarProps {
  isOn: boolean | null;
  isLoading: boolean;
  connection: ConnectionStatus;
  lastUpdated: Date | null;
  isRefreshing: boolean;
  onRefresh: () => void;
}

const CONNECTION_TEXT: Record<ConnectionStatus, string> = {
  unknown: 'Подключение…',
  online: 'Онлайн',
  offline: 'Нет связи',
};

// Текст статуса, индикатор связи, время обновления и кнопка «Обновить»
export function StatusBar({
  isOn,
  isLoading,
  connection,
  lastUpdated,
  isRefreshing,
  onRefresh,
}: StatusBarProps) {
  const statusText = isLoading
    ? 'Получаем состояние…'
    : isOn === null
      ? 'Состояние неизвестно'
      : isOn
        ? 'Светодиод включён'
        : 'Светодиод выключен';

  return (
    <div className="status">
      <p className={`status__text ${isOn ? 'status__text--on' : ''}`} aria-live="polite">
        {statusText}
      </p>

      <div className="status__row">
        <span className={`conn conn--${connection}`}>
          <span className="conn__dot" aria-hidden="true" />
          {CONNECTION_TEXT[connection]}
        </span>

        <span className="status__updated">
          Обновлено: {lastUpdated ? lastUpdated.toLocaleTimeString('ru-RU') : '—'}
        </span>

        <button
          type="button"
          className="btn btn--ghost"
          onClick={onRefresh}
          disabled={isRefreshing || isLoading}
        >
          {isRefreshing ? <Spinner size={14} label="Обновление" /> : <span aria-hidden="true">↻</span>}
          Обновить
        </button>
      </div>
    </div>
  );
}
