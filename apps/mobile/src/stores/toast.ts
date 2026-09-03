import { create } from 'zustand';

// Constants
import { ToastType } from '@/constants';

export interface Toast {
  id: string;
  message: string;
  type: ToastType;
  duration?: number;
  action?: {
    label: string;
    onPress: () => void;
  };
}

interface ToastStore {
  toasts: Toast[];
  show: (message: string, type?: ToastType, duration?: number) => void;
  showSuccess: (message: string, duration?: number) => void;
  showError: (message: string, duration?: number) => void;
  showWarning: (message: string, duration?: number) => void;
  showInfo: (message: string, duration?: number) => void;
  showWithAction: (
    message: string,
    type: ToastType,
    action: { label: string; onPress: () => void },
    duration?: number,
  ) => void;
  hide: (id: string) => void;
  hideAll: () => void;
}

export const useToastStore = create<ToastStore>(set => ({
  toasts: [],

  show: (message, type = ToastType.INFO, duration = 3000) => {
    const id = `${Date.now()}-${Math.random()}`;
    const toast: Toast = { id, message, type, duration };

    set(state => ({
      toasts: [...state.toasts, toast],
    }));
  },

  showSuccess: (message, duration = 3000) => {
    const id = `${Date.now()}-${Math.random()}`;
    const toast: Toast = { id, message, type: ToastType.SUCCESS, duration };

    set(state => ({
      toasts: [...state.toasts, toast],
    }));
  },

  showError: (message, duration = 4000) => {
    const id = `${Date.now()}-${Math.random()}`;
    const toast: Toast = { id, message, type: ToastType.ERROR, duration };

    set(state => ({
      toasts: [...state.toasts, toast],
    }));
  },

  showWarning: (message, duration = 3500) => {
    const id = `${Date.now()}-${Math.random()}`;
    const toast: Toast = { id, message, type: ToastType.WARNING, duration };

    set(state => ({
      toasts: [...state.toasts, toast],
    }));
  },

  showInfo: (message, duration = 3000) => {
    const id = `${Date.now()}-${Math.random()}`;
    const toast: Toast = { id, message, type: ToastType.INFO, duration };

    set(state => ({
      toasts: [...state.toasts, toast],
    }));
  },

  showWithAction: (message, type, action, duration = 5000) => {
    const id = `${Date.now()}-${Math.random()}`;
    const toast: Toast = { id, message, type, action, duration };

    set(state => ({
      toasts: [...state.toasts, toast],
    }));
  },

  hide: id => {
    set(state => ({
      toasts: state.toasts.filter(toast => toast.id !== id),
    }));
  },

  hideAll: () => {
    set({ toasts: [] });
  },
}));
