export interface PushToken {
  id: string;
  userId: string;
  expoPushToken: string;
  deviceId?: string;
  platform: 'ios' | 'android';
  createdAt: string;
  updatedAt: string;
  isActive: boolean;
}
