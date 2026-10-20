import { Spinner } from './Spinner';

interface BulbProps {
  /** null — состояние ещё неизвестно */
  isOn: boolean | null;
  isLoading: boolean;
  disabled: boolean;
  onToggle: () => void;
}

// Контур стеклянной колбы
const GLASS_PATH =
  'M100 18 C 48 18 18 58 18 106 C 18 142 38 162 54 182 C 64 195 68 206 68 220 L 132 220 C 132 206 136 195 146 182 C 162 162 182 142 182 106 C 182 58 152 18 100 18 Z';

// Большая SVG-лампочка: клик переключает светодиод
export function Bulb({ isOn, isLoading, disabled, onToggle }: BulbProps) {
  const on = isOn === true;
  const classes = ['bulb', on ? 'bulb--on' : 'bulb--off', isLoading ? 'bulb--loading' : '']
    .filter(Boolean)
    .join(' ');

  const label = isLoading
    ? 'Загрузка состояния светодиода'
    : isOn === null
      ? 'Состояние светодиода неизвестно'
      : on
        ? 'Светодиод включён. Нажмите, чтобы выключить'
        : 'Светодиод выключен. Нажмите, чтобы включить';

  return (
    <button
      type="button"
      className={classes}
      onClick={onToggle}
      disabled={disabled || isLoading}
      aria-pressed={on}
      aria-label={label}
      aria-busy={isLoading}
    >
      {/* Ореол свечения за лампочкой (внешний слой — плавное появление, внутренний — пульсация) */}
      <span className="bulb__halo" aria-hidden="true">
        <span className="bulb__halo-pulse" />
      </span>

      <svg className="bulb__svg" viewBox="0 0 200 300" aria-hidden="true">
        <defs>
          <radialGradient id="led-bulb-on" cx="50%" cy="40%" r="65%">
            <stop offset="0%" stopColor="#fffbe6" />
            <stop offset="40%" stopColor="#ffe36e" />
            <stop offset="100%" stopColor="#ffb300" />
          </radialGradient>
          <radialGradient id="led-bulb-off" cx="40%" cy="35%" r="70%">
            <stop offset="0%" stopColor="#59606e" />
            <stop offset="60%" stopColor="#3a3f4b" />
            <stop offset="100%" stopColor="#2a2e37" />
          </radialGradient>
          <linearGradient id="led-bulb-base" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#7d838d" />
            <stop offset="40%" stopColor="#e3e6ea" />
            <stop offset="100%" stopColor="#6b717b" />
          </linearGradient>
        </defs>

        {/* Колба: выключенный слой снизу, включённый слой плавно проявляется сверху */}
        <path d={GLASS_PATH} fill="url(#led-bulb-off)" />
        <path className="bulb__glass-on" d={GLASS_PATH} fill="url(#led-bulb-on)" />

        {/* Блик на стекле */}
        <path
          d="M56 92 C 58 64 76 44 100 40"
          fill="none"
          stroke="rgba(255,255,255,0.45)"
          strokeWidth="8"
          strokeLinecap="round"
        />

        {/* Нить накаливания */}
        <g className="bulb__filament" fill="none" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
          <path d="M86 220 L 88 150" />
          <path d="M114 220 L 112 150" />
          <path d="M88 150 q 4 -14 8 0 q 4 14 8 0 q 4 -14 8 0" />
        </g>

        {/* Цоколь */}
        <rect x="66" y="216" width="68" height="14" rx="4" fill="url(#led-bulb-base)" />
        <rect x="70" y="232" width="60" height="10" rx="5" fill="url(#led-bulb-base)" />
        <rect x="72" y="244" width="56" height="10" rx="5" fill="url(#led-bulb-base)" />
        <rect x="74" y="256" width="52" height="10" rx="5" fill="url(#led-bulb-base)" />
        <path d="M84 268 L116 268 L107 286 L93 286 Z" fill="#2b2f38" />
      </svg>

      {isLoading && (
        <span className="bulb__spinner">
          <Spinner size={42} label="Загрузка состояния" />
        </span>
      )}
    </button>
  );
}
