import {
  capitalize,
  isScreenPathname,
  keysToCamel,
  toCamelCase,
} from '../convert';

describe('Convert Utilities', () => {
  describe('toCamelCase', () => {
    it('should convert snake_case to camelCase', () => {
      expect(toCamelCase('hello_world')).toBe('helloWorld');
    });

    it('should handle multiple underscores', () => {
      expect(toCamelCase('hello_world_test')).toBe('helloWorldTest');
    });

    it('should return same string if no underscores', () => {
      expect(toCamelCase('hello')).toBe('hello');
    });

    it('should handle empty string', () => {
      expect(toCamelCase('')).toBe('');
    });
  });

  describe('keysToCamel', () => {
    it('should convert object keys from snake_case to camelCase', () => {
      const input = { hello_world: 'value' };
      const expected = { helloWorld: 'value' };
      expect(keysToCamel(input)).toEqual(expected);
    });

    it('should handle nested objects', () => {
      const input = {
        outer_key: {
          inner_key: 'value',
        },
      };
      const expected = {
        outerKey: {
          innerKey: 'value',
        },
      };
      expect(keysToCamel(input)).toEqual(expected);
    });

    it('should handle arrays', () => {
      const input = [{ foo_bar: 'a' }, { baz_qux: 'b' }];
      const expected = [{ fooBar: 'a' }, { bazQux: 'b' }];
      expect(keysToCamel(input)).toEqual(expected);
    });

    it('should handle null', () => {
      expect(keysToCamel(null)).toBeNull();
    });

    it('should handle primitive values', () => {
      expect(keysToCamel('string')).toBe('string');
      expect(keysToCamel(123)).toBe(123);
      expect(keysToCamel(true)).toBe(true);
    });

    it('should preserve Date objects', () => {
      const date = new Date('2024-01-01');
      expect(keysToCamel(date)).toEqual(date);
    });
  });

  describe('capitalize', () => {
    it('should capitalize the first letter of a string', () => {
      expect(capitalize('hello')).toBe('Hello');
    });

    it('should handle already capitalized string', () => {
      expect(capitalize('Hello')).toBe('Hello');
    });

    it('should handle all uppercase string', () => {
      expect(capitalize('HELLO')).toBe('HELLO');
    });

    it('should handle single character', () => {
      expect(capitalize('a')).toBe('A');
    });

    it('should return empty string for empty input', () => {
      expect(capitalize('')).toBe('');
    });

    it('should return empty string for undefined', () => {
      expect(capitalize(undefined)).toBe('');
    });

    it('should return empty string for null', () => {
      expect(capitalize(null)).toBe('');
    });

    it('should handle status-like values', () => {
      expect(capitalize('active')).toBe('Active');
      expect(capitalize('expired')).toBe('Expired');
      expect(capitalize('used')).toBe('Used');
    });

    it('should preserve rest of the string', () => {
      expect(capitalize('helloWorld')).toBe('HelloWorld');
      expect(capitalize('hello world')).toBe('Hello world');
    });
  });

  describe('isScreenPathname', () => {
    it('should match exact pathname', () => {
      expect(isScreenPathname('/profile', 'profile')).toBe(true);
    });

    it('should match pathname with dynamic segments', () => {
      expect(isScreenPathname('/movie/123', 'movie/[id]')).toBe(true);
    });

    it('should not match different pathnames', () => {
      expect(isScreenPathname('/home', 'profile')).toBe(false);
    });
  });
});
