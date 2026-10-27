import {
  AlertTriangle,
  CheckCircle2,
  Info,
  X,
} from 'lucide-react';
import { useToast } from '../hooks/useToast';

const ICONS = {
  success: CheckCircle2,
  error: AlertTriangle,
  info: Info,
} as const;

export function Toaster() {
  const { toasts, dismissToast } = useToast();

  return (
    <div
      className="toaster"
      role="region"
      aria-live="polite"
      aria-atomic="false"
      aria-label="Notificações"
    >
      {toasts.map((toast) => {
        const Icon = ICONS[toast.tone];
        return (
          <div
            key={toast.id}
            className={`toast toast--${toast.tone}`}
            role={toast.tone === 'error' ? 'alert' : 'status'}
          >
            <Icon size={19} aria-hidden="true" />
            <div className="toast__content">
              <p>{toast.message}</p>
              {toast.action && (
                <button
                  type="button"
                  className="toast__action"
                  onClick={() => {
                    toast.action?.onClick();
                    dismissToast(toast.id);
                  }}
                >
                  {toast.action.label}
                </button>
              )}
            </div>
            <button
              type="button"
              className="toast__close"
              onClick={() => dismissToast(toast.id)}
              aria-label="Fechar notificação"
            >
              <X size={15} aria-hidden="true" />
            </button>
          </div>
        );
      })}
    </div>
  );
}
