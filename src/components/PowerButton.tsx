import { Spinner } from './Spinner';

interface PowerButtonProps {
  isOn: boolean | null;
  isPending: boolean;
  disabled: boolean;
  onToggle: () => void;
}

// Большой переключатель ВКЛ / ВЫКЛ
export function PowerButton({ isOn, isPending, disabled, onToggle }: PowerButtonProps) {
  const on = isOn === true;

  return (
    <button
      type="button"
      role="switch"
      aria-checked={on}
      aria-busy={isPending}
      aria-label={on ? 'Выключить светодиод' : 'Включить светодиод'}
      className={`power ${on ? 'power--on' : ''}`}
      onClick={onToggle}
      disabled={disabled || isPending || isOn === null}
    >
      <span className="power__label power__label--off">ВЫКЛ</span>
      <span className="power__label power__label--on">ВКЛ</span>
      <span className="power__knob" aria-hidden="true">
        {isPending ? (
          <Spinner size={22} label="Отправка команды" />
        ) : (
          <svg viewBox="0 0 24 24" width="24" height="24">
            <path
              d="M12 3v8M6.3 6.3a8 8 0 1 0 11.4 0"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.4"
              strokeLinecap="round"
            />
          </svg>
        )}
      </span>
    </button>
  );
}
