import { existsSync } from 'node:fs';

import { ConfigContext, ExpoConfig } from 'expo/config';

// FCM push is not wired up yet, so google-services.json is optional. Point at it
// only when it is actually present (env var or checked-in file); otherwise leave
// the key off so `expo run:android` / prebuild does not fail on a missing file.
const googleServicesFile =
  process.env.GOOGLE_SERVICES_JSON ??
  (existsSync('./google-services.json') ? './google-services.json' : undefined);

export default ({ config }: ConfigContext): ExpoConfig => ({
  ...config,
  owner: 'px_viet',
  name: 'Movea',
  slug: 'movea',
  version: '1.0.0',
  orientation: 'portrait',
  icon: './assets/images/movea-icon.png',
  scheme: 'movieticketbooking',
  userInterfaceStyle: 'automatic',
  newArchEnabled: true,
  assetBundlePatterns: ['**/*'],
  backgroundColor: '#0B0F2F',
  ios: {
    supportsTablet: true,
    bundleIdentifier: 'com.anonymous.movieticketbooking',
    infoPlist: {
      ITSAppUsesNonExemptEncryption: false,
      UIBackgroundModes: ['remote-notification'],
      CFBundleURLTypes: [
        {
          CFBundleURLSchemes: ['movieticketbooking'],
          CFBundleURLName: 'com.anonymous.movieticketbooking',
        },
      ],
    },
    associatedDomains: ['applinks:movie-ticket-booking.expo.app'],
  },
  android: {
    adaptiveIcon: {
      backgroundColor: '#0B0F2F',
      foregroundImage: './assets/images/movea-icon.png',
      backgroundImage: './assets/images/movea-icon.png',
    },
    edgeToEdgeEnabled: true,
    softwareKeyboardLayoutMode: 'pan',
    package: 'com.anonymous.movieticketbooking',
    predictiveBackGestureEnabled: false,
    intentFilters: [
      {
        action: 'VIEW',
        autoVerify: true,
        data: [
          {
            scheme: 'movieticketbooking',
            host: '*',
          },
          {
            scheme: 'https',
            host: '*.movie-ticket-booking.expo.app',
            pathPrefix: '/auth',
          },
        ],
        category: ['BROWSABLE', 'DEFAULT'],
      },
    ],
    ...(googleServicesFile ? { googleServicesFile } : {}),
  },
  web: {
    output: 'static',
    favicon: './assets/images/favicon.png',
    bundler: 'metro',
  },
  plugins: [
    'expo-router',
    [
      'expo-splash-screen',
      {
        image: './assets/images/movea-icon.png',
        imageWidth: 120,
        resizeMode: 'contain',
        backgroundColor: '#0B0F2F',
        dark: {
          backgroundColor: '#0B0F2F',
        },
      },
    ],
    'expo-video',
    [
      'expo-camera',
      {
        photosPermission:
          'Allow $(PRODUCT_NAME) to access photos to choose profile picture',
        cameraPermission: 'Allow $(PRODUCT_NAME) to access your camera',
        microphonePermission: 'Allow $(PRODUCT_NAME) to access your microphone',
        recordAudioAndroid: true,
      },
    ],
    [
      'expo-image-picker',
      {
        photosPermission:
          'The app needs access to your photos to choose profile picture',
        cameraPermission:
          'The app needs access to your camera for taking photos',
        microphonePermission:
          'The app needs access to your microphone for recording videos',
      },
    ],
    [
      'expo-secure-store',
      {
        configureAndroidBackup: true,
        faceIDPermission: 'Allow $(PRODUCT_NAME) to access your face ID',
        touchIDPermission: 'Allow $(PRODUCT_NAME) to access your touch ID',
      },
    ],
    [
      'expo-location',
      {
        locationAlwaysAndWhenInUsePermission:
          'Allow $(PRODUCT_NAME) to use your location.',
      },
    ],
    [
      'expo-notifications',
      {
        icon: './assets/images/movea-icon.png',
        color: '#0B0F2F',
      },
    ],
  ],
  experiments: {
    typedRoutes: true,
    reactCompiler: true,
  },
  primaryColor: '#0B0F2F',
  extra: {
    eas: {
      projectId: '55913f90-5eeb-4669-a915-82809054f674',
    },
  },
  updates: {
    url: 'https://u.expo.dev/55913f90-5eeb-4669-a915-82809054f674',
  },
  runtimeVersion: {
    policy: 'appVersion',
  },
});
