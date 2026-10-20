import type { LogEntry } from '../types';

interface ActionLogProps {
  entries: LogEntry[];
}

// Журнал последних действий (время, ВКЛ/ВЫКЛ, результат)
export function ActionLog({ entries }: ActionLogProps) {
  return (
    <section className="card">
      <h2 className="card__title">Журнал действий</h2>

      {entries.length === 0 ? (
        <p className="card__hint">Пока нет действий</p>
      ) : (
        <ul className="log">
          {entries.map((e) => (
            <li key={e.id} className={`log__item ${e.success ? 'log__item--ok' : 'log__item--fail'}`}>
              <time className="log__time" dateTime={e.time.toISOString()}>
                {e.time.toLocaleTimeString('ru-RU')}
              </time>
              <span className={`log__action ${e.targetOn ? 'log__action--on' : ''}`}>
                {e.targetOn ? 'ВКЛ' : 'ВЫКЛ'}
              </span>
              {e.source === 'timer' && <span className="log__source">таймер</span>}
              <span className="log__result" title={e.error}>
                {e.success ? '✓ успех' : `✕ ошибка`}
              </span>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
