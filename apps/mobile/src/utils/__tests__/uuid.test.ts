import * as Crypto from 'expo-crypto';
import { generateUUID, generateUUIDSync } from '../uuid';

// Unmock the UUID utility module to get its actual implementation
jest.unmock('../uuid');

describe('UUID Utilities', () => {
  describe('generateUUID', () => {
    // Mock expo-crypto.getRandomBytesAsync for generateUUID tests
    // For format testing, we need a predictable output.
    // For uniqueness, we can rely on actual random bytes.
    const mockGetRandomBytesAsync = jest.spyOn(Crypto, 'getRandomBytesAsync');

    beforeEach(() => {
      // Reset mocks before each test to prevent interference
      mockGetRandomBytesAsync.mockReset();
      // Default implementation for getRandomBytesAsync to produce varied bytes for uniqueness tests
      mockGetRandomBytesAsync.mockImplementation(async (byteCount: number) => {
        const bytes = new Uint8Array(byteCount);
        for (let i = 0; i < byteCount; i++) {
          bytes[i] = Math.floor(Math.random() * 256);
        }
        return bytes;
      });
    });

    it('should return a string', async () => {
      const uuid = await generateUUID();
      expect(typeof uuid).toBe('string');
    });

    it('should return a UUID in the correct format', async () => {
      // Mock for this specific test to produce a known UUID
      mockGetRandomBytesAsync.mockImplementationOnce(
        async (byteCount: number) => {
          // A specific set of bytes that should result in a valid UUID v4
          // Example: 12345678-1234-4234-a234-1234567890ab
          // Version (4): bits 12-15 of byte 6 set to 0100 (0x40), so byte[6] & 0x0f | 0x40
          // Variant (10): bits 6-7 of byte 8 set to 10 (0x80), so byte[8] & 0x3f | 0x80
          const fixedBytes = new Uint8Array([
            0x12,
            0x34,
            0x56,
            0x78,
            0x12,
            0x34, // first 6 bytes
            (0x12 & 0x0f) | 0x40, // byte 6 (version 4) -  0x12 -> 0x52
            0x34, // byte 7
            (0x12 & 0x3f) | 0x80, // byte 8 (variant 10) - 0x12 -> 0x92
            0x34,
            0x56,
            0x78,
            0x90,
            0xab,
            0xcd,
            0xef, // rest
            0x12,
            0x34,
            0x56,
            0x78,
            0x90,
            0xab,
          ]);
          return fixedBytes.slice(0, byteCount);
        },
      );

      const uuid = await generateUUID();
      const uuidRegex =
        /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
      expect(uuid).toMatch(uuidRegex);
    });

    it('should generate unique UUIDs', async () => {
      const uuids = new Set<string>();
      const numUuidsToGenerate = 1000;

      for (let i = 0; i < numUuidsToGenerate; i++) {
        const uuid = await generateUUID();
        uuids.add(uuid);
      }
      expect(uuids.size).toBe(numUuidsToGenerate);
    });
  });

  describe('generateUUIDSync', () => {
    it('should return a string', () => {
      const uuid = generateUUIDSync();
      expect(typeof uuid).toBe('string');
    });

    it('should return a UUID in the correct format', () => {
      const uuid = generateUUIDSync();
      const uuidRegex =
        /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
      expect(uuid).toMatch(uuidRegex);
    });

    it('should generate unique UUIDs (with high probability)', () => {
      const uuids = new Set<string>();
      const numUuidsToGenerate = 1000;

      for (let i = 0; i < numUuidsToGenerate; i++) {
        const uuid = generateUUIDSync();
        uuids.add(uuid);
      }
      expect(uuids.size).toBe(numUuidsToGenerate);
    });

    it('should contain "4" at the 15th character (version 4 UUID)', () => {
      const uuid = generateUUIDSync();
      expect(uuid[14]).toBe('4');
    });

    it('should contain a valid variant character (8, 9, a, or b) at the 20th character', () => {
      const uuid = generateUUIDSync();
      const variantChar = uuid[19];
      expect(['8', '9', 'a', 'b']).toContain(variantChar);
    });
  });
});
