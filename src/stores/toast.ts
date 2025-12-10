import { create } from 'zustand';

// Constants
import { ToastType } from '@/constants';

export interface Toast {
  message: string;
  type: ToastType;
}

interface ToastState {
  toast: Toast | null;
  showSuccess: (message: string) => void;
  showError: (message: string) => void;
  hide: () => void;
}

export const useToastStore = create<ToastState>(set => ({
  toast: null,
  showSuccess: (message: string) => {
    set({ toast: { message, type: ToastType.SUCCESS } });
  },
  showError: (message: string) => {
    set({ toast: { message, type: ToastType.ERROR } });
  },
  hide: () => set({ toast: null }),
}));
