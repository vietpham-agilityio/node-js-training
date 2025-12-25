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

describe('PushNotificationService', () => {
  let service: PushNotificationService;

  beforeEach(() => {
    jest.clearAllMocks();
    service = PushNotificationService.getInstance();
    Platform.OS = 'ios';
  });

  it('should be a singleton', () => {
    const instance1 = PushNotificationService.getInstance();
    const instance2 = PushNotificationService.getInstance();
    expect(instance1).toBe(instance2);
    expect(instance1).toBe(pushNotificationService);
  });

  describe('registerForPushNotifications', () => {
    it('should return null if not on a physical device', async () => {
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
  });

  describe('sendLocalNotification', () => {
    it('should send an immediate local notification', async () => {
      (Notifications.scheduleNotificationAsync as jest.Mock).mockResolvedValue(
        'notification-id',
      );
      const id = await service.sendLocalNotification('Title', 'Body');
      expect(Notifications.scheduleNotificationAsync).toHaveBeenCalledWith(
        expect.objectContaining({
          trigger: null,
        }),
      );
      expect(id).toBe('notification-id');
    });
  });

  describe('cancelAllScheduledNotifications', () => {
    it('should cancel all notifications', async () => {
      await service.cancelAllScheduledNotifications();
      expect(
        Notifications.cancelAllScheduledNotificationsAsync,
      ).toHaveBeenCalled();
    });
  });

  describe('cancelNotification', () => {
    it('should cancel a specific notification', async () => {
      await service.cancelNotification('notification-id');
      expect(
        Notifications.cancelScheduledNotificationAsync,
      ).toHaveBeenCalledWith('notification-id');
    });
  });

  describe('Listeners', () => {
    it('should add a notification received listener', () => {
      const callback = () => {};
      service.addNotificationReceivedListener(callback);
      expect(
        Notifications.addNotificationReceivedListener,
      ).toHaveBeenCalledWith(callback);
    });

    it('should add a notification response received listener', () => {
      const callback = () => {};
      service.addNotificationResponseReceivedListener(callback);
      expect(
        Notifications.addNotificationResponseReceivedListener,
      ).toHaveBeenCalledWith(callback);
    });
  });
});
