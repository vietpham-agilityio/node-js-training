import { generateUUID, generateUUIDSync } from '../uuid';

// Unmock uuid utility (mocked globally in jest.setup.ts)
jest.unmock('@/utils/uuid');

// Mock expo-crypto
const mockGetRandomBytesAsync = jest.fn();

jest.mock('expo-crypto', () => ({
  getRandomBytesAsync: (size: number) => mockGetRandomBytesAsync(size),
}));

// Import after mocks are set up

describe('UUID Utility', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('generateUUID', () => {
    it('should generate a valid UUID v4 format', async () => {
      // Mock random bytes
      const mockBytes = new Uint8Array([
        0x12, 0x34, 0x56, 0x78, 0x9a, 0xbc, 0xde, 0xf0, 0x12, 0x34, 0x56, 0x78,
        0x9a, 0xbc, 0xde, 0xf0,
      ]);
      mockGetRandomBytesAsync.mockResolvedValue(mockBytes);

      const uuid = await generateUUID();

      // UUID format: xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
      expect(uuid).toMatch(
        /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/,
      );
    });

    it('should request 16 random bytes', async () => {
      const mockBytes = new Uint8Array(16).fill(0);
      mockGetRandomBytesAsync.mockResolvedValue(mockBytes);

      await generateUUID();

      expect(mockGetRandomBytesAsync).toHaveBeenCalledWith(16);
    });

    it('should set version 4 in the UUID', async () => {
      const mockBytes = new Uint8Array(16).fill(0xff);
      mockGetRandomBytesAsync.mockResolvedValue(mockBytes);

      const uuid = await generateUUID();

      // The 13th character (index 14 after dashes) should be '4'
      const parts = uuid.split('-');
      expect(parts[2][0]).toBe('4');
    });

    it('should set variant bits correctly', async () => {
      const mockBytes = new Uint8Array(16).fill(0xff);
      mockGetRandomBytesAsync.mockResolvedValue(mockBytes);

      const uuid = await generateUUID();

      // The 17th character should be 8, 9, a, or b (variant 10)
      const parts = uuid.split('-');
      const variantChar = parts[3][0];
      expect(['8', '9', 'a', 'b']).toContain(variantChar);
    });

    it('should generate unique UUIDs', async () => {
      // First call
      mockGetRandomBytesAsync.mockResolvedValueOnce(
        new Uint8Array([
          0x11, 0x22, 0x33, 0x44, 0x55, 0x66, 0x77, 0x88, 0x99, 0xaa, 0xbb,
          0xcc, 0xdd, 0xee, 0xff, 0x00,
        ]),
      );

      // Second call
      mockGetRandomBytesAsync.mockResolvedValueOnce(
        new Uint8Array([
          0xaa, 0xbb, 0xcc, 0xdd, 0xee, 0xff, 0x00, 0x11, 0x22, 0x33, 0x44,
          0x55, 0x66, 0x77, 0x88, 0x99,
        ]),
      );

      const uuid1 = await generateUUID();
      const uuid2 = await generateUUID();

      expect(uuid1).not.toBe(uuid2);
    });

    it('should return a string of length 36', async () => {
      const mockBytes = new Uint8Array(16).fill(0);
      mockGetRandomBytesAsync.mockResolvedValue(mockBytes);

      const uuid = await generateUUID();

      expect(uuid.length).toBe(36);
    });

    it('should have correct dash positions', async () => {
      const mockBytes = new Uint8Array(16).fill(0);
      mockGetRandomBytesAsync.mockResolvedValue(mockBytes);

      const uuid = await generateUUID();

      expect(uuid[8]).toBe('-');
      expect(uuid[13]).toBe('-');
      expect(uuid[18]).toBe('-');
      expect(uuid[23]).toBe('-');
    });
  });

  describe('generateUUIDSync', () => {
    it('should generate a valid UUID v4 format', () => {
      const uuid = generateUUIDSync();

      expect(uuid).toMatch(
        /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/,
      );
    });

    it('should return a string of length 36', () => {
      const uuid = generateUUIDSync();

      expect(uuid.length).toBe(36);
    });

    it('should have version 4 in the correct position', () => {
      const uuid = generateUUIDSync();

      // The 15th character (index 14) should be '4'
      expect(uuid[14]).toBe('4');
    });

    it('should have correct variant bits', () => {
      const uuid = generateUUIDSync();

      // The 20th character (index 19) should be 8, 9, a, or b
      expect(['8', '9', 'a', 'b']).toContain(uuid[19]);
    });

    it('should have correct dash positions', () => {
      const uuid = generateUUIDSync();

      expect(uuid[8]).toBe('-');
      expect(uuid[13]).toBe('-');
      expect(uuid[18]).toBe('-');
      expect(uuid[23]).toBe('-');
    });

    it('should generate unique UUIDs', () => {
      const uuids = new Set<string>();

      for (let i = 0; i < 100; i++) {
        uuids.add(generateUUIDSync());
      }

      // All 100 UUIDs should be unique
      expect(uuids.size).toBe(100);
    });

    it('should only contain valid hex characters and dashes', () => {
      const uuid = generateUUIDSync();

      expect(uuid).toMatch(/^[0-9a-f-]+$/);
    });

    it('should have correct segment lengths', () => {
      const uuid = generateUUIDSync();
      const segments = uuid.split('-');

      expect(segments).toHaveLength(5);
      expect(segments[0]).toHaveLength(8);
      expect(segments[1]).toHaveLength(4);
      expect(segments[2]).toHaveLength(4);
      expect(segments[3]).toHaveLength(4);
      expect(segments[4]).toHaveLength(12);
    });
  });
});
