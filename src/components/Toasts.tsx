import type { ToastMessage } from '../types';

interface ToastsProps {
  toasts: ToastMessage[];
  onDismiss: (id: number) => void;
}

// Стек всплывающих уведомлений
export function Toasts({ toasts, onDismiss }: ToastsProps) {
  return (
    <div className="toasts" aria-live="assertive">
      {toasts.map((t) => (
        <div key={t.id} className={`toast toast--${t.kind}`} role="alert">
          <span>{t.text}</span>
          <button type="button" className="toast__close" onClick={() => onDismiss(t.id)} aria-label="Закрыть">
            ×
          </button>
        </div>
      ))}
    </div>
  );
}
