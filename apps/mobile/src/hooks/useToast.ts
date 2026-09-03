import { ToastType } from '@/constants';
import { useToastStore } from '@/stores/toast';

type AlertButton = {
  text?: string;
  onPress?: () => void;
  style?: 'default' | 'cancel' | 'destructive';
};

type AlertMode = 'auto' | 'manual';

type AlertOptions = {
  type?: ToastType;
  mode?: AlertMode;
  delay?: number;
};

/**
 * Alert replacement using Toast
 * Supports both AUTO and MANUAL action modes
 */
export class ToastAlert {
  static alert(
    title: string,
    message?: string,
    buttons?: AlertButton[],
    options?: AlertOptions,
  ) {
    const {
      show,
      showSuccess,
      showError,
      showWarning,
      showInfo,
      showWithAction,
    } = useToastStore.getState();

    const fullMessage = message ? `${title}\n${message}` : title;
    const type = options?.type ?? this.getTypeFromButtons(buttons);
    const mode: AlertMode = options?.mode ?? 'manual';
    const delay = options?.delay ?? 700;

    const actionButton = buttons?.find(
      btn => btn.style !== 'cancel' && btn.onPress,
    );

    if (actionButton) {
      showWithAction(
        fullMessage,
        type,
        {
          label: actionButton.text ?? 'OK',
          onPress:
            mode === 'manual' && actionButton.onPress
              ? actionButton.onPress
              : () => null,
        },
        delay,
      );

      if (mode === 'auto') {
        setTimeout(() => {
          actionButton.onPress?.();
        }, delay);
      }

      return;
    }

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

  /**
   * Infer toast type from button styles
   */
  private static getTypeFromButtons(buttons?: AlertButton[]): ToastType {
    if (!buttons) return ToastType.INFO;
    return buttons.some(btn => btn.style === 'destructive')
      ? ToastType.ERROR
      : ToastType.INFO;
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

  const success = (message: string, duration?: number) =>
    showSuccess(message, duration);

  const error = (message: string, duration?: number) =>
    showError(message, duration);

  const warning = (message: string, duration?: number) =>
    showWarning(message, duration);

  const info = (message: string, duration?: number) =>
    showInfo(message, duration);

  const withAction = (
    message: string,
    action: { label: string; onPress: () => void },
    type: ToastType = ToastType.INFO,
    duration?: number,
  ) => showWithAction(message, type, action, duration);

  /**
   * Alert (Alert.alert replacement)
   */
  const alert = (
    title: string,
    message?: string,
    buttons?: AlertButton[],
    options?: AlertOptions,
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
