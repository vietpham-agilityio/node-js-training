import Constants from 'expo-constants';
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

// Set notification handler
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export class PushNotificationService {
  private static instance: PushNotificationService;

  private constructor() {}

  static getInstance(): PushNotificationService {
    if (!PushNotificationService.instance) {
      PushNotificationService.instance = new PushNotificationService();
    }
    return PushNotificationService.instance;
  }

  /**
   * Register for push notifications and get Expo Push Token
   */
  async registerForPushNotifications(): Promise<string | null> {
    try {
      // Check if running on physical device
      if (!Device.isDevice) {
        console.warn('Push notifications only work on physical devices');
        return null;
      }

      // Get current permission status
      const { status: existingStatus } =
        await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;

      // Request permissions if not granted
      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      // Check if permission granted
      if (finalStatus !== 'granted') {
        console.warn('Push notification permission not granted');
        return null;
      }

      // Get Expo Push Token
      const projectId = Constants.expoConfig?.extra?.eas?.projectId;

      if (!projectId) {
        console.error('EAS Project ID not found');
        return null;
      }

      const token = await Notifications.getExpoPushTokenAsync({
        projectId,
      });

      // Configure notification channel for Android
      if (Platform.OS === 'android') {
        await Notifications.setNotificationChannelAsync('default', {
          name: 'default',
          importance: Notifications.AndroidImportance.MAX,
          vibrationPattern: [0, 250, 250, 250],
          lightColor: '#FF231F7C',
        });
      }

      return token.data;
    } catch {
      return null;
    }
  }

  /**
   * Schedule local notification (for testing)
   */
  async scheduleLocalNotification(
    title: string,
    body: string,
    data?: Record<string, any>,
    triggerSeconds: number = 5,
  ): Promise<string> {
    try {
      const notificationId = await Notifications.scheduleNotificationAsync({
        content: {
          title,
          body,
          data,
          sound: true,
          priority: Notifications.AndroidNotificationPriority.HIGH,
        },
        trigger: {
          seconds: triggerSeconds,
          type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
        },
      });

      return notificationId;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Send immediate local notification
   */
  async sendLocalNotification(
    title: string,
    body: string,
    data?: Record<string, any>,
  ): Promise<string> {
    try {
      const notificationId = await Notifications.scheduleNotificationAsync({
        content: {
          title,
          body,
          data,
          sound: true,
          priority: Notifications.AndroidNotificationPriority.HIGH,
        },
        trigger: null, // null means send immediately
      });

      return notificationId;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Cancel all scheduled notifications
   */
  async cancelAllScheduledNotifications(): Promise<void> {
    try {
      await Notifications.cancelAllScheduledNotificationsAsync();
    } catch (error) {
      throw error;
    }
  }

  /**
   * Cancel specific notification
   */
  async cancelNotification(notificationId: string): Promise<void> {
    try {
      await Notifications.cancelScheduledNotificationAsync(notificationId);
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get all scheduled notifications
   */
  async getAllScheduledNotifications(): Promise<
    Notifications.NotificationRequest[]
  > {
    try {
      const notifications =
        await Notifications.getAllScheduledNotificationsAsync();
      return notifications;
    } catch {
      return [];
    }
  }

  /**
   * Add notification received listener
   */
  addNotificationReceivedListener(
    callback: (notification: Notifications.Notification) => void,
  ): Notifications.EventSubscription {
    return Notifications.addNotificationReceivedListener(callback);
  }

  /**
   * Add notification response listener (when user taps notification)
   */
  addNotificationResponseReceivedListener(
    callback: (response: Notifications.NotificationResponse) => void,
  ): Notifications.EventSubscription {
    return Notifications.addNotificationResponseReceivedListener(callback);
  }

  /**
   * Schedule notification for ticket expiration
   */
  async scheduleTicketExpirationNotification(
    ticketId: string,
    movieTitle: string,
    showDate: string,
    showTime: string,
    expirationDate: Date,
  ): Promise<string> {
    try {
      const now = new Date();
      const timeUntilExpiration = expirationDate.getTime() - now.getTime();
      const secondsUntilExpiration = Math.floor(timeUntilExpiration / 1000);

      // Don't schedule if already expired
      if (secondsUntilExpiration <= 0) {
        console.warn('Ticket already expired, not scheduling notification');
        return '';
      }

      // Schedule notification 1 hour before expiration
      const notificationTime = secondsUntilExpiration - 60 * 60; // 1 hour before

      if (notificationTime <= 0) {
        // If less than 1 hour until expiration, notify immediately
        return await this.sendLocalNotification(
          'Ticket Expiring Soon! ⏰',
          `Your ticket for "${movieTitle}" expires soon! Show: ${showDate} at ${showTime}`,
          {
            type: 'ticket_expiring',
            ticketId,
            movieTitle,
            showDate,
            showTime,
          },
        );
      }

      // Schedule notification for 1 hour before expiration
      const notificationId = await this.scheduleLocalNotification(
        'Ticket Expiring Soon! ⏰',
        `Your ticket for "${movieTitle}" will expire in 1 hour! Show: ${showDate} at ${showTime}`,
        {
          type: 'ticket_expiring',
          ticketId,
          movieTitle,
          showDate,
          showTime,
        },
        notificationTime,
      );

      return notificationId;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Schedule notification for show reminder (1 hour before show)
   */
  async scheduleShowReminderNotification(
    ticketId: string,
    movieTitle: string,
    showDate: string,
    showTime: string,
    showDateTime: Date,
  ): Promise<string> {
    try {
      const now = new Date();
      const timeUntilShow = showDateTime.getTime() - now.getTime();
      const secondsUntilShow = Math.floor(timeUntilShow / 1000);

      // Don't schedule if show already started
      if (secondsUntilShow <= 0) {
        console.warn('Show already started, not scheduling reminder');
        return '';
      }

      // Schedule notification 1 hour before show
      const notificationTime = secondsUntilShow - 60 * 60; // 1 hour before

      if (notificationTime <= 0) {
        // If less than 1 hour until show, notify immediately
        return await this.sendLocalNotification(
          'Show Starting Soon! 🎬',
          `"${movieTitle}" starts soon at ${showTime}! Don't be late!`,
          {
            type: 'show_reminder',
            ticketId,
            movieTitle,
            showDate,
            showTime,
          },
        );
      }

      // Schedule notification
      const notificationId = await this.scheduleLocalNotification(
        'Show Starting Soon! 🎬',
        `"${movieTitle}" starts in 1 hour at ${showTime}! Get ready!`,
        {
          type: 'show_reminder',
          ticketId,
          movieTitle,
          showDate,
          showTime,
        },
        notificationTime,
      );

      return notificationId;
    } catch (error) {
      throw error;
    }
  }
}

export const pushNotificationService = PushNotificationService.getInstance();
