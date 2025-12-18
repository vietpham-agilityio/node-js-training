# Movea App - Movie Ticket App

## 📱 Overview

This document provides information about React Native Expo big practice.

## ✨ Features

- **Authentication**
  - Sign In / Sign Up functionality
  - Secure user session management
  - Social sign in

- **Movie Management**
  - Paginated movies list (100+ items)
  - Search movies
  - Filter movies by genre and ratings
  - Booking a movie

- **Profile**
  - View and edit user profile
  - Change avatar using Camera or Image Picker
  - Profile settings management
  - Change password

- **My Ticket**
  - Paginated tickets list (100+ items)
  - Filter tickets by status

- **Wallet**
  - Paginated transactions list (100+ items)
  - Top up my wallet

- **UI/UX**
  - Custom splash screen
  - Custom app icon
  - Accessibility support
  - Platform-specific optimizations (Android & iOS)

## 🛠 Technical Stack

- [**React Native & Expo**](https://docs.expo.dev/)
- [**React**](https://react.dev/)
- [**TypeScript**](https://www.typescriptlang.org/)
- [**Zustand**](https://zustand-demo.pmnd.rs/)
- [**React Query**](https://tanstack.com/)
- [**React Hook Form**](https://react-hook-form.com/)
- [**React Native Unistyles**](https://www.unistyl.es/v3/start/introduction)
- [**Storybook**](https://storybook.js.org/)
- [**Jest & React Native Testing Library**](https://jestjs.io/)
- [**ESLint & Prettier**](https://eslint.org/)
- [**Husky**](https://typicode.github.io/husky/)

## 📂 Project Structure

```
movea-app/
├── app/                    # App router screens
├── assets/                 # Images, fonts, and other static files
├── components/             # Reusable components
├── constants/              # App constants and configuration
├── hooks/                  # Custom React hooks
├── mocks/                  # Mock data
├── services/               # API services
├── stores/                 # State management stores
├── types/                  # TypeScript type definitions
├── utils/                  # Utility functions
├── .editorconfig           # Editor configuration
├── .gitignore              # Git ignore rules
├── .lintstagedrc.js        # Lint-staged configuration
├── .prettierrc             # Prettier configuration
├── app.json                # Expo configuration
├── babel.config.js         # Babel configuration
├── eas.json                # EAS configuration
├── eslint.config.js        # ESLint configuration
├── index.ts                # Entry point
├── jest.config.js          # Jest configuration
├── jest.setup.ts           # Jest setup
├── metro.config.js         # Metro bundler configuration
├── package.json            # Dependencies
├── tsconfig.json           # TypeScript configuration
├── unistyles.ts            # Unistyles configuration
├── pnpm-lock.yaml           # Pnpm lock file
└── README.md               # This file
```

## 🚀 Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm or pnpm 
- Expo CLI
- iOS Simulator (Mac only) or Android Emulator

### Installation

1. Clone the repository:

```bash
git@gitlab.asoft-python.com:viet.pham/reactnative.git
```

and

```bash
git checkout feat/expo-practice
```

2. Install dependencies:

```bash
npm install
# or
pnpm install
```

3. Setup environment variables

- Option 1: Create your **.env** file:

```bash
EXPO_PUBLIC_SUPABASE_URL=
EXPO_PUBLIC_SUPABASE_ANON_KEY=
```

- Option 2: Pull environment variables for your local development (need to Expo account)

Run the following command to create a .env file in the root of your project:

```bash
eas env:pull --environment development
```

The created .env.local file will look like this:

```bash
# Environment: development

EXPO_PUBLIC_SUPABASE_URL=
EXPO_PUBLIC_SUPABASE_ANON_KEY=
```

4. Start the development server:

```bash
npx expo start
```

5. Run on your preferred platform:
   - Press `i` for iOS simulator
   - Press `a` for Android emulator
   - Scan QR code with Expo Go app on your physical device

## 🧪 Testing

Run unit tests:

```bash
npm test
# or
yarn test
```

Run tests with coverage:

```bash
npm test -- --coverage
# or
yarn test --coverage
```

## 📚 Storybook

Launch Storybook for component development:

```bash
npm run storybook:start
# or
yarn storybook:start
```

## 🎨 Code Quality

Format code:

```bash
npm run format
# or
yarn format
```

Lint code:

```bash
npm run lint
# or
yarn lint
```

## 📅 Timeline

- **Estimation**: Dec 2, 2025 (2 Sprints)
- **Started**: Dec 3, 2025

## 🎯 Project Goals

- ✅ Handle platform differences between Android and iOS
- ✅ Achieve >80% unit test coverage
- ✅ Custom app icon and splash screen
- ✅ Authentication screens (Login/Signup)
- ✅ Home screen with 100+ paginated items
- ✅ Profile screen with camera/image picker integration
- ✅ Accessibility compliance

## 📝 Design

Design specifications can be found at: [Design Link](https://www.figma.com/design/TdbzhXYFUNAW3vjyUc5aKt/News-App-UI-Kit--Community-?node-id=0-1&t=9f9b56y6ptuOSdWd-1)

## 📄 License

This project is licensed under the MIT License.

## 👥 Team

- Developer: [Nhat Duong Cong](mailto:nhat.duong@asnet.com.vn), [Viet Pham](mailto:viet.pham@asnet.com.vn)

- GitLab: [@nhat.duong](https://gitlab.asoft-python.com/nhat.duong), [@viet.pham](https://gitlab.asoft-python.com/viet.pham)

- Slack: nhat.duong, viet.pham
