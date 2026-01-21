/**
 * UUID generation utility using expo-crypto
 * Replaces the uuid package to reduce bundle size
 */
import * as Crypto from 'expo-crypto';

/**
 * Generate a UUID v4 compatible string
 * Uses expo-crypto which is already included in the app
 * This reduces bundle size by ~50KB compared to the uuid package
 */
export const generateUUID = async (): Promise<string> => {
  // Generate random bytes and convert to UUID v4 format
  const randomBytes = await Crypto.getRandomBytesAsync(16);

  // Set version (4) and variant bits according to UUID v4 spec
  randomBytes[6] = (randomBytes[6] ?? 0 & 0x0f) | 0x40; // Version 4
  randomBytes[8] = (randomBytes[8] ?? 0 & 0x3f) | 0x80; // Variant 10

  // Convert to hex string and format as UUID
  const hex = Array.from(randomBytes)
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');

  return [
    hex.slice(0, 8),
    hex.slice(8, 12),
    hex.slice(12, 16),
    hex.slice(16, 20),
    hex.slice(20, 32),
  ].join('-');
};

/**
 * Synchronous UUID generation using Date and Math.random
 * Use this for optimistic updates where async is not suitable
 * Note: This is not cryptographically secure but sufficient for temporary IDs
 */
export const generateUUIDSync = (): string => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
};
