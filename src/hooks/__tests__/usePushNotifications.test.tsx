import { ROUTES } from '@/constants';
import { useAuthStore } from '@/features/auth/store/auth';
import { pushNotificationService } from '@/services/notification/push-notification';
import { pushTokenService } from '@/services/notification/push-token';
import { renderHook, waitFor } from '@testing-library/react-native';
import { useRouter } from 'expo-router';
import { Platform } from 'react-native';
import { usePushNotifications } from '../usePushNotifications';

// Mock dependencies
jest.mock('expo-router', () => ({
  useRouter: jest.fn(),
}));

jest.mock('@/services/notification/push-notification', () => ({
  pushNotificationService: {
    registerForPushNotifications: jest.fn(),
    addNotificationReceivedListener: jest.fn(),
    addNotificationResponseReceivedListener: jest.fn(),
    scheduleTicketExpirationNotification: jest.fn(),
    scheduleShowReminderNotification: jest.fn(),
    sendLocalNotification: jest.fn(),
  },
}));

jest.mock('@/services/notification/push-token', () => ({
  pushTokenService: {
    savePushToken: jest.fn(),
  },
}));

jest.mock('@/features/auth/store/auth', () => ({
  useAuthStore: jest.fn(),
}));

describe('usePushNotifications', () => {
  const mockRouterPush = jest.fn();
  const mockRemove = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();

    (useRouter as jest.Mock).mockReturnValue({
      push: mockRouterPush,
    });

    (useAuthStore as unknown as jest.Mock).mockImplementation(selector =>
      selector({ user: { id: 'user-1' } }),
    );

    (
      pushNotificationService.registerForPushNotifications as jest.Mock
    ).mockResolvedValue('expo-token-123');

    (
      pushNotificationService.addNotificationReceivedListener as jest.Mock
    ).mockReturnValue({ remove: mockRemove });

    (
      pushNotificationService.addNotificationResponseReceivedListener as jest.Mock
    ).mockReturnValue({ remove: mockRemove });

    (pushTokenService.savePushToken as jest.Mock).mockResolvedValue(undefined);
  });

  it('registers for push notifications and saves token when user exists', async () => {
    const { result } = renderHook(() => usePushNotifications());

    await waitFor(() => {
      expect(
        pushNotificationService.registerForPushNotifications,
      ).toHaveBeenCalled();
    });

    await waitFor(() => {
      expect(pushTokenService.savePushToken).toHaveBeenCalledWith(
        'user-1',
        'expo-token-123',
        Platform.OS,
      );
    });

    await waitFor(() => {
      expect(result.current.expoPushToken).toBe('expo-token-123');
    });
  });

  it('does not register when user is null', async () => {
    (useAuthStore as unknown as jest.Mock).mockImplementation(selector =>
      selector({ user: null }),
    );

    renderHook(() => usePushNotifications());

    // Wait a bit to ensure async code has time to run
    await waitFor(
      () => {
        expect(
          pushNotificationService.registerForPushNotifications,
        ).not.toHaveBeenCalled();
      },
      { timeout: 500 },
    );

    expect(pushTokenService.savePushToken).not.toHaveBeenCalled();
  });

  it('does not register when user.id is undefined', async () => {
    (useAuthStore as unknown as jest.Mock).mockImplementation(selector =>
      selector({ user: { id: undefined } }),
    );

    renderHook(() => usePushNotifications());

    await waitFor(
      () => {
        expect(
          pushNotificationService.registerForPushNotifications,
        ).not.toHaveBeenCalled();
      },
      { timeout: 500 },
    );
  });

  /* -------------------------------------------------------------------------- */
  /*                        No token returned from service                       */
  /* -------------------------------------------------------------------------- */

  it('does not save token when registration returns null', async () => {
    (
      pushNotificationService.registerForPushNotifications as jest.Mock
    ).mockResolvedValue(null);

    const { result } = renderHook(() => usePushNotifications());

    await waitFor(() => {
      expect(
        pushNotificationService.registerForPushNotifications,
      ).toHaveBeenCalled();
    });

    await waitFor(
      () => {
        expect(pushTokenService.savePushToken).not.toHaveBeenCalled();
      },
      { timeout: 500 },
    );

    expect(result.current.expoPushToken).toBeNull();
  });

  it('handles error during push notification registration', async () => {
    jest.clearAllMocks();

    const mockError = new Error('Failed to fetch movies');

    (
      pushNotificationService.registerForPushNotifications as jest.Mock
    ).mockResolvedValue({
      data: null,
      mockError,
    });

    // The hook should not crash - error is thrown inside the hook
    const { result } = renderHook(() => usePushNotifications());

    await waitFor(() => {
      expect(
        pushNotificationService.registerForPushNotifications,
      ).toHaveBeenCalled();
    });

    // Token should remain null since registration failed
    await waitFor(() => {
      expect(result.current.expoPushToken).toBeNull();
    });
  });

  it('sets notification when received in foreground', async () => {
    let receivedCallback: any;

    (
      pushNotificationService.addNotificationReceivedListener as jest.Mock
    ).mockImplementation(cb => {
      receivedCallback = cb;
      return { remove: mockRemove };
    });

    const { result } = renderHook(() => usePushNotifications());

    const mockNotification = {
      request: {
        identifier: 'test-123',
        content: {
          title: 'Test',
          body: 'Test notification',
        },
      },
    };

    // Initially null
    expect(result.current.notification).toBeNull();

    // Trigger the callback
    await waitFor(() => {
      receivedCallback(mockNotification);
    });

    // Should update notification state
    await waitFor(() => {
      expect(result.current.notification).toEqual(mockNotification);
    });
  });

  it('navigates to ticket details on ticket_expiring notification tap', async () => {
    let responseCallback: any;

    (
      pushNotificationService.addNotificationResponseReceivedListener as jest.Mock
    ).mockImplementation(cb => {
      responseCallback = cb;
      return { remove: mockRemove };
    });

    renderHook(() => usePushNotifications());

    await waitFor(() => {
      responseCallback({
        notification: {
          request: {
            content: {
              data: {
                type: 'ticket_expiring',
                ticketId: 'ticket-123',
              },
            },
          },
        },
      });
    });

    expect(mockRouterPush).toHaveBeenCalledWith(
      ROUTES.TICKET_DETAILS('ticket-123'),
    );
  });

  it('navigates to ticket details on show_reminder notification tap', async () => {
    let responseCallback: any;

    (
      pushNotificationService.addNotificationResponseReceivedListener as jest.Mock
    ).mockImplementation(cb => {
      responseCallback = cb;
      return { remove: mockRemove };
    });

    renderHook(() => usePushNotifications());

    await waitFor(() => {
      responseCallback({
        notification: {
          request: {
            content: {
              data: {
                type: 'show_reminder',
                ticketId: 'ticket-456',
              },
            },
          },
        },
      });
    });

    expect(mockRouterPush).toHaveBeenCalledWith(
      ROUTES.TICKET_DETAILS('ticket-456'),
    );
  });

  it('does not navigate when ticketId is missing', async () => {
    let responseCallback: any;

    (
      pushNotificationService.addNotificationResponseReceivedListener as jest.Mock
    ).mockImplementation(cb => {
      responseCallback = cb;
      return { remove: mockRemove };
    });

    renderHook(() => usePushNotifications());

    await waitFor(() => {
      responseCallback({
        notification: {
          request: {
            content: {
              data: {
                type: 'ticket_expiring',
                ticketId: null,
              },
            },
          },
        },
      });
    });

    expect(mockRouterPush).not.toHaveBeenCalled();
  });

  /* -------------------------------------------------------------------------- */
  /*                  Handle notification tap - unknown type                     */
  /* -------------------------------------------------------------------------- */

  it('does not navigate for unknown notification type', async () => {
    let responseCallback: any;

    (
      pushNotificationService.addNotificationResponseReceivedListener as jest.Mock
    ).mockImplementation(cb => {
      responseCallback = cb;
      return { remove: mockRemove };
    });

    renderHook(() => usePushNotifications());

    await waitFor(() => {
      responseCallback({
        notification: {
          request: {
            content: {
              data: {
                type: 'unknown_type',
                ticketId: 'ticket-123',
              },
            },
          },
        },
      });
    });

    expect(mockRouterPush).not.toHaveBeenCalled();
  });

  /* -------------------------------------------------------------------------- */
  /*                        Schedule ticket expiration                           */
  /* -------------------------------------------------------------------------- */

  it('schedules ticket expiration notification', async () => {
    (
      pushNotificationService.scheduleTicketExpirationNotification as jest.Mock
    ).mockResolvedValue('notification-id');

    const { result } = renderHook(() => usePushNotifications());

    const expirationDate = new Date('2025-01-01T23:59:59Z');

    const notificationId = await result.current.scheduleTicketExpiration(
      'ticket-1',
      'Avengers',
      '2025-01-01',
      '20:00',
      expirationDate,
    );

    expect(
      pushNotificationService.scheduleTicketExpirationNotification,
    ).toHaveBeenCalledWith(
      'ticket-1',
      'Avengers',
      '2025-01-01',
      '20:00',
      expirationDate,
    );

    expect(notificationId).toBe('notification-id');
  });

  /* -------------------------------------------------------------------------- */
  /*                  Schedule ticket expiration - error                         */
  /* -------------------------------------------------------------------------- */

  it('throws error when scheduling ticket expiration fails', async () => {
    const scheduleError = new Error('Schedule failed');
    (
      pushNotificationService.scheduleTicketExpirationNotification as jest.Mock
    ).mockRejectedValue(scheduleError);

    const { result } = renderHook(() => usePushNotifications());

    await expect(
      result.current.scheduleTicketExpiration(
        'ticket-1',
        'Avengers',
        '2025-01-01',
        '20:00',
        new Date(),
      ),
    ).rejects.toThrow(scheduleError);
  });

  /* -------------------------------------------------------------------------- */
  /*                        Schedule show reminder                               */
  /* -------------------------------------------------------------------------- */

  it('schedules show reminder notification', async () => {
    (
      pushNotificationService.scheduleShowReminderNotification as jest.Mock
    ).mockResolvedValue('reminder-id');

    const { result } = renderHook(() => usePushNotifications());

    const showDateTime = new Date('2025-01-01T20:00:00Z');

    const id = await result.current.scheduleShowReminder(
      'ticket-1',
      'Avengers',
      '2025-01-01',
      '20:00',
      showDateTime,
    );

    expect(
      pushNotificationService.scheduleShowReminderNotification,
    ).toHaveBeenCalledWith(
      'ticket-1',
      'Avengers',
      '2025-01-01',
      '20:00',
      showDateTime,
    );

    expect(id).toBe('reminder-id');
  });

  /* -------------------------------------------------------------------------- */
  /*                  Schedule show reminder - error                             */
  /* -------------------------------------------------------------------------- */

  it('throws error when scheduling show reminder fails', async () => {
    const scheduleError = new Error('Reminder schedule failed');
    (
      pushNotificationService.scheduleShowReminderNotification as jest.Mock
    ).mockRejectedValue(scheduleError);

    const { result } = renderHook(() => usePushNotifications());

    await expect(
      result.current.scheduleShowReminder(
        'ticket-1',
        'Avengers',
        '2025-01-01',
        '20:00',
        new Date(),
      ),
    ).rejects.toThrow(scheduleError);
  });

  /* -------------------------------------------------------------------------- */
  /*                           Send test notification                            */
  /* -------------------------------------------------------------------------- */

  it('sends test notification', async () => {
    const { result } = renderHook(() => usePushNotifications());

    await result.current.sendTestNotification();

    expect(pushNotificationService.sendLocalNotification).toHaveBeenCalledWith(
      'Test Notification 🎬',
      'This is a test notification from Movie Ticket Booking app!',
      { type: 'test' },
    );
  });

  /* -------------------------------------------------------------------------- */
  /*                     Send test notification - error                          */
  /* -------------------------------------------------------------------------- */

  it('throws error when sending test notification fails', async () => {
    const sendError = new Error('Send failed');
    (
      pushNotificationService.sendLocalNotification as jest.Mock
    ).mockRejectedValue(sendError);

    const { result } = renderHook(() => usePushNotifications());

    await expect(result.current.sendTestNotification()).rejects.toThrow(
      sendError,
    );
  });

  /* -------------------------------------------------------------------------- */
  /*                                Cleanup                                      */
  /* -------------------------------------------------------------------------- */

  it('removes listeners on unmount', () => {
    const { unmount } = renderHook(() => usePushNotifications());

    unmount();

    expect(mockRemove).toHaveBeenCalledTimes(2);
  });

  /* -------------------------------------------------------------------------- */
  /*                    Cleanup - null listeners                                 */
  /* -------------------------------------------------------------------------- */

  it('handles cleanup when listeners are null', () => {
    // Mock listeners returning null
    (
      pushNotificationService.addNotificationReceivedListener as jest.Mock
    ).mockReturnValue(null);

    (
      pushNotificationService.addNotificationResponseReceivedListener as jest.Mock
    ).mockReturnValue(null);

    const { unmount } = renderHook(() => usePushNotifications());

    // Should not crash
    expect(() => unmount()).not.toThrow();
  });

  /* -------------------------------------------------------------------------- */
  /*                    Listeners added after mount                              */
  /* -------------------------------------------------------------------------- */

  it('adds notification listeners after mount', async () => {
    renderHook(() => usePushNotifications());

    await waitFor(() => {
      expect(
        pushNotificationService.addNotificationReceivedListener,
      ).toHaveBeenCalled();
    });

    await waitFor(() => {
      expect(
        pushNotificationService.addNotificationResponseReceivedListener,
      ).toHaveBeenCalled();
    });
  });

  /* -------------------------------------------------------------------------- */
  /*                    User changes during hook lifetime                        */
  /* -------------------------------------------------------------------------- */

  it('re-registers when user changes from null to defined', async () => {
    let currentUser: any = null;

    (useAuthStore as unknown as jest.Mock).mockImplementation(selector => {
      if (typeof selector === 'function') {
        return selector({ user: currentUser });
      }
      return currentUser;
    });

    const { rerender } = renderHook(() => usePushNotifications());

    // Initially no user
    await waitFor(
      () => {
        expect(
          pushNotificationService.registerForPushNotifications,
        ).not.toHaveBeenCalled();
      },
      { timeout: 500 },
    );

    // Update user
    currentUser = { id: 'user-2' };
    rerender(currentUser);

    // Should now register
    await waitFor(() => {
      expect(
        pushNotificationService.registerForPushNotifications,
      ).toHaveBeenCalled();
    });
  });
});
