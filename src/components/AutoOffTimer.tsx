import type { AutoOffState } from '../types';

interface AutoOffTimerProps {
  isOn: boolean | null;
  autoOff: AutoOffState;
  onStart: (minutes: number) => void;
  onCancel: () => void;
}

// Доступные варианты таймера (в минутах)
const OPTIONS: readonly number[] = [1, 5, 10];

// Форматирование секунд в мм:сс
function formatTime(totalSec: number): string {
  const m = Math.floor(totalSec / 60);
  const s = totalSec % 60;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

// Таймер автовыключения светодиода
export function AutoOffTimer({ isOn, autoOff, onStart, onCancel }: AutoOffTimerProps) {
  const active = autoOff.minutes !== null;
  const progress = active && autoOff.minutes !== null
    ? (autoOff.remainingSec / (autoOff.minutes * 60)) * 100
    : 0;

  return (
    <section className="card">
      <h2 className="card__title">Таймер автовыключения</h2>

      {active ? (
        <div className="timer">
          <div className="timer__time" aria-live="off">
            {formatTime(autoOff.remainingSec)}
          </div>
          <div className="timer__bar" aria-hidden="true">
            <div className="timer__bar-fill" style={{ width: `${progress}%` }} />
          </div>
          <p className="card__hint">Светодиод выключится через {autoOff.minutes} мин.</p>
          <button type="button" className="btn btn--ghost" onClick={onCancel}>
            Отменить
          </button>
        </div>
      ) : (
        <>
          <div className="timer__options">
            {OPTIONS.map((min) => (
              <button
                key={min}
                type="button"
                className="btn btn--chip"
                onClick={() => onStart(min)}
                disabled={isOn !== true}
              >
                {min} мин
              </button>
            ))}
          </div>
          <p className="card__hint">
            {isOn ? 'Выберите время до выключения' : 'Доступно, когда светодиод включён'}
          </p>
        </>
      )}
    </section>
  );
}
