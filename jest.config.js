module.exports = {
  preset: 'jest-expo',
  setupFiles: [
    './jest.setup.ts',
    '@react-native-async-storage/async-storage/jest/async-storage-mock',
  ],
  collectCoverage: true,
  collectCoverageFrom: [
    'src/utils/**/*.{ts,tsx,js,jsx}',
    'src/components/**/*.{ts,tsx,js,jsx}',
    'src/hooks/**/*.{ts,tsx,js,jsx}',
    'src/features/**/*.{ts,tsx,js,jsx}',
    '!src/features/**/*.stories.{ts,tsx,js,jsx}',
    '!src/features/**/types/*.{ts,tsx,js,jsx}',
    '!src/components/**/*.stories.{ts,tsx}',
    '!**/expo-env.d.ts',
    '!**/.expo/**',
  ],
  coverageThreshold: {
    global: {
      statements: 80,
      branches: 80,
      functions: 80,
      lines: 80,
    },
  },
};
