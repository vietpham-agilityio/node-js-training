import { ToastType } from '@/constants';
import { useToastStore } from '@/stores/toast';

/**
 * Alert replacement using Toast
 * Drop-in replacement for React Native Alert.alert()
 */
export class ToastAlert {
  /**
   * Show an alert with title and message
   * @param title - Alert title (used as message)
   * @param message - Alert message (optional, appended to title)
   * @param buttons - Array of buttons (only first 2 are supported)
   * @param options - Alert options (type determines toast style)
   */
  static alert(
    title: string,
    message?: string,
    buttons?: {
      text?: string;
      onPress?: () => void;
      style?: 'default' | 'cancel' | 'destructive';
    }[],
    options?: {
      cancelable?: boolean;
      type?: ToastType;
    },
  ) {
    const {
      show,
      showSuccess,
      showError,
      showWarning,
      showInfo,
      showWithAction,
    } = useToastStore.getState();

    // Combine title and message
    const fullMessage = message ? `${title}\n${message}` : title;

    // Determine toast type
    const type = options?.type || this.getTypeFromButtons(buttons);

    // Check if we have an action button
    const actionButton = buttons?.find(
      btn => btn.style !== 'cancel' && btn.onPress,
    );

    if (actionButton && actionButton.onPress) {
      // Show toast with action
      showWithAction(
        fullMessage,
        type,
        {
          label: actionButton.text || 'OK',
          onPress: actionButton.onPress,
        },
        5000,
      );
    } else {
      // Show regular toast
      switch (type) {
        case ToastType.SUCCESS:
          showSuccess(fullMessage);
          break;
        case ToastType.ERROR:
          showError(fullMessage);
          break;
        case ToastType.WARNING:
          showWarning(fullMessage);
          break;
        case ToastType.INFO:
          showInfo(fullMessage);
          break;
        default:
          show(fullMessage, type);
      }
    }

    // Call the first button's onPress if provided
    const defaultButton = buttons?.find(btn => btn.style !== 'cancel');
    if (defaultButton?.onPress) {
      // Delay execution to allow toast to show
      setTimeout(() => {
        defaultButton.onPress?.();
      }, 100);
    }
  }

  /**
   * Determine toast type from button styles
   */
  private static getTypeFromButtons(
    buttons?: {
      text?: string;
      onPress?: () => void;
      style?: 'default' | 'cancel' | 'destructive';
    }[],
  ): ToastType {
    if (!buttons) return ToastType.INFO;

    const hasDestructive = buttons.some(btn => btn.style === 'destructive');
    if (hasDestructive) return ToastType.ERROR;

    return ToastType.INFO;
  }
}

/**
 * Hook for using toast alerts
 */
export const useToastAlert = () => {
  const {
    showSuccess,
    showError,
    showWarning,
    showInfo,
    showWithAction,
    hideAll,
  } = useToastStore();

  /**
   * Show success toast
   */
  const success = (message: string, duration?: number) => {
    showSuccess(message, duration);
  };

  /**
   * Show error toast
   */
  const error = (message: string, duration?: number) => {
    showError(message, duration);
  };

  /**
   * Show warning toast
   */
  const warning = (message: string, duration?: number) => {
    showWarning(message, duration);
  };

  /**
   * Show info toast
   */
  const info = (message: string, duration?: number) => {
    showInfo(message, duration);
  };

  /**
   * Show toast with action button
   */
  const withAction = (
    message: string,
    action: { label: string; onPress: () => void },
    type: ToastType = ToastType.INFO,
    duration?: number,
  ) => {
    showWithAction(message, type, action, duration);
  };

  /**
   * Show alert (replaces Alert.alert)
   */
  const alert = (
    title: string,
    message?: string,
    buttons?: {
      text?: string;
      onPress?: () => void;
      style?: 'default' | 'cancel' | 'destructive';
    }[],
    options?: {
      type?: ToastType;
    },
  ) => {
    ToastAlert.alert(title, message, buttons, options);
  };

  return {
    success,
    error,
    warning,
    info,
    withAction,
    alert,
    hideAll,
  };
};
