import { createContext } from 'react';

export type ToastTone = 'success' | 'error' | 'info';

export interface ToastAction {
  label: string;
  onClick: () => void;
}

export interface ToastMessage {
  id: string;
  message: string;
  tone: ToastTone;
  action?: ToastAction;
}

export interface ShowToastInput {
  message: string;
  tone?: ToastTone;
  action?: ToastAction;
  duration?: number;
}

export interface ToastContextValue {
  toasts: ToastMessage[];
  showToast: (input: ShowToastInput) => string;
  dismissToast: (id: string) => void;
}

export const ToastContext = createContext<ToastContextValue | null>(null);
