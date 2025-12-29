import Constants from 'expo-constants';
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import {
  PushNotificationService,
  pushNotificationService,
} from '../push-notification';

jest.mock('expo-notifications', () => ({
  setNotificationHandler: jest.fn(),
  getPermissionsAsync: jest.fn(),
  requestPermissionsAsync: jest.fn(),
  getExpoPushTokenAsync: jest.fn(),
  setNotificationChannelAsync: jest.fn(),
  scheduleNotificationAsync: jest.fn(),
  cancelAllScheduledNotificationsAsync: jest.fn(),
  cancelScheduledNotificationAsync: jest.fn(),
  getAllScheduledNotificationsAsync: jest.fn(),
  addNotificationReceivedListener: jest.fn(),
  addNotificationResponseReceivedListener: jest.fn(),
  AndroidNotificationPriority: {
    HIGH: 'high',
  },
  AndroidImportance: {
    MAX: 'max',
  },
  SchedulableTriggerInputTypes: {
    TIME_INTERVAL: 'timeInterval',
  },
}));
jest.mock('expo-device', () => ({
  isDevice: true,
}));
jest.mock('expo-constants', () => ({
  expoConfig: {
    extra: {
      eas: {
        projectId: 'test-project-id',
      },
    },
  },
}));

// Mock console methods
const consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation();
const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();

describe('PushNotificationService', () => {
  let service: PushNotificationService;

  beforeEach(() => {
    jest.clearAllMocks();
    service = PushNotificationService.getInstance();
    Platform.OS = 'ios';
    (Device.isDevice as boolean) = true;
    (Constants.expoConfig!.extra!.eas!.projectId as any) = 'test-project-id';
  });

  afterAll(() => {
    consoleWarnSpy.mockRestore();
    consoleErrorSpy.mockRestore();
  });

  it('should be a singleton', () => {
    const instance1 = PushNotificationService.getInstance();
    const instance2 = PushNotificationService.getInstance();
    expect(instance1).toBe(instance2);
    expect(instance1).toBe(pushNotificationService);
  });

  describe('registerForPushNotifications', () => {
    it('should return null if not on a physical device', async () => {
      (Device.isDevice as boolean) = false;
      const token = await service.registerForPushNotifications();
      expect(token).toBeNull();
    });

    it('should request permissions if not granted and return token', async () => {
      (Notifications.getPermissionsAsync as jest.Mock).mockResolvedValue({
        status: 'denied',
      });
      (Notifications.requestPermissionsAsync as jest.Mock).mockResolvedValue({
        status: 'granted',
      });
      (Notifications.getExpoPushTokenAsync as jest.Mock).mockResolvedValue({
        data: 'expo-token',
      });
      const token = await service.registerForPushNotifications();
      expect(Notifications.requestPermissionsAsync).toHaveBeenCalled();
      expect(token).toBe('expo-token');
    });

    it('should return null if permission is not granted', async () => {
      (Notifications.getPermissionsAsync as jest.Mock).mockResolvedValue({
        status: 'denied',
      });
      (Notifications.requestPermissionsAsync as jest.Mock).mockResolvedValue({
        status: 'denied',
      });
      const token = await service.registerForPushNotifications();
      expect(token).toBeNull();
      expect(consoleWarnSpy).toHaveBeenCalledWith(
        'Push notification permission not granted',
      );
    });

    it('should set notification channel on Android', async () => {
      Platform.OS = 'android';
      (Notifications.getPermissionsAsync as jest.Mock).mockResolvedValue({
        status: 'granted',
      });
      (Notifications.getExpoPushTokenAsync as jest.Mock).mockResolvedValue({
        data: 'expo-token',
      });
      await service.registerForPushNotifications();
      expect(Notifications.setNotificationChannelAsync).toHaveBeenCalled();
    });

    it('should return null if projectId is missing', async () => {
      (Constants.expoConfig!.extra!.eas!.projectId as any) = undefined;
      (Notifications.getPermissionsAsync as jest.Mock).mockResolvedValue({
        status: 'granted',
      });
      const token = await service.registerForPushNotifications();
      expect(token).toBeNull();
      expect(consoleErrorSpy).toHaveBeenCalledWith('EAS Project ID not found');
    });

    it('should return null on any exception', async () => {
      (Notifications.getPermissionsAsync as jest.Mock).mockRejectedValue(
        new Error('test error'),
      );
      const token = await service.registerForPushNotifications();
      expect(token).toBeNull();
    });
  });

  describe('scheduleLocalNotification', () => {
    it('should schedule a local notification', async () => {
      (Notifications.scheduleNotificationAsync as jest.Mock).mockResolvedValue(
        'notification-id',
      );
      const id = await service.scheduleLocalNotification('Title', 'Body');
      expect(Notifications.scheduleNotificationAsync).toHaveBeenCalled();
      expect(id).toBe('notification-id');
    });

    it('should throw on error', async () => {
      (Notifications.scheduleNotificationAsync as jest.Mock).mockRejectedValue(
        new Error('Scheduling failed'),
      );
      await expect(
        service.scheduleLocalNotification('Title', 'Body'),
      ).rejects.toThrow('Scheduling failed');
    });
  });

  describe('sendLocalNotification', () => {
    it('should send an immediate local notification', async () => {
      (Notifications.scheduleNotificationAsync as jest.Mock).mockResolvedValue(
        'notification-id',
      );
      const id = await service.sendLocalNotification('Title', 'Body');
      expect(Notifications.scheduleNotificationAsync).toHaveBeenCalledWith(
        expect.objectContaining({ trigger: null }),
      );
      expect(id).toBe('notification-id');
    });

    it('should throw on error', async () => {
      (Notifications.scheduleNotificationAsync as jest.Mock).mockRejectedValue(
        new Error('Send failed'),
      );
      await expect(
        service.sendLocalNotification('Title', 'Body'),
      ).rejects.toThrow('Send failed');
    });
  });

  describe('cancelAllScheduledNotifications', () => {
    it('should cancel all notifications', async () => {
      await service.cancelAllScheduledNotifications();
      expect(
        Notifications.cancelAllScheduledNotificationsAsync,
      ).toHaveBeenCalled();
    });

    it('should throw on error', async () => {
      (
        Notifications.cancelAllScheduledNotificationsAsync as jest.Mock
      ).mockRejectedValue(new Error('Cancel failed'));
      await expect(service.cancelAllScheduledNotifications()).rejects.toThrow(
        'Cancel failed',
      );
    });
  });

  describe('cancelNotification', () => {
    it('should cancel a specific notification', async () => {
      await service.cancelNotification('notification-id');
      expect(
        Notifications.cancelScheduledNotificationAsync,
      ).toHaveBeenCalledWith('notification-id');
    });

    it('should throw on error', async () => {
      (
        Notifications.cancelScheduledNotificationAsync as jest.Mock
      ).mockRejectedValue(new Error('Cancel failed'));
      await expect(service.cancelNotification('id')).rejects.toThrow(
        'Cancel failed',
      );
    });
  });

  describe('getAllScheduledNotifications', () => {
    it('should return scheduled notifications', async () => {
      const mockNotifs = [{ id: '1' }];
      (
        Notifications.getAllScheduledNotificationsAsync as jest.Mock
      ).mockResolvedValue(mockNotifs);
      const notifs = await service.getAllScheduledNotifications();
      expect(notifs).toBe(mockNotifs);
    });

    it('should return empty array on error', async () => {
      (
        Notifications.getAllScheduledNotificationsAsync as jest.Mock
      ).mockRejectedValue(new Error('fail'));
      const notifs = await service.getAllScheduledNotifications();
      expect(notifs).toEqual([]);
    });
  });

  describe('Listeners', () => {
    it('should add a notification received listener', () => {
      const callback = jest.fn();
      const mockSubscription = { remove: jest.fn() };
      (
        Notifications.addNotificationReceivedListener as jest.Mock
      ).mockReturnValue(mockSubscription);

      const subscription = service.addNotificationReceivedListener(callback);

      expect(
        Notifications.addNotificationReceivedListener,
      ).toHaveBeenCalledWith(callback);
      expect(subscription).toBe(mockSubscription);
    });

    it('should add a notification response received listener', () => {
      const callback = jest.fn();
      const mockSubscription = { remove: jest.fn() };
      (
        Notifications.addNotificationResponseReceivedListener as jest.Mock
      ).mockReturnValue(mockSubscription);

      const subscription =
        service.addNotificationResponseReceivedListener(callback);

      expect(
        Notifications.addNotificationResponseReceivedListener,
      ).toHaveBeenCalledWith(callback);
      expect(subscription).toBe(mockSubscription);
    });
  });

  describe('scheduleTicketExpirationNotification', () => {
    beforeEach(() => {
      jest.useFakeTimers();
    });

    afterEach(() => {
      jest.useRealTimers();
    });

    it('should send immediately if less than 1 hour to expiration', async () => {
      const now = new Date('2025-01-01T12:00:00.000Z');
      jest.setSystemTime(now);

      const expirationDate = new Date('2025-01-01T12:30:00.000Z'); // 30 mins from now
      (Notifications.scheduleNotificationAsync as jest.Mock).mockResolvedValue(
        'notification-id',
      );

      const id = await service.scheduleTicketExpirationNotification(
        't1',
        'Movie',
        'Today',
        '12:30',
        expirationDate,
      );

      expect(Notifications.scheduleNotificationAsync).toHaveBeenCalledWith(
        expect.objectContaining({
          trigger: null, // immediate notification
          content: expect.objectContaining({
            title: 'Ticket Expiring Soon! ⏰',
            body: expect.stringContaining('expires soon'),
          }),
        }),
      );
      expect(id).toBe('notification-id');
    });

    it('should not schedule if already expired', async () => {
      const now = new Date('2025-01-01T12:00:00.000Z');
      jest.setSystemTime(now);

      const expirationDate = new Date('2025-01-01T11:00:00.000Z'); // 1 hour ago

      const id = await service.scheduleTicketExpirationNotification(
        't1',
        'Movie',
        'Today',
        '11:00',
        expirationDate,
      );

      expect(consoleWarnSpy).toHaveBeenCalledWith(
        'Ticket already expired, not scheduling notification',
      );
      expect(id).toBe('');
      expect(Notifications.scheduleNotificationAsync).not.toHaveBeenCalled();
    });

    it('should schedule notification 1 hour before expiration', async () => {
      const now = new Date('2025-01-01T12:00:00.000Z');
      jest.setSystemTime(now);

      const expirationDate = new Date('2025-01-01T15:00:00.000Z'); // 3 hours from now
      (Notifications.scheduleNotificationAsync as jest.Mock).mockResolvedValue(
        'scheduled-notification-id',
      );

      const id = await service.scheduleTicketExpirationNotification(
        't1',
        'Movie',
        'Today',
        '15:00',
        expirationDate,
      );

      const expectedTriggerSeconds = 3 * 60 * 60 - 60 * 60; // 3 hours - 1 hour = 2 hours

      expect(Notifications.scheduleNotificationAsync).toHaveBeenCalledWith(
        expect.objectContaining({
          trigger: expect.objectContaining({
            seconds: expectedTriggerSeconds,
            type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
          }),
          content: expect.objectContaining({
            title: 'Ticket Expiring Soon! ⏰',
            body: expect.stringContaining('will expire in 1 hour'),
          }),
        }),
      );
      expect(id).toBe('scheduled-notification-id');
    });

    it('should throw error on failure', async () => {
      const now = new Date('2025-01-01T12:00:00.000Z');
      jest.setSystemTime(now);

      const expirationDate = new Date('2025-01-01T15:00:00.000Z');
      (Notifications.scheduleNotificationAsync as jest.Mock).mockRejectedValue(
        new Error('Scheduling failed'),
      );

      await expect(
        service.scheduleTicketExpirationNotification(
          't1',
          'Movie',
          'Today',
          '15:00',
          expirationDate,
        ),
      ).rejects.toThrow('Scheduling failed');
    });
  });

  describe('scheduleShowReminderNotification', () => {
    beforeEach(() => {
      jest.useFakeTimers();
    });

    afterEach(() => {
      jest.useRealTimers();
    });

    it('should not schedule if show has already started', async () => {
      const now = new Date('2025-01-01T18:00:00.000Z');
      jest.setSystemTime(now);

      const showDateTime = new Date('2025-01-01T17:00:00.000Z'); // 1 hour ago

      const id = await service.scheduleShowReminderNotification(
        't1',
        'Movie',
        'Today',
        '17:00',
        showDateTime,
      );

      expect(consoleWarnSpy).toHaveBeenCalledWith(
        'Show already started, not scheduling reminder',
      );
      expect(id).toBe('');
      expect(Notifications.scheduleNotificationAsync).not.toHaveBeenCalled();
    });

    it('should send immediately if less than 1 hour until show', async () => {
      const now = new Date('2025-01-01T18:00:00.000Z');
      jest.setSystemTime(now);

      const showDateTime = new Date('2025-01-01T18:30:00.000Z'); // 30 mins from now
      (Notifications.scheduleNotificationAsync as jest.Mock).mockResolvedValue(
        'notification-id',
      );

      const id = await service.scheduleShowReminderNotification(
        't1',
        'Movie',
        'Today',
        '18:30',
        showDateTime,
      );

      expect(Notifications.scheduleNotificationAsync).toHaveBeenCalledWith(
        expect.objectContaining({
          trigger: null, // immediate notification
          content: expect.objectContaining({
            title: 'Show Starting Soon! 🎬',
            body: expect.stringContaining('starts soon'),
          }),
        }),
      );
      expect(id).toBe('notification-id');
    });

    it('should schedule notification 1 hour before show', async () => {
      const now = new Date('2025-01-01T18:00:00.000Z');
      jest.setSystemTime(now);

      const showDateTime = new Date('2025-01-01T21:00:00.000Z'); // 3 hours from now
      (Notifications.scheduleNotificationAsync as jest.Mock).mockResolvedValue(
        'scheduled-notification-id',
      );

      const id = await service.scheduleShowReminderNotification(
        't1',
        'Movie',
        'Today',
        '21:00',
        showDateTime,
      );

      const expectedTriggerSeconds = 3 * 60 * 60 - 60 * 60; // 3 hours - 1 hour = 2 hours

      expect(Notifications.scheduleNotificationAsync).toHaveBeenCalledWith(
        expect.objectContaining({
          trigger: expect.objectContaining({
            seconds: expectedTriggerSeconds,
            type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
          }),
          content: expect.objectContaining({
            title: 'Show Starting Soon! 🎬',
            body: expect.stringContaining('starts in 1 hour'),
          }),
        }),
      );
      expect(id).toBe('scheduled-notification-id');
    });

    it('should throw error on failure', async () => {
      const now = new Date('2025-01-01T18:00:00.000Z');
      jest.setSystemTime(now);

      const showDateTime = new Date('2025-01-01T21:00:00.000Z');
      (Notifications.scheduleNotificationAsync as jest.Mock).mockRejectedValue(
        new Error('Scheduling failed'),
      );

      await expect(
        service.scheduleShowReminderNotification(
          't1',
          'Movie',
          'Today',
          '21:00',
          showDateTime,
        ),
      ).rejects.toThrow('Scheduling failed');
    });
  });
});
