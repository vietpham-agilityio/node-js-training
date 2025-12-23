import { Platform } from 'react-native';
import { isAndroid, isIOS } from '../platform';

// Mock Platform
jest.mock('react-native', () => ({
  Platform: {
    OS: 'ios',
  },
}));

// Mock Constants
jest.mock('expo-constants', () => ({
  default: {
    statusBarHeight: 44,
  },
}));

describe('platform utilities', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('isIOS', () => {
    it('should return true when Platform.OS is ios', () => {
      (Platform.OS as any) = 'ios';
      expect(isIOS()).toBe(true);
    });

    it('should return false when Platform.OS is not ios', () => {
      (Platform.OS as any) = 'android';
      expect(isIOS()).toBe(false);
    });
  });

  describe('isAndroid', () => {
    it('should return true when Platform.OS is android', () => {
      (Platform.OS as any) = 'android';
      expect(isAndroid()).toBe(true);
    });

    it('should return false when Platform.OS is not android', () => {
      (Platform.OS as any) = 'ios';
      expect(isAndroid()).toBe(false);
    });
  });
});
