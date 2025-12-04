/**
 * Expo App Configuration
 *
 * This file contains the configuration for your Expo app.
 * Expo supports both app.json (JSON) and app.config.js (JavaScript).
 * Using JavaScript allows for comments and dynamic configuration.
 *
 * Documentation: https://docs.expo.dev/guides/config-plugins/
 */

module.exports = {
  expo: {
    owner: "pxviet",
    // Basic App Information
    name: "Movea", // Display name of your app (appears on home screen)
    slug: "Movea", // URL-friendly name used in Expo Go and EAS Build
    version: "1.0.0", // Version number shown to users
    description: "Expo project", // Optional: App description for app stores

    // SDK Version (auto-detected from expo package, but can be explicitly set)
    // sdkVersion: "54.0.0",

    // App Icon and Assets
    icon: "./assets/images/movea-icon.png", // Main app icon (1024x1024px recommended)
    scheme: "movea", // Deep linking URL scheme (e.g., newexpo://)

    // Orientation Settings
    orientation: "portrait", // Options: "portrait", "landscape", "default", "any"

    // User Interface Style
    userInterfaceStyle: "automatic", // Options: "automatic", "light", "dark"

    // New Architecture (React Native Fabric + TurboModules)
    newArchEnabled: true,

    // Privacy Configuration
    privacy: "public", // Options: "public", "unlisted", "hidden"

    // Extra config (Environment variables)
    extra: {
      eas: {
        projectId: "b509cfe2-cbd7-40ae-90bf-18d374c93461",
      },
    },

    // Asset Generation
    assetBundlePatterns: [
      // Patterns for assets to include in standalone builds
      "**/*",
    ],
    // iOS Configuration
    ios: {
      bundleIdentifier: "com.pxviet.movea", // iOS bundle identifier (required for App Store)
      buildNumber: "1", // Build number (increment for each App Store submission)
      supportsTablet: true, // Whether the app supports iPad
      requireFullScreen: false, // Whether the app requires full screen on iPad

      // App Store Information
      config: {
        // iOS-specific configuration
        usesNonExemptEncryption: false, // Required for App Store if using encryption
      },

      // Info.plist additions
      infoPlist: {
        // Custom keys to add to Info.plist
        NSCameraUsageDescription: "This app needs access to your camera",
        NSPhotoLibraryUsageDescription:
          "This app needs access to your photo library",
        NSFaceIDUsageDescription: "This app needs access to your face ID",
        // NSLocationWhenInUseUsageDescription: "This app needs access to your location"
      },

      // Associated Domains (for universal links)
      // associatedDomains: ["applinks:yourapp.com"],

      // URL Schemes (additional to main scheme)
      // urlScheme: "newexpo",

      // Google Services (for Firebase, etc.)
      // googleServicesFile: "./GoogleService-Info.plist",
    },

    // Android Configuration
    android: {
      package: "com.movea.app", // Android package name (reverse domain notation)
      versionCode: 1, // Version code (increment for each Play Store submission)
      adaptiveIcon: {
        backgroundColor: "#0B0F2F", // Background color for adaptive icon
        foregroundImage: "./assets/images/movea-icon.png", // Foreground icon image
        backgroundImage: "./assets/images/movea-icon.png", // Background icon image
      },
      predictiveBackGestureEnabled: false, // Enable predictive back gesture

      // Permissions (declared in AndroidManifest.xml)
      permissions: [
        // Uncomment as needed:
        // "CAMERA",
        // "RECORD_AUDIO",
        // "READ_EXTERNAL_STORAGE",
        // "WRITE_EXTERNAL_STORAGE",
        // "ACCESS_FINE_LOCATION",
        // "ACCESS_COARSE_LOCATION",
        // "ACCESS_BACKGROUND_LOCATION",
        // "INTERNET",
        // "VIBRATE"
      ],

      // Play Store Configuration
      playStoreUrl: "", // Your app's Play Store URL

      // Adaptive Icon Configuration
      // adaptiveIcon: {
      //   backgroundColor: "#E6F4FE",
      //   foregroundImage: "./assets/images/android-icon-foreground.png"
      // }
    },

    // Web Configuration
    web: {
      output: "static", // Options: "static", "single" (SPA)
      favicon: "./assets/images/favicon.png", // Web favicon
      bundler: "metro", // Options: "metro", "webpack"
    },

    // Plugins Configuration
    plugins: [
      "expo-router", // File-based routing
      [
        "expo-splash-screen", // Splash screen plugin
        {
          image: "./assets/images/movea-icon.png",
          imageWidth: 120,
          resizeMode: "contain",
          backgroundColor: "#0B0F2F",
          dark: {
            backgroundColor: "#0B0F2F",
          },
        },
      ],
      "expo-video",
      [
        "expo-camera",
        {
          photosPermission:
            "Allow $(PRODUCT_NAME) to access photos to choose profile picture",
          cameraPermission: "Allow $(PRODUCT_NAME) to access your camera",
          microphonePermission:
            "Allow $(PRODUCT_NAME) to access your microphone",
          recordAudioAndroid: true,
        },
      ],
      [
        "expo-image-picker",
        {
          photosPermission:
            "The app needs access to your photos to choose profile picture",
          cameraPermission:
            "The app needs access to your camera for taking photos",
          microphonePermission:
            "The app needs access to your microphone for recording videos",
        },
      ],
      [
        "expo-secure-store",
        {
          configureAndroidBackup: true,
          faceIDPermission: "Allow $(PRODUCT_NAME) to access your face ID",
          touchIDPermission: "Allow $(PRODUCT_NAME) to access your touch ID",
        },
      ],
    ],

    experiments: {
      typedRoutes: true, // Type-safe routing with expo-router
      reactCompiler: true, // React Compiler (React 19+)
    },

    // Updates Configuration (for EAS Update)
    updates: {
    },

    // Notification Configuration
    notification: {
      // icon: "./assets/images/notification-icon.png",
      // color: "#ffffff",
      // iosDisplayInForeground: true,
      // androidMode: "default" // Options: "default", "collapse"
    },

    // Primary Color (for Android)
    primaryColor: "#0B0F2F",

    // Locales
    locales: {
      // Language-specific configuration
      // en: "./locales/en.json",
      // es: "./locales/es.json"
    },
  },
};
