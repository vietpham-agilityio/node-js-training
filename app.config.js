/**
 * Expo App Configuration
 *
 * This file contains the configuration for your Expo app.
 * Expo supports both app.json (JSON) and app.config.js (JavaScript).
 * Using JavaScript allows for comments and dynamic configuration.
 *
 * Documentation: https://docs.expo.dev/guides/config-plugins/
 */

const IS_DEV = process.env.MY_ENVIRONMENT === "development";

module.exports = {
  expo: {
    owner: "pxviet",
    // Basic App Information
    name: "new-expo", // Display name of your app (appears on home screen)
    slug: "new-expo", // URL-friendly name used in Expo Go and EAS Build
    version: "1.0.0", // Version number shown to users
    description: "Expo project", // Optional: App description for app stores

    // SDK Version (auto-detected from expo package, but can be explicitly set)
    // sdkVersion: "54.0.0",

    // App Icon and Assets
    icon: "./assets/images/icon.png", // Main app icon (1024x1024px recommended)
    scheme: "newexpo", // Deep linking URL scheme (e.g., newexpo://)

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
      fact: IS_DEV
        ? "The first bicycle was invented in 1817 by Pierre Michaux"
        : "The first computer was invented in 1833 by Charles Babbage",
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
      bundleIdentifier: "com.pxviet.new-expo", // iOS bundle identifier (required for App Store)
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
      package: "com.newexpo.app", // Android package name (reverse domain notation)
      versionCode: 1, // Version code (increment for each Play Store submission)
      adaptiveIcon: {
        backgroundColor: "#E6F4FE", // Background color for adaptive icon
        foregroundImage: "./assets/images/android-icon-foreground.png", // Foreground layer (must be 1024x1024px)
        backgroundImage: "./assets/images/android-icon-background.png", // Background layer (optional)
        monochromeImage: "./assets/images/android-icon-monochrome.png", // Monochrome icon for Android 13+
      },
      edgeToEdgeEnabled: true, // Enable edge-to-edge display (Android 15+)
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

      // Google Services (for Firebase, etc.)
      // googleServicesFile: "./google-services.json",

      // Intent filters for deep linking
      // intentFilters: [
      //   {
      //     action: "VIEW",
      //     data: [
      //       {
      //         scheme: "https",
      //         host: "yourapp.com",
      //         pathPrefix: "/"
      //       }
      //     ],
      //     category: ["BROWSABLE", "DEFAULT"]
      //   }
      // ],

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

      // PWA Configuration
      // name: "New Expo App",
      // shortName: "NewExpo",
      // themeColor: "#ffffff",
      // backgroundColor: "#ffffff",
      // display: "standalone",
      // startUrl: "/",
      // scope: "/",
      // orientation: "portrait",
      // description: "A modern Expo app",

      // Meta tags
      // meta: {
      //   viewport: "width=device-width, initial-scale=1",
      //   themeColor: "#ffffff"
      // }
    },

    // Plugins Configuration
    plugins: [
      "expo-router", // File-based routing
      [
        "expo-splash-screen", // Splash screen plugin
        {
          image: "./assets/images/splash-screen.png",
          imageWidth: 200,
          resizeMode: "contain",
          backgroundColor: "#ffffff",
          dark: {
            backgroundColor: "#000000",
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
      // Add more plugins as needed:
      // "expo-font",
      // "expo-location",
      // "expo-camera",
      // "expo-notifications",
      // [
      //   "expo-build-properties",
      //   {
      //     ios: {
      //       deploymentTarget: "13.4"
      //     },
      //     android: {
      //       compileSdkVersion: 34,
      //       targetSdkVersion: 34,
      //       buildToolsVersion: "34.0.0"
      //     }
      //   }
      // ]
    ],

    // Experiments (beta features)
    experiments: {
      typedRoutes: true, // Type-safe routing with expo-router
      reactCompiler: true, // React Compiler (React 19+)
    },

    // Updates Configuration (for EAS Update)
    updates: {
      // url: "https://u.expo.dev/your-project-id",
      // enabled: true,
      // checkAutomatically: "ON_LOAD", // Options: "ON_LOAD", "ON_ERROR_RECOVERY", "NEVER"
      // fallbackToCacheTimeout: 0
    },

    // Runtime Version
    // runtimeVersion: {
    //   policy: "appVersion" // Options: "appVersion", "sdkVersion", "nativeVersion"
    // },

    // Notification Configuration
    notification: {
      // icon: "./assets/images/notification-icon.png",
      // color: "#ffffff",
      // iosDisplayInForeground: true,
      // androidMode: "default" // Options: "default", "collapse"
    },

    // App Store Listing Configuration
    // appStoreUrl: "", // iOS App Store URL
    // playStoreUrl: "", // Android Play Store URL

    // Owner (for Expo organization)
    // owner: "your-expo-username",

    // GitHub Repository
    // githubUrl: "https://github.com/username/repo",

    // Primary Color (for Android)
    primaryColor: "#ffffff",

    // Locales
    locales: {
      // Language-specific configuration
      // en: "./locales/en.json",
      // es: "./locales/es.json"
    },

    // Development Build Configuration
    // developmentClient: {
    //   silentLaunch: true
    // },

    // Expo Go Configuration
    // isDetached: false, // Set to true if using development builds

    // Asset Extensions (additional file types to bundle)
    // assetExts: ["ttf", "otf", "woff", "woff2"],

    // Source Extensions (additional JavaScript/TypeScript extensions)
    // sourceExts: ["js", "jsx", "ts", "tsx", "json"],

    // Metro Bundler Configuration
    // metro: {
    //   // Custom Metro configuration
    // },
  },
};
