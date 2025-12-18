// Load test environment variables
if (process.env.NODE_ENV === 'test') {
  process.env.EXPO_PUBLIC_SUPABASE_URL = 'https://test.supabase.co';
  process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY = 'test-anon-key';
}

// Mock dependencies
jest.mock('react-native-reanimated', () => ({
  ...jest.requireActual('react-native-reanimated/mock'),
  useSharedValue: jest.fn(() => ({ value: 0 })),
}));

// Mock uniwind
jest.mock('uniwind', () => ({
  useResolveClassNames: (classNames: string) => ({ className: classNames }),
  withUniwind: (Component: typeof Text) => Component,
}));

// Mock @react-native-async-storage/async-storage
jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock'),
);

jest.mock('expo-file-system/legacy', () => ({
  readAsStringAsync: jest.fn(),
  EncodingType: {
    Base64: 'base64',
  },
}));

jest.mock('base64-arraybuffer', () => ({
  decode: jest.fn(),
}));

// Mock dependencies
jest.mock('expo', () => ({
  useEvent: jest.fn((player, event, initialState) => initialState),
}));

jest.mock('expo-video', () => ({
  useVideoPlayer: jest.fn((source, callback) => {
    const player = {
      playing: false,
      loop: false,
      play: jest.fn(),
      pause: jest.fn(),
    };
    callback?.(player);
    return player;
  }),
}));

jest.mock('expo-video-thumbnails', () => ({
  getThumbnailAsync: jest.fn(() =>
    Promise.resolve({ uri: 'mock-thumbnail-uri.jpg' }),
  ),
}));

// Mock expo-image
jest.mock('expo-image', () => ({
  Image: jest.fn(() => 'Image'),
}));

// Mock uuid package (ES module)
jest.mock('uuid', () => ({
  v4: jest.fn(() => 'mock-uuid-v4'),
}));
